import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  TOKEN: 'slotsync_mobile_token',
  REMEMBER_ME: 'slotsync_remember_me',
  SAVED_EMAIL: 'slotsync_saved_email',
};

export const setItem = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
      } catch (e) {
        console.warn('Storage set fallback error:', e);
      }
    }
  }
};

export const getItem = async (key: string): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) return value;
  } catch (error) {
    // Fallback
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      console.warn('Storage get fallback error:', e);
    }
  }

  return null;
};

export const removeItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    // Fallback
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn('Storage remove fallback error:', e);
    }
  }
};
