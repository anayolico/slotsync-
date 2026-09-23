import { Platform } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

let memoryToken: string | null = null;

// Storage Helper
export const setStoredToken = async (token: string) => {
  memoryToken = token;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('slotsync_mobile_token', token);
    }
  } catch (e) {
    console.warn('Storage set error:', e);
  }
};

export const getStoredToken = async (): Promise<string | null> => {
  if (memoryToken) return memoryToken;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem('slotsync_mobile_token');
      if (stored) {
        memoryToken = stored;
        return stored;
      }
    }
  } catch (e) {
    console.warn('Storage get error:', e);
  }
  return memoryToken;
};

export const removeStoredToken = async () => {
  memoryToken = null;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('slotsync_mobile_token');
    }
  } catch (e) {
    console.warn('Storage remove error:', e);
  }
};

// Generic Fetch Wrapper
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getStoredToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errData = await response.json();
      if (errData.detail) {
        errorMessage = typeof errData.detail === 'string' 
          ? errData.detail 
          : JSON.stringify(errData.detail);
      }
    } catch {
      // Use fallback error message
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) return null;
  return response.json();
};

// ── Authentication Endpoints ──

export const sendEmailOtp = async (email: string) => {
  return apiFetch('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const verifyEmailOtp = async (email: string, otp_code: string) => {
  return apiFetch('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp_code }),
  });
};

export const loginWithGoogle = async (payload: {
  id_token?: string;
  access_token?: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  google_id?: string;
  role?: 'CLIENT' | 'CREATOR';
}) => {
  const data = await apiFetch('/auth/google', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (data?.access_token) {
    await setStoredToken(data.access_token);
  }
  return data;
};

export const logoutUser = async () => {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch (e) {
    console.warn('Backend logout warning:', e);
  } finally {
    await removeStoredToken();
  }
};

export const loginUser = async (email: string, password: string) => {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data?.access_token) {
    await setStoredToken(data.access_token);
  }
  return data;
};

export const registerUser = async (payload: {
  email: string;
  password: string;
  full_name: string;
  avatar_url?: string;
  google_id?: string;
  phone_number?: string;
  role: 'CLIENT' | 'CREATOR';
  category?: string;
  title?: string;
  bio?: string;
  hourly_rate?: number;
  slot_duration_minutes?: number;
  consultation_mode?: string;
  office_address?: string;
  currency?: string;
  verification_token?: string;
}) => {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getCurrentUser = async () => {
  return apiFetch('/auth/me');
};

export const registerFCMDevice = async (fcmToken: string, deviceType: string = Platform.OS) => {
  return apiFetch('/auth/devices', {
    method: 'POST',
    body: JSON.stringify({
      fcm_token: fcmToken,
      device_type: deviceType,
    }),
  });
};

// ── Creators & Slots Endpoints ──

export const getCreators = async (category?: string, query?: string) => {
  const params = new URLSearchParams();
  if (category && category !== 'ALL') params.append('category', category);
  if (query) params.append('query', query);
  
  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiFetch(`/creators${queryString}`);
};

export const getCreatorById = async (creatorId: string) => {
  return apiFetch(`/creators/${creatorId}`);
};

export const getCreatorAvailabilityRules = async (creatorId: string) => {
  return apiFetch(`/availability/${creatorId}/rules`);
};

export const getAvailableSlots = async (creatorId: string, date: string) => {
  return apiFetch(`/availability/${creatorId}/slots?date=${date}`);
};

// ── Appointments Endpoints ──

export const createAppointment = async (creator_id: string, start_time_utc: string, notes?: string) => {
  return apiFetch('/appointments', {
    method: 'POST',
    body: JSON.stringify({
      creator_id,
      start_time_utc,
      notes: notes || '',
    }),
  });
};

export const getMyAppointments = async () => {
  return apiFetch('/appointments/my-bookings');
};

export const getCreatorAppointments = async () => {
  return apiFetch('/appointments/creator-schedule');
};

export const updateAppointmentStatus = async (appointmentId: string, status: string) => {
  return apiFetch(`/appointments/${appointmentId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

// ── Creator Availability Rules Endpoints ──

export const addAvailabilityRule = async (
  day_of_week: number, 
  start_time: string, 
  end_time: string, 
  existingRules: any[] = []
) => {
  const newRule = { day_of_week, start_time, end_time };
  const rulesPayload = [
    ...existingRules.map(r => ({ day_of_week: r.day_of_week, start_time: r.start_time, end_time: r.end_time })),
    newRule
  ];

  return apiFetch('/availability', {
    method: 'POST',
    body: JSON.stringify({ rules: rulesPayload }),
  });
};

export const deleteAvailabilityRule = async (ruleId: string) => {
  return apiFetch(`/availability/${ruleId}`, {
    method: 'DELETE',
  });
};
