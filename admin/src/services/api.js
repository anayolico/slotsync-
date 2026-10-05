/**
 * SlotSync Admin — API Client
 *
 * All GET calls go through the SWR cache (see services/cache.js).
 * Components that need live updates should subscribe to a CACHE_KEY via
 * the `subscribe` re-export rather than passing onUpdate callbacks.
 *
 * All mutations (POST / PUT / PATCH) invalidate the relevant cache tags
 * so the next read always reflects the latest server state.
 */
import { cachedFetch, invalidate, clearCache, TTL, subscribe } from './cache.js';

// Re-export subscribe so components only need one import
export { subscribe };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const BACKEND_URL  = import.meta.env.VITE_BACKEND_URL  || '';

// ── Stable cache keys ─────────────────────────────────────────────────────────
// Export these so subscribers in App.jsx reference the exact same strings
// as the fetchers — no magic strings scattered across files.
export const CACHE_KEYS = {
  CURRENT_USER: 'auth:me',
  USERS:        'auth:users',
  CREATORS:     'creators:all',
  APPOINTMENTS: 'appointments:all',
};

// ── Token helpers ─────────────────────────────────────────────────────────────
export const getStoredToken    = ()      => localStorage.getItem('slotsync_token');
export const setStoredToken    = (token) => localStorage.setItem('slotsync_token', token);
export const removeStoredToken = ()      => {
  localStorage.removeItem('slotsync_token');
  clearCache(); // wipe all cached data so no stale data leaks between sessions
};

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function fetchWithAuth(url, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    removeStoredToken();
  }

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const errData = await response.json();
      if (errData.detail) {
        errorMessage = typeof errData.detail === 'string'
          ? errData.detail
          : JSON.stringify(errData.detail);
      }
    } catch {
      // fallback to status code message
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// ── Health Check ──────────────────────────────────────────────────────────────
export async function checkBackendHealth() {
  try {
    const endpoint = BACKEND_URL ? `${BACKEND_URL}/health` : '/health';
    const res = await fetch(endpoint);
    if (!res.ok) return { status: 'offline' };
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

// ── Auth Endpoints ────────────────────────────────────────────────────────────

export async function loginUser(email, password) {
  const data = await fetchWithAuth(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.access_token) {
    setStoredToken(data.access_token);
    clearCache(); // clear any stale data from a previous session
  }
  return data;
}

export async function registerUser(emailOrData, password, fullName, role = 'CLIENT', creatorData = {}, personalData = {}) {
  let body;
  if (typeof emailOrData === 'object' && emailOrData !== null) {
    body = emailOrData;
  } else {
    body = {
      email: emailOrData,
      password,
      full_name: fullName,
      role,
      ...personalData,
      ...(role === 'CREATOR' ? creatorData : {}),
    };
  }
  const result = await fetchWithAuth(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  invalidate('users');
  return result;
}

/** Current admin profile — cached 5 min. Subscribe via CACHE_KEYS.CURRENT_USER. */
export async function getCurrentUser() {
  return cachedFetch(
    CACHE_KEYS.CURRENT_USER,
    () => fetchWithAuth(`${API_BASE_URL}/auth/me`),
    { ttl: TTL.LONG, tags: ['currentUser'] },
  );
}

/** All platform users — cached 2 min. Subscribe via CACHE_KEYS.USERS. */
export async function getUsers() {
  return cachedFetch(
    CACHE_KEYS.USERS,
    () => fetchWithAuth(`${API_BASE_URL}/auth/users`),
    { ttl: TTL.MEDIUM, tags: ['users'] },
  );
}

// ── Creators Endpoints ────────────────────────────────────────────────────────

/** All creators — cached 2 min. Subscribe via CACHE_KEYS.CREATORS. */
export async function getCreators() {
  return cachedFetch(
    CACHE_KEYS.CREATORS,
    () => fetchWithAuth(`${API_BASE_URL}/creators`),
    { ttl: TTL.MEDIUM, tags: ['creators'] },
  );
}

export async function getCreatorById(id) {
  return cachedFetch(
    `creators:${id}`,
    () => fetchWithAuth(`${API_BASE_URL}/creators/${id}`),
    { ttl: TTL.MEDIUM, tags: ['creators'] },
  );
}

export async function updateCreatorProfile(data) {
  const result = await fetchWithAuth(`${API_BASE_URL}/creators/me`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  invalidate('creators');
  return result;
}

export async function updateCreatorProfileAdmin(creatorId, data) {
  const result = await fetchWithAuth(`${API_BASE_URL}/creators/${creatorId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  invalidate('creators');
  return result;
}

// ── Availability Endpoints ────────────────────────────────────────────────────

export async function getMyAvailabilityRules() {
  return cachedFetch(
    'availability:me',
    () => fetchWithAuth(`${API_BASE_URL}/availability/me`),
    { ttl: TTL.MEDIUM, tags: ['availability'] },
  );
}

export async function getAvailableSlots(creatorId, dateStr) {
  return cachedFetch(
    `availability:slots:${creatorId}:${dateStr}`,
    () => fetchWithAuth(`${API_BASE_URL}/availability/${creatorId}/slots?date=${dateStr}`),
    { ttl: TTL.SHORT, tags: ['availability', `creator:${creatorId}`] },
  );
}

export async function getAvailabilityRules(creatorId) {
  return cachedFetch(
    `availability:rules:${creatorId}`,
    () => fetchWithAuth(`${API_BASE_URL}/availability/${creatorId}/rules`),
    { ttl: TTL.MEDIUM, tags: ['availability', `creator:${creatorId}`] },
  );
}

export async function setCreatorAvailabilityRulesAdmin(creatorId, rules) {
  const result = await fetchWithAuth(`${API_BASE_URL}/availability/${creatorId}/rules`, {
    method: 'POST',
    body: JSON.stringify({ rules }),
  });
  invalidate('availability', `creator:${creatorId}`);
  return result;
}

// ── Appointments Endpoints ────────────────────────────────────────────────────

/** All appointments — cached 30 s. Subscribe via CACHE_KEYS.APPOINTMENTS. */
export async function getAppointments() {
  return cachedFetch(
    CACHE_KEYS.APPOINTMENTS,
    () => fetchWithAuth(`${API_BASE_URL}/appointments`),
    { ttl: TTL.SHORT, tags: ['appointments'] },
  );
}

export async function createAppointment(creatorId, startTimeUtc, notes = '') {
  const result = await fetchWithAuth(`${API_BASE_URL}/appointments`, {
    method: 'POST',
    body: JSON.stringify({ creator_id: creatorId, start_time_utc: startTimeUtc, notes }),
  });
  invalidate('appointments');
  return result;
}

export async function updateAppointmentStatus(id, status) {
  const result = await fetchWithAuth(`${API_BASE_URL}/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  invalidate('appointments');
  return result;
}
