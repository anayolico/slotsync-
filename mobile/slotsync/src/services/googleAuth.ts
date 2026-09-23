import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { useEffect } from 'react';

// Required for web & in-app browser redirect resolution
WebBrowser.maybeCompleteAuthSession();

export const GOOGLE_WEB_CLIENT_ID = '664852560596-58f5lnvhjqtpocn7uphv6v2k4o1re17l.apps.googleusercontent.com';

export interface GoogleUserProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
}

export const fetchGoogleUserInfo = async (accessToken: string): Promise<GoogleUserProfile> => {
  const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Google user profile.');
  }

  return response.json();
};

export const useGoogleAuth = (onSuccess: (profile: GoogleUserProfile, idToken?: string, accessToken?: string) => void) => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
    redirectUri: AuthSession.makeRedirectUri({
      scheme: 'slotsync',
      native: 'https://auth.expo.io/@anonymous/slotsync',
    }),
  });

  useEffect(() => {
    const handleResponse = async () => {
      if (response?.type === 'success') {
        const token = response.authentication?.accessToken || (response as any)?.params?.access_token;
        const idToken = response.authentication?.idToken || (response as any)?.params?.id_token;
        if (token) {
          try {
            const userProfile = await fetchGoogleUserInfo(token);
            onSuccess(userProfile, idToken, token);
          } catch (err) {
            console.error('Error fetching Google profile:', err);
          }
        }
      }
    };

    handleResponse();
  }, [response]);

  const signIn = async () => {
    try {
      await promptAsync();
    } catch (e) {
      console.error('Google Sign In Prompt Error:', e);
    }
  };

  return {
    signIn,
    isReady: !!request,
  };
};
