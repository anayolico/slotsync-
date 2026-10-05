import React, { useState, useEffect, useCallback } from 'react';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardOverview from './components/DashboardOverview';
import CreatorsView from './components/CreatorsView';
import AvailabilityView from './components/AvailabilityView';
import ServicesView from './components/ServicesView';
import AppointmentsView from './components/AppointmentsView';
import ClientsView from './components/ClientsView';
import LiveScheduleView from './components/LiveScheduleView';
import UsersView from './components/UsersView';
import NotificationsView from './components/NotificationsView';

import {
  checkBackendHealth,
  getCreators,
  getAppointments,
  getUsers,
  getCurrentUser,
  updateAppointmentStatus,
  getStoredToken,
  removeStoredToken,
  subscribe,
  CACHE_KEYS,
} from './services/api';

import { startEviction, stopEviction } from './services/cache';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab]             = useState('dashboard');
  const [backendStatus, setBackendStatus]     = useState('checking');
  const [loading, setLoading]                 = useState(true);
  const [currentUser, setCurrentUser]         = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [creators,     setCreators]     = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [users,        setUsers]        = useState([]);

  // ── Title Mapping ──────────────────────────────────────────────────────────
  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':     return 'Admin Overview';
      case 'creators':      return 'Creator Profiles';
      case 'clients':       return 'Client Profiles';
      case 'users':         return 'User Accounts';
      case 'availability':  return 'Availability Rules';
      case 'services':      return 'Services & Slots';
      case 'appointments':  return 'All Appointments';
      case 'liveschedule':  return 'Live Schedule';
      case 'notifications': return 'Notifications';
      default:              return 'Admin Overview';
    }
  };

  // ── Cache eviction lifecycle ───────────────────────────────────────────────
  // Start a background sweep that evicts orphaned expired entries every 5 min.
  // Stopped when the app unmounts (e.g. during HMR or test teardown).
  useEffect(() => {
    startEviction();
    return () => stopEviction();
  }, []);

  // ── Cache subscribers ──────────────────────────────────────────────────────
  // These fire whenever a background SWR revalidation completes.
  // Using the subscribe() model means no fragile per-call onUpdate callbacks —
  // all callers of getCreators(), getAppointments(), etc. benefit automatically.
  useEffect(() => {
    const unsubs = [
      subscribe(CACHE_KEYS.CURRENT_USER,   (fresh) => setCurrentUser(fresh)),
      subscribe(CACHE_KEYS.CREATORS,       (fresh) => { if (Array.isArray(fresh)) setCreators(fresh); }),
      subscribe(CACHE_KEYS.APPOINTMENTS,   (fresh) => { if (Array.isArray(fresh)) setAppointments(fresh); }),
      subscribe(CACHE_KEYS.USERS,          (fresh) => { if (Array.isArray(fresh)) setUsers(fresh); }),
    ];
    // Return cleanup — unsubscribes all on unmount to prevent stale closures
    return () => unsubs.forEach((unsub) => unsub());
  }, []); // stable: setters from useState are always the same reference

  // ── Initial data load (cache-aware) ───────────────────────────────────────
  // On a fresh load: awaits network.
  // On a repeat call (e.g. 30 s poll): returns from cache instantly if fresh,
  // or returns stale data + triggers background revalidation (SWR).
  const loadData = useCallback(async () => {
    try {
      const healthRes = await checkBackendHealth();
      setBackendStatus(healthRes.status === 'ok' ? 'online' : 'offline');

      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch {
        // Token expired or invalid → back to login
        removeStoredToken();
        setIsAuthenticated(false);
        setCurrentUser(null);
        return;
      }

      try {
        const creatorsData = await getCreators();
        if (Array.isArray(creatorsData)) setCreators(creatorsData);
      } catch (e) {
        console.warn('[App] Creators load failed:', e.message);
      }

      try {
        const apptsData = await getAppointments();
        if (Array.isArray(apptsData)) setAppointments(apptsData);
      } catch (e) {
        console.warn('[App] Appointments load failed:', e.message);
      }

      try {
        const usersData = await getUsers();
        if (Array.isArray(usersData)) setUsers(usersData);
      } catch (e) {
        console.warn('[App] Users load failed:', e.message);
      }
    } catch (err) {
      console.error('[App] Load error:', err);
      setBackendStatus('offline');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── On mount — check for existing token (stay logged in after refresh) ────
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      loadData();
    } else {
      setLoading(false);
      setIsAuthenticated(false);
    }
  }, [loadData]);

  // ── Heartbeat poll — triggers SWR revalidation every 30 s ─────────────────
  // With caching, this is cheap: fresh data returns instantly from cache.
  // When data is stale, SWR serves it immediately and revalidates in the
  // background; the subscriber above then pushes fresh data to state.
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(loadData, 30_000);
    return () => clearInterval(interval);
  }, [isAuthenticated, loadData]);

  const handleLoginSuccess = () => {
    setActiveTab('dashboard');
    loadData();
  };

  const handleLogout = () => {
    removeStoredToken(); // also calls clearCache()
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab('dashboard');
    setCreators([]);
    setAppointments([]);
    setUsers([]);
  };

  const handleUpdateAppointmentStatus = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status); // invalidates 'appointments' tag
      loadData(); // triggers immediate SWR revalidation
    } catch (err) {
      alert(`Error updating appointment: ${err.message}`);
    }
  };

  // ── Loading spinner while checking stored token ────────────────────────────
  if (loading) {
    return (
      <div style={{
        width: '100%', minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1.25rem',
        color: '#a5b4fc', fontFamily: "'Outfit', sans-serif",
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          border: '3px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
          Connecting to SlotSync Engine…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Show Login Page if NOT authenticated ───────────────────────────────────
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // ── Tab Content Renderer ───────────────────────────────────────────────────
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview
            creators={creators}
            appointments={appointments}
            users={users}
            setActiveTab={setActiveTab}
          />
        );
      case 'creators':
        return <CreatorsView creators={creators} onCreatorUpdated={loadData} />;
      case 'availability':
        return <AvailabilityView creators={creators} />;
      case 'services':
        return <ServicesView creators={creators} />;
      case 'appointments':
        return (
          <AppointmentsView
            appointments={appointments}
            onUpdateStatus={handleUpdateAppointmentStatus}
          />
        );
      case 'clients':
        return <ClientsView users={users} appointments={appointments} />;
      case 'users':
        return <UsersView users={users} onUserCreated={loadData} />;
      case 'liveschedule':
        return <LiveScheduleView appointments={appointments} />;
      case 'notifications':
        return <NotificationsView users={users} appointments={appointments} creators={creators} />;
      default:
        return (
          <DashboardOverview
            creators={creators}
            appointments={appointments}
            users={users}
            setActiveTab={setActiveTab}
          />
        );
    }
  };

  // ── Admin Dashboard ────────────────────────────────────────────────────────
  return (
    <div className="app-frame">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendStatus={backendStatus}
        onLogout={handleLogout}
        mobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />
      <div className="content-wrapper">
        <main className="center-column">
          <Header
            pageTitle={getPageTitle()}
            currentUser={currentUser}
            onLogout={handleLogout}
            onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
          />
          {renderActiveTabContent()}
        </main>
      </div>
    </div>
  );
}
