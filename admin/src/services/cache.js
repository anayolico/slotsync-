/**
 * SlotSync Admin — Professional API Cache
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  Strategy: Stale-While-Revalidate (SWR)                                 │
 * │                                                                         │
 * │  1. Fresh hit   → return immediately. Zero network requests.            │
 * │  2. Stale hit   → return old data instantly, revalidate in background.  │
 * │  3. Cache miss  → fetch, store, return. Deduplicated — parallel callers │
 * │                   share one in-flight Promise, not N requests.          │
 * │                                                                         │
 * │  Subscribers: components subscribe to cache keys and are notified       │
 * │  whenever a background revalidation writes fresh data. No polling       │
 * │  needed inside components.                                              │
 * │                                                                         │
 * │  Invalidation: tag-based. Every entry carries string tags.              │
 * │  invalidate('appointments') deletes all entries with that tag AND       │
 * │  cancels any pending in-flight dedup for those entries.                 │
 * │                                                                         │
 * │  Eviction: a periodic sweep removes entries that have been stale for    │
 * │  at least one full TTL and have no active subscribers.                  │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

// ── TTL constants (milliseconds) ─────────────────────────────────────────────
export const TTL = {
  SHORT:   30_000,   //  30 s  — volatile data  (appointments)
  MEDIUM: 120_000,   //   2 m  — moderate data  (creators, users)
  LONG:   300_000,   //   5 m  — stable data    (current user profile)
};

// ── Internal store ────────────────────────────────────────────────────────────
// Map<key, { data, expiresAt, ttl, tags }>
const _store = new Map();

// ── In-flight deduplication ───────────────────────────────────────────────────
// Map<key, Promise<data>>  — parallel callers share one network request
const _pending = new Map();

// ── Pub/Sub subscribers ───────────────────────────────────────────────────────
// Map<key, Set<(data) => void>>
const _subscribers = new Map();

// ── Eviction timer ────────────────────────────────────────────────────────────
let _evictionTimer = null;

// ─────────────────────────────────────────────────────────────────────────────
// Pub/Sub
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Subscribe to fresh data notifications for a cache key.
 * Returns an unsubscribe function — call it in a useEffect cleanup.
 *
 * @param {string}   key
 * @param {Function} callback  — (freshData) => void
 * @returns {() => void}  unsubscribe
 */
export function subscribe(key, callback) {
  if (!_subscribers.has(key)) _subscribers.set(key, new Set());
  _subscribers.get(key).add(callback);
  return () => _subscribers.get(key)?.delete(callback);
}

/** Notify all subscribers for a key with fresh data. */
function _notify(key, data) {
  _subscribers.get(key)?.forEach((cb) => {
    try {
      cb(data);
    } catch (err) {
      console.error(`[Cache] subscriber error for key "${key}":`, err);
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Store operations
// ─────────────────────────────────────────────────────────────────────────────

function _isStale(entry) {
  return Date.now() > entry.expiresAt;
}

/** Read from cache. Returns { data, stale } or null. */
export function cacheGet(key) {
  const entry = _store.get(key);
  if (!entry) return null;
  return { data: entry.data, stale: _isStale(entry) };
}

/** Write to cache. */
export function cacheSet(key, data, ttl = TTL.SHORT, tags = []) {
  _store.set(key, { data, expiresAt: Date.now() + ttl, ttl, tags });
}

/**
 * Invalidate all entries whose tags overlap with the given tags.
 * Also cancels pending in-flight deduplications for those entries,
 * preventing a just-invalidated in-flight fetch from overwriting the cache
 * once it eventually resolves.
 */
export function invalidate(...tags) {
  for (const [key, entry] of _store.entries()) {
    if (tags.some((t) => entry.tags.includes(t))) {
      _store.delete(key);
      _pending.delete(key); // cancel dedup — stale response must not be cached
    }
  }
}

/** Wipe everything — called on login / logout to prevent cross-session leaks. */
export function clearCache() {
  _store.clear();
  _pending.clear();
  // Intentionally keep _subscribers — React component lifecycle handles cleanup
}

// ─────────────────────────────────────────────────────────────────────────────
// Eviction
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Remove entries that have been stale for ≥ 1× their own TTL AND have no
 * active subscribers waiting for live updates. Runs every 5 minutes.
 */
function _evict() {
  const now = Date.now();
  for (const [key, entry] of _store.entries()) {
    const doubleStale = now > entry.expiresAt + entry.ttl;
    const hasSubscribers = (_subscribers.get(key)?.size ?? 0) > 0;
    if (doubleStale && !hasSubscribers) {
      _store.delete(key);
    }
  }
}

export function startEviction(intervalMs = 5 * 60_000) {
  if (_evictionTimer) return; // already running
  _evictionTimer = setInterval(_evict, intervalMs);
}

export function stopEviction() {
  if (_evictionTimer) {
    clearInterval(_evictionTimer);
    _evictionTimer = null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Core SWR fetch
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wraps any async fetcher with full SWR caching.
 *
 * @param {string}    key      — unique, stable cache key
 * @param {Function}  fetcher  — () => Promise<data>
 * @param {object}    opts
 *   @param {number}    ttl    — TTL in ms          (default: TTL.SHORT)
 *   @param {string[]}  tags   — invalidation tags  (default: [])
 *
 * @returns {Promise<data>}
 */
export async function cachedFetch(key, fetcher, opts = {}) {
  const { ttl = TTL.SHORT, tags = [] } = opts;

  const cached = cacheGet(key);

  // ── Case 1: Fresh ─────────────────────────────────────────────────────────
  if (cached && !cached.stale) {
    return cached.data;
  }

  // ── Case 2: Stale — serve immediately + background revalidation ──────────
  if (cached && cached.stale) {
    if (!_pending.has(key)) {
      // Deduplicated background revalidation
      const promise = fetcher()
        .then((fresh) => {
          // Only write back if the key wasn't invalidated while we were fetching
          if (_pending.has(key)) {
            cacheSet(key, fresh, ttl, tags);
            _notify(key, fresh);
          }
        })
        .catch((err) => {
          // Keep serving stale data; log but don't crash
          console.warn(`[Cache] background revalidation failed for "${key}":`, err.message);
        })
        .finally(() => {
          _pending.delete(key);
        });

      _pending.set(key, promise);
    }
    return cached.data; // return stale immediately — UI updates via subscriber
  }

  // ── Case 3: Miss — deduplicate parallel requests ──────────────────────────
  if (_pending.has(key)) {
    return _pending.get(key); // all parallel callers share one Promise
  }

  const promise = fetcher()
    .then((data) => {
      if (_pending.has(key)) {
        // Not invalidated while in-flight → safe to cache
        cacheSet(key, data, ttl, tags);
        _notify(key, data);
      }
      return data;
    })
    .catch((err) => {
      throw err; // re-throw so awaiting callers receive the error
    })
    .finally(() => {
      _pending.delete(key);
    });

  _pending.set(key, promise);
  return promise;
}
