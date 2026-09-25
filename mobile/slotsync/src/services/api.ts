import { Platform } from 'react-native';
import { getItem, setItem, removeItem, StorageKeys } from './storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

let memoryToken: string | null = null;

// Storage Helper
export const setStoredToken = async (token: string) => {
  memoryToken = token;
  await setItem(StorageKeys.TOKEN, token);
};

export const getStoredToken = async (): Promise<string | null> => {
  if (memoryToken) return memoryToken;
  const stored = await getItem(StorageKeys.TOKEN);
  if (stored) {
    memoryToken = stored;
    return stored;
  }
  return memoryToken;
};

export const removeStoredToken = async () => {
  memoryToken = null;
  await removeItem(StorageKeys.TOKEN);
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

export const sendForgotPasswordOtp = async (identifier: string) => {
  return apiFetch('/auth/forgot-password/send-otp', {
    method: 'POST',
    body: JSON.stringify({ identifier }),
  });
};

export const verifyForgotPasswordOtp = async (email: string, otp_code: string) => {
  return apiFetch('/auth/forgot-password/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp_code }),
  });
};

export const resetPassword = async (email: string, reset_token: string, new_password: string) => {
  return apiFetch('/auth/forgot-password/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, reset_token, new_password }),
  });
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
  phone_number?: string;
  gender?: string;
  date_of_birth?: string;
  marital_status?: string;
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

export const getCreatorAvailabilityRules = async (creatorId?: string) => {
  if (creatorId) {
    return apiFetch(`/availability/${creatorId}/rules`);
  }
  return apiFetch('/availability/me');
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

// Replace ALL availability rules in one call (backend replaces full schedule).
export const setAllAvailabilityRules = async (
  rules: { day_of_week: number; start_time: string; end_time: string }[]
) => {
  return apiFetch('/availability', {
    method: 'POST',
    body: JSON.stringify({ rules }),
  });
};

// Convenience: add a single rule by merging with existing rules then sending all
export const addAvailabilityRule = async (
  day_of_week: number,
  start_time: string,
  end_time: string,
  existingRules: { day_of_week: number; start_time: string; end_time: string }[] = []
) => {
  const newRules = [
    ...existingRules.map((r) => ({
      day_of_week: r.day_of_week,
      start_time: r.start_time,
      end_time: r.end_time,
    })),
    { day_of_week, start_time, end_time },
  ];
  return setAllAvailabilityRules(newRules);
};

// Convenience: delete a rule by id — filters it out from existing list then sends remainder
export const deleteAvailabilityRule = async (
  ruleId: string,
  existingRules: { id: string; day_of_week: number; start_time: string; end_time: string }[] = []
) => {
  const remaining = existingRules
    .filter((r) => r.id !== ruleId)
    .map((r) => ({
      day_of_week: r.day_of_week,
      start_time: r.start_time,
      end_time: r.end_time,
    }));
  return setAllAvailabilityRules(remaining);
};

// ── Profile & Account Management Endpoints ──

export const updateUserProfile = async (data: {
  full_name?: string;
  phone_number?: string;
  gender?: string;
  date_of_birth?: string;
  marital_status?: string;
  avatar_url?: string;
}) => {
  return apiFetch('/auth/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const updateCreatorProfile = async (data: {
  category?: string;
  title?: string;
  bio?: string;
  hourly_rate?: number;
  slot_duration_minutes?: number;
  timezone?: string;
}) => {
  return apiFetch('/creators/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const sendDeleteAccountOtp = async () => {
  return apiFetch('/auth/delete-account/send-otp', {
    method: 'POST',
  });
};

export const confirmDeleteAccount = async (payload: {
  otp_code: string;
  reason?: string;
  feedback?: string;
}) => {
  return apiFetch('/auth/delete-account/confirm', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const uploadAvatarImage = async (uri: string) => {
  const token = await getStoredToken();
  const formData = new FormData();
  const filename = uri.split('/').pop() || 'avatar.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';

  formData.append('file', {
    uri,
    name: filename,
    type,
  } as any);

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}/auth/upload-avatar`;
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errData = await response.json();
      if (errData.detail) {
        errorMessage = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch {}
    throw new Error(errorMessage);
  }

  return response.json();
};

// ── In-App Notifications Endpoints ──

export const getNotifications = async () => {
  return apiFetch('/notifications');
};

export const markNotificationRead = async (notificationId: string) => {
  return apiFetch(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
};

export const markAllNotificationsRead = async () => {
  return apiFetch('/notifications/read-all', {
    method: 'POST',
  });
};


