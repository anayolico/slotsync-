import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, BackHandler, Animated, Easing, Platform } from 'react-native';
import { colors, radii, shadows } from '../theme/colors';
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

// Shared Screens
import SettingsScreen from '../screens/shared/SettingsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

// Lucide Icons
import {
  LayoutDashboard,
  Calendar,
  Inbox,
  Settings as SettingsIcon,
  Compass,
  Sparkles,
} from '../components/LucideIcons';

type AuthScreenState = 'CHOICE' | 'LOGIN' | 'REGISTER_CLIENT' | 'REGISTER_CREATOR' | 'FORGOT_PASSWORD';
type ClientTab = 'DISCOVER' | 'MY_BOOKINGS' | 'SETTINGS';
type CreatorTab = 'DASHBOARD' | 'SCHEDULE' | 'REQUESTS' | 'SETTINGS';

export default function AppNavigator() {
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const screenOffset = useRef(new Animated.Value(0)).current;
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

  useEffect(() => {
    screenOpacity.setValue(0);
    screenOffset.setValue(6);
    Animated.parallel([
      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(screenOffset, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [authScreen, clientTab, creatorTab, selectedCreator, screenOpacity, screenOffset]);

  // ── Loading Screen ──
  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingTitle}>Connecting to SlotSync...</Text>
          <Text style={styles.loadingSubtitle}>Securing your schedule environment</Text>
        </View>
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
      <Animated.View style={[styles.screenArea, { opacity: screenOpacity, transform: [{ translateY: screenOffset }] }]}>
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
            {creatorTab === 'SETTINGS' && (
              <SettingsScreen
                currentUser={currentUser}
                onLogout={handleLogout}
                onProfileUpdated={(updated) => setCurrentUser(updated)}
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
                  onNavigateToBookings={() => setClientTab('MY_BOOKINGS')}
                />
              )
            )}
            {clientTab === 'MY_BOOKINGS' && (
              <ClientAppointmentsScreen />
            )}
            {clientTab === 'SETTINGS' && (
              <SettingsScreen
                currentUser={currentUser}
                onLogout={handleLogout}
                onProfileUpdated={(updated) => setCurrentUser(updated)}
              />
            )}
          </>
        )}
      </Animated.View>

      {/* Modern High-End Floating Tab Bar */}
      <View style={styles.tabBar}>
        {isCreator ? (
          // Creator Tabs: Dashboard, Schedule, Requests, Settings
          <>
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setCreatorTab('DASHBOARD')}
              activeOpacity={0.7}
            >
              <View style={[styles.tabIconWrapper, creatorTab === 'DASHBOARD' && styles.tabIconWrapperActive]}>
                <LayoutDashboard
                  size={20}
                  color={creatorTab === 'DASHBOARD' ? colors.primary : colors.textDim}
                  strokeWidth={creatorTab === 'DASHBOARD' ? 2.5 : 1.9}
                />
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
              <View style={[styles.tabIconWrapper, creatorTab === 'SCHEDULE' && styles.tabIconWrapperActive]}>
                <Calendar
                  size={20}
                  color={creatorTab === 'SCHEDULE' ? colors.primary : colors.textDim}
                  strokeWidth={creatorTab === 'SCHEDULE' ? 2.5 : 1.9}
                />
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
              <View style={[styles.tabIconWrapper, creatorTab === 'REQUESTS' && styles.tabIconWrapperActive]}>
                <Inbox
                  size={20}
                  color={creatorTab === 'REQUESTS' ? colors.primary : colors.textDim}
                  strokeWidth={creatorTab === 'REQUESTS' ? 2.5 : 1.9}
                />
              </View>
              <Text style={[styles.tabLabel, creatorTab === 'REQUESTS' && styles.tabLabelActive]}>
                Requests
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setCreatorTab('SETTINGS')}
              activeOpacity={0.7}
            >
              <View style={[styles.tabIconWrapper, creatorTab === 'SETTINGS' && styles.tabIconWrapperActive]}>
                <SettingsIcon
                  size={20}
                  color={creatorTab === 'SETTINGS' ? colors.primary : colors.textDim}
                  strokeWidth={creatorTab === 'SETTINGS' ? 2.5 : 1.9}
                />
              </View>
              <Text style={[styles.tabLabel, creatorTab === 'SETTINGS' && styles.tabLabelActive]}>
                Settings
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          // Client Tabs: Discover, Bookings, Settings
          <>
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => {
                setSelectedCreator(null);
                setClientTab('DISCOVER');
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.tabIconWrapper, clientTab === 'DISCOVER' && styles.tabIconWrapperActive]}>
                <Compass
                  size={20}
                  color={clientTab === 'DISCOVER' ? colors.primary : colors.textDim}
                  strokeWidth={clientTab === 'DISCOVER' ? 2.5 : 1.9}
                />
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
              <View style={[styles.tabIconWrapper, clientTab === 'MY_BOOKINGS' && styles.tabIconWrapperActive]}>
                <Calendar
                  size={20}
                  color={clientTab === 'MY_BOOKINGS' ? colors.primary : colors.textDim}
                  strokeWidth={clientTab === 'MY_BOOKINGS' ? 2.5 : 1.9}
                />
              </View>
              <Text style={[styles.tabLabel, clientTab === 'MY_BOOKINGS' && styles.tabLabelActive]}>
                Bookings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setClientTab('SETTINGS')}
              activeOpacity={0.7}
            >
              <View style={[styles.tabIconWrapper, clientTab === 'SETTINGS' && styles.tabIconWrapperActive]}>
                <SettingsIcon
                  size={20}
                  color={clientTab === 'SETTINGS' ? colors.primary : colors.textDim}
                  strokeWidth={clientTab === 'SETTINGS' ? 2.5 : 1.9}
                />
              </View>
              <Text style={[styles.tabLabel, clientTab === 'SETTINGS' && styles.tabLabelActive]}>
                Settings
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
    padding: 24,
  },
  loadingCard: {
    backgroundColor: colors.bgCard,
    paddingVertical: 32,
    paddingHorizontal: 28,
    borderRadius: radii.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderColor,
    ...shadows.card,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
    marginTop: 18,
    letterSpacing: -0.2,
  },
  loadingSubtitle: {
    fontSize: 13,
    color: colors.textDim,
    marginTop: 4,
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
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.9)',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    ...shadows.cardHover,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 30,
    borderRadius: radii.pill,
    marginBottom: 2,
  },
  tabIconWrapperActive: {
    backgroundColor: colors.primaryWash,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textDim,
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
