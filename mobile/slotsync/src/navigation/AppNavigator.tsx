import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, BackHandler } from 'react-native';
import { colors, radii } from '../theme/colors';
import { getCurrentUser, getStoredToken, removeStoredToken, logoutUser } from '../services/api';

// Auth Screens
import AuthChoiceScreen from '../screens/auth/AuthChoiceScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterClientScreen from '../screens/auth/RegisterClientScreen';
import RegisterCreatorScreen from '../screens/auth/RegisterCreatorScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Client Screens
import ClientHomeScreen from '../screens/client/ClientHomeScreen';
import CreatorDetailScreen from '../screens/client/CreatorDetailScreen';
import ClientAppointmentsScreen from '../screens/client/ClientAppointmentsScreen';

// Creator Screens
import CreatorDashboardScreen from '../screens/creator/CreatorDashboardScreen';
import ManageAvailabilityScreen from '../screens/creator/ManageAvailabilityScreen';
import CreatorAppointmentsScreen from '../screens/creator/CreatorAppointmentsScreen';

// Shared Profile Screen
import ProfileScreen from '../screens/shared/ProfileScreen';

type AuthScreenState = 'CHOICE' | 'LOGIN' | 'REGISTER_CLIENT' | 'REGISTER_CREATOR' | 'FORGOT_PASSWORD';
type ClientTab = 'DISCOVER' | 'MY_BOOKINGS' | 'PROFILE';
type CreatorTab = 'DASHBOARD' | 'SCHEDULE' | 'REQUESTS' | 'PROFILE';

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // Auth Screen Router
  const [authScreen, setAuthScreen] = useState<AuthScreenState>('CHOICE');
  const [prefilledLoginEmail, setPrefilledLoginEmail] = useState<string>('');

  // Client Tab & Detail Router
  const [clientTab, setClientTab] = useState<ClientTab>('DISCOVER');
  const [selectedCreator, setSelectedCreator] = useState<any | null>(null);

  // Creator Tab Router
  const [creatorTab, setCreatorTab] = useState<CreatorTab>('DASHBOARD');

  // Hardware and gesture back handler listener
  useEffect(() => {
    const backAction = () => {
      if (!isAuthenticated) {
        if (authScreen !== 'CHOICE') {
          setAuthScreen('CHOICE');
          return true;
        }
      } else {
        if (selectedCreator) {
          setSelectedCreator(null);
          return true;
        }
        if (clientTab !== 'DISCOVER') {
          setClientTab('DISCOVER');
          return true;
        }
        if (creatorTab !== 'DASHBOARD') {
          setCreatorTab('DASHBOARD');
          return true;
        }
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [isAuthenticated, authScreen, selectedCreator, clientTab, creatorTab]);

  // Load user data on startup
  const checkAuth = useCallback(async () => {
    try {
      const token = await getStoredToken();
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      const user = await getCurrentUser();
      setCurrentUser(user);
      setIsAuthenticated(true);
      setClientTab('DISCOVER');
      setCreatorTab('DASHBOARD');
      setSelectedCreator(null);
    } catch {
      await removeStoredToken();
      setIsAuthenticated(false);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn('Logout error:', e);
    }
    await removeStoredToken();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setClientTab('DISCOVER');
    setCreatorTab('DASHBOARD');
    setSelectedCreator(null);
    setAuthScreen('CHOICE');
  };

  const handleLoginSuccess = () => {
    setClientTab('DISCOVER');
    setCreatorTab('DASHBOARD');
    setSelectedCreator(null);
    setLoading(true);
    checkAuth();
  };

  // ── Loading Screen ──
  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingTitle}>Connecting to SlotSync Engine...</Text>
      </View>
    );
  }

  // ── Unauthenticated Flow ──
  if (!isAuthenticated) {
    switch (authScreen) {
      case 'CHOICE':
        return (
          <AuthChoiceScreen
            onSelectRole={(role) => 
              setAuthScreen(role === 'CLIENT' ? 'REGISTER_CLIENT' : 'REGISTER_CREATOR')
            }
            onGoToLogin={() => setAuthScreen('LOGIN')}
          />
        );
      case 'LOGIN':
        return (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onGoToRegister={() => setAuthScreen('CHOICE')}
            onGoToForgotPassword={() => setAuthScreen('FORGOT_PASSWORD')}
            initialEmail={prefilledLoginEmail}
          />
        );
      case 'FORGOT_PASSWORD':
        return (
          <ForgotPasswordScreen
            onBackToLogin={() => setAuthScreen('LOGIN')}
            onPasswordResetSuccess={(email) => {
              setPrefilledLoginEmail(email);
              setAuthScreen('LOGIN');
            }}
          />
        );
      case 'REGISTER_CLIENT':
        return (
          <RegisterClientScreen
            onRegisterSuccess={handleLoginSuccess}
            onBackToChoice={() => setAuthScreen('CHOICE')}
          />
        );
      case 'REGISTER_CREATOR':
        return (
          <RegisterCreatorScreen
            onRegisterSuccess={handleLoginSuccess}
            onBackToChoice={() => setAuthScreen('CHOICE')}
          />
        );
      default:
        return (
          <AuthChoiceScreen
            onSelectRole={(role) => 
              setAuthScreen(role === 'CLIENT' ? 'REGISTER_CLIENT' : 'REGISTER_CREATOR')
            }
            onGoToLogin={() => setAuthScreen('LOGIN')}
          />
        );
    }
  }

  // ── Authenticated Flow ──
  const isCreator = currentUser?.role === 'CREATOR';

  return (
    <View style={styles.appFrame}>
      <View style={styles.screenArea}>
        {isCreator ? (
          // ── Creator Flow ──
          <>
            {creatorTab === 'DASHBOARD' && (
              <CreatorDashboardScreen
                currentUser={currentUser}
                onNavigateToSchedule={() => setCreatorTab('SCHEDULE')}
                onNavigateToBookings={() => setCreatorTab('REQUESTS')}
              />
            )}
            {creatorTab === 'SCHEDULE' && (
              <ManageAvailabilityScreen
                currentUser={currentUser}
              />
            )}
            {creatorTab === 'REQUESTS' && (
              <CreatorAppointmentsScreen />
            )}
            {creatorTab === 'PROFILE' && (
              <ProfileScreen
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            )}
          </>
        ) : (
          // ── Client Flow ──
          <>
            {clientTab === 'DISCOVER' && (
              selectedCreator ? (
                <CreatorDetailScreen
                  creator={selectedCreator}
                  onBack={() => setSelectedCreator(null)}
                  onBookingSuccess={() => {
                    setSelectedCreator(null);
                    setClientTab('MY_BOOKINGS');
                  }}
                />
              ) : (
                <ClientHomeScreen
                  currentUser={currentUser}
                  onSelectCreator={(creator) => setSelectedCreator(creator)}
                />
              )
            )}
            {clientTab === 'MY_BOOKINGS' && (
              <ClientAppointmentsScreen />
            )}
            {clientTab === 'PROFILE' && (
              <ProfileScreen
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            )}
          </>
        )}
      </View>

      {/* Bottom Navigation Tab Bar (Stitch Design Spec) */}
      <View style={styles.tabBar}>
        {isCreator ? (
          // Creator Tabs: Dashboard, Schedule, Requests, Profile
          <>
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setCreatorTab('DASHBOARD')}
              activeOpacity={0.7}
            >
              <View style={styles.tabIconWrapper}>
                <Text style={styles.tabIcon}>📊</Text>
                {creatorTab === 'DASHBOARD' && <View style={styles.activeDot} />}
              </View>
              <Text style={[styles.tabLabel, creatorTab === 'DASHBOARD' && styles.tabLabelActive]}>
                Dashboard
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setCreatorTab('SCHEDULE')}
              activeOpacity={0.7}
            >
              <View style={styles.tabIconWrapper}>
                <Text style={styles.tabIcon}>⏰</Text>
                {creatorTab === 'SCHEDULE' && <View style={styles.activeDot} />}
              </View>
              <Text style={[styles.tabLabel, creatorTab === 'SCHEDULE' && styles.tabLabelActive]}>
                Schedule
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setCreatorTab('REQUESTS')}
              activeOpacity={0.7}
            >
              <View style={styles.tabIconWrapper}>
                <Text style={styles.tabIcon}>📬</Text>
                <View style={styles.badgePulseDot} />
                {creatorTab === 'REQUESTS' && <View style={styles.activeDot} />}
              </View>
              <Text style={[styles.tabLabel, creatorTab === 'REQUESTS' && styles.tabLabelActive]}>
                Requests
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setCreatorTab('PROFILE')}
              activeOpacity={0.7}
            >
              <View style={styles.tabIconWrapper}>
                <Text style={styles.tabIcon}>👤</Text>
                {creatorTab === 'PROFILE' && <View style={styles.activeDot} />}
              </View>
              <Text style={[styles.tabLabel, creatorTab === 'PROFILE' && styles.tabLabelActive]}>
                Profile
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          // Client Tabs: Discover, Bookings, Profile
          <>
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => {
                setSelectedCreator(null);
                setClientTab('DISCOVER');
              }}
              activeOpacity={0.7}
            >
              <View style={styles.tabIconWrapper}>
                <Text style={styles.tabIcon}>🔍</Text>
                {clientTab === 'DISCOVER' && <View style={styles.activeDot} />}
              </View>
              <Text style={[styles.tabLabel, clientTab === 'DISCOVER' && styles.tabLabelActive]}>
                Discover
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setClientTab('MY_BOOKINGS')}
              activeOpacity={0.7}
            >
              <View style={styles.tabIconWrapper}>
                <Text style={styles.tabIcon}>📅</Text>
                <View style={styles.badgeNumber}>
                  <Text style={styles.badgeNumberText}>2</Text>
                </View>
                {clientTab === 'MY_BOOKINGS' && <View style={styles.activeDot} />}
              </View>
              <Text style={[styles.tabLabel, clientTab === 'MY_BOOKINGS' && styles.tabLabelActive]}>
                Bookings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setClientTab('PROFILE')}
              activeOpacity={0.7}
            >
              <View style={styles.tabIconWrapper}>
                <Text style={styles.tabIcon}>👤</Text>
                {clientTab === 'PROFILE' && <View style={styles.activeDot} />}
              </View>
              <Text style={[styles.tabLabel, clientTab === 'PROFILE' && styles.tabLabelActive]}>
                Profile
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: colors.bgApp,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  appFrame: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  screenArea: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 10,
    paddingBottom: 22,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 28,
  },
  tabIcon: {
    fontSize: 20,
  },
  activeDot: {
    position: 'absolute',
    bottom: -4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
  },
  badgePulseDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  badgeNumber: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: colors.primary,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  badgeNumberText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textDim,
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '800',
  },
});

