import React, { useState, useEffect, useCallback } from 'react';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardOverview from './components/DashboardOverview';
import CreatorsView from './components/CreatorsView';
import AvailabilityView from './components/AvailabilityView';
import ServicesView from './components/ServicesView';
import AppointmentsView from './components/AppointmentsView';
import UsersView from './components/UsersView';
import SettingsView from './components/SettingsView';
import RightPanel from './components/RightPanel';

import { 
  checkBackendHealth, 
  getCreators, 
  getAppointments, 
  getCurrentUser,
  updateAppointmentStatus,
  getStoredToken,
  removeStoredToken
} from './services/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backendStatus, setBackendStatus] = useState('checking');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [creators, setCreators] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);

  // Title Mapping
  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':     return 'Admin Overview';
      case 'creators':      return 'Creator Profiles';
      case 'availability':  return 'Availability Rules';
      case 'services':      return 'Services & Slots';
      case 'appointments':  return 'All Appointments';
      case 'users':         return 'User Accounts';
      case 'settings':      return 'System Settings';
      default:              return 'Admin Overview';
    }
  };

  // Load all data from FastAPI
  const loadData = useCallback(async () => {
    try {
      const healthRes = await checkBackendHealth();
      setBackendStatus(healthRes.status === 'ok' ? 'online' : 'offline');

      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch {
        // Token expired or invalid → go back to login
        removeStoredToken();
        setIsAuthenticated(false);
        setCurrentUser(null);
        return;
      }

      try {
        const creatorsData = await getCreators();
        if (Array.isArray(creatorsData)) setCreators(creatorsData);
      } catch (e) {
        console.warn('Creators:', e.message);
      }

      try {
        const apptsData = await getAppointments();
        if (Array.isArray(apptsData)) setAppointments(apptsData);
      } catch (e) {
        console.warn('Appointments:', e.message);
      }
    } catch (err) {
      console.error('Load error:', err);
      setBackendStatus('offline');
    } finally {
      setLoading(false);
    }
  }, []);

  // On app mount, check if a token already exists (stay logged in after refresh)
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      loadData();
    } else {
      setLoading(false);
      setIsAuthenticated(false);
    }
  }, [loadData]);

  // Poll for fresh data every 30 seconds while authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, loadData]);

  const handleLoginSuccess = () => {
    loadData();
  };

  const handleLogout = () => {
    removeStoredToken();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCreators([]);
    setAppointments([]);
    setUsers([]);
  };

  const handleUpdateAppointmentStatus = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
      loadData();
    } catch (err) {
      alert(`Error updating appointment: ${err.message}`);
    }
  };

  // ── Loading spinner while checking stored token ──
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

  // ── Show Login Page if NOT authenticated ──
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // ── Tab Content Renderer ──
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
      case 'users':
        return <UsersView users={users} onUserCreated={loadData} />;
      case 'settings':
        return <SettingsView />;
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

  // ── Admin Dashboard (shown after login) ──
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
        <RightPanel appointments={appointments} />
      </div>
    </div>
  );
}
