import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, radii } from '../theme/colors';
import { getCurrentUser, getStoredToken, removeStoredToken } from '../services/api';

// Auth Screens
import AuthChoiceScreen from '../screens/auth/AuthChoiceScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterClientScreen from '../screens/auth/RegisterClientScreen';
import RegisterCreatorScreen from '../screens/auth/RegisterCreatorScreen';

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

type AuthScreenState = 'CHOICE' | 'LOGIN' | 'REGISTER_CLIENT' | 'REGISTER_CREATOR';
type ClientTab = 'DISCOVER' | 'MY_BOOKINGS' | 'PROFILE';
type CreatorTab = 'DASHBOARD' | 'SCHEDULE' | 'REQUESTS' | 'PROFILE';

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // Auth Screen Router
  const [authScreen, setAuthScreen] = useState<AuthScreenState>('CHOICE');

  // Client Tab & Detail Router
  const [clientTab, setClientTab] = useState<ClientTab>('DISCOVER');
  const [selectedCreator, setSelectedCreator] = useState<any | null>(null);

  // Creator Tab Router
  const [creatorTab, setCreatorTab] = useState<CreatorTab>('DASHBOARD');

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
    await removeStoredToken();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAuthScreen('CHOICE');
  };

  const handleLoginSuccess = () => {
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

      {/* Bottom Navigation Tab Bar */}
      <View style={styles.tabBar}>
        {isCreator ? (
          // Creator Tabs
          <>
            <TouchableOpacity
              style={[styles.tabItem, creatorTab === 'DASHBOARD' && styles.tabItemActive]}
              onPress={() => setCreatorTab('DASHBOARD')}
            >
              <Text style={styles.tabIcon}>📊</Text>
              <Text style={[styles.tabLabel, creatorTab === 'DASHBOARD' && styles.tabLabelActive]}>
                Dashboard
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, creatorTab === 'SCHEDULE' && styles.tabItemActive]}
              onPress={() => setCreatorTab('SCHEDULE')}
            >
              <Text style={styles.tabIcon}>⏰</Text>
              <Text style={[styles.tabLabel, creatorTab === 'SCHEDULE' && styles.tabLabelActive]}>
                Schedule
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, creatorTab === 'REQUESTS' && styles.tabItemActive]}
              onPress={() => setCreatorTab('REQUESTS')}
            >
              <Text style={styles.tabIcon}>📬</Text>
              <Text style={[styles.tabLabel, creatorTab === 'REQUESTS' && styles.tabLabelActive]}>
                Requests
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, creatorTab === 'PROFILE' && styles.tabItemActive]}
              onPress={() => setCreatorTab('PROFILE')}
            >
              <Text style={styles.tabIcon}>👤</Text>
              <Text style={[styles.tabLabel, creatorTab === 'PROFILE' && styles.tabLabelActive]}>
                Profile
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          // Client Tabs
          <>
            <TouchableOpacity
              style={[styles.tabItem, clientTab === 'DISCOVER' && styles.tabItemActive]}
              onPress={() => {
                setSelectedCreator(null);
                setClientTab('DISCOVER');
              }}
            >
              <Text style={styles.tabIcon}>🔍</Text>
              <Text style={[styles.tabLabel, clientTab === 'DISCOVER' && styles.tabLabelActive]}>
                Discover
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, clientTab === 'MY_BOOKINGS' && styles.tabItemActive]}
              onPress={() => setClientTab('MY_BOOKINGS')}
            >
              <Text style={styles.tabIcon}>📅</Text>
              <Text style={[styles.tabLabel, clientTab === 'MY_BOOKINGS' && styles.tabLabelActive]}>
                Bookings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, clientTab === 'PROFILE' && styles.tabItemActive]}
              onPress={() => setClientTab('PROFILE')}
            >
              <Text style={styles.tabIcon}>👤</Text>
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
    backgroundColor: colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: colors.borderColor,
    paddingVertical: 8,
    paddingBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabItemActive: {},
  tabIcon: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '800',
  },
});
