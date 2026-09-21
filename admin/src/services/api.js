// API Client for SlotSync FastAPI Backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export const getStoredToken = () => localStorage.getItem('slotsync_token');
export const setStoredToken = (token) => localStorage.setItem('slotsync_token', token);
export const removeStoredToken = () => localStorage.removeItem('slotsync_token');

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

// ─── Health Check ────────────────────────────────────────────────────────────

export async function checkBackendHealth() {
  try {
    const healthEndpoint = BACKEND_URL ? `${BACKEND_URL}/health` : '/health';
    const res = await fetch(healthEndpoint);
    if (!res.ok) return { status: 'offline' };
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

// ─── Auth Endpoints ──────────────────────────────────────────────────────────

export async function loginUser(email, password) {
  const data = await fetchWithAuth(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.access_token) {
    setStoredToken(data.access_token);
  }
  return data;
}

export async function registerUser(email, password, fullName, role = 'CLIENT', creatorData = {}) {
  const body = {
    email,
    password,
    full_name: fullName,
    role,
    ...(role === 'CREATOR' ? creatorData : {})
  };
  return await fetchWithAuth(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getCurrentUser() {
  return await fetchWithAuth(`${API_BASE_URL}/auth/me`);
}

// ─── Creators Endpoints ──────────────────────────────────────────────────────

export async function getCreators() {
  return await fetchWithAuth(`${API_BASE_URL}/creators`);
}

export async function getCreatorById(id) {
  return await fetchWithAuth(`${API_BASE_URL}/creators/${id}`);
}

export async function updateCreatorProfile(data) {
  return await fetchWithAuth(`${API_BASE_URL}/creators/me`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updateCreatorProfileAdmin(creatorId, data) {
  return await fetchWithAuth(`${API_BASE_URL}/creators/${creatorId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ─── Availability Endpoints ──────────────────────────────────────────────────
// Routes defined in server/app/api/v1/endpoints/availability.py:
//   POST /availability              → set_creator_availability (creator auth required)
//   GET  /availability/me           → get_my_availability (creator auth required)
//   GET  /availability/{id}/slots   → get_creator_slots (public, ?date=YYYY-MM-DD)

export async function getMyAvailabilityRules() {
  return await fetchWithAuth(`${API_BASE_URL}/availability/me`);
}

export async function getAvailableSlots(creatorId, dateStr) {
  return await fetchWithAuth(`${API_BASE_URL}/availability/${creatorId}/slots?date=${dateStr}`);
}

export async function getAvailabilityRules(creatorId) {
  return await fetchWithAuth(`${API_BASE_URL}/availability/${creatorId}/rules`);
}

export async function setCreatorAvailabilityRulesAdmin(creatorId, rules) {
  return await fetchWithAuth(`${API_BASE_URL}/availability/${creatorId}/rules`, {
    method: 'POST',
    body: JSON.stringify({ rules }),
  });
}

// ─── Appointments Endpoints ──────────────────────────────────────────────────

export async function getAppointments() {
  return await fetchWithAuth(`${API_BASE_URL}/appointments`);
}

export async function createAppointment(creatorId, startTimeUtc, notes = '') {
  return await fetchWithAuth(`${API_BASE_URL}/appointments`, {
    method: 'POST',
    body: JSON.stringify({ creator_id: creatorId, start_time_utc: startTimeUtc, notes }),
  });
}

export async function updateAppointmentStatus(id, status) {
  return await fetchWithAuth(`${API_BASE_URL}/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
