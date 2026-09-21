import React from 'react';
import { 
  LayoutDashboard, 
  UserCheck, 
  Clock, 
  Calendar, 
  Users,
  Settings,
  Sparkles,
  X
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, backendStatus, onLogout, mobileOpen, onCloseMobile }) {
  const navItems = [
    { id: 'dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { id: 'creators', label: 'Creator Profiles', icon: UserCheck },
    { id: 'availability', label: 'Availability Rules', icon: Clock },
    { id: 'appointments', label: 'All Appointments', icon: Calendar },
    { id: 'users', label: 'User Accounts', icon: Users },
    { id: 'settings', label: 'Server Settings', icon: Settings },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <div 
        className={`sidebar-backdrop ${mobileOpen ? 'active' : ''}`} 
        onClick={onCloseMobile} 
        aria-hidden="true"
      />

      <aside className={`consult-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="brand-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="brand-logo-icon">
              <Sparkles size={22} />
            </div>
            <div>
              <span className="brand-title">SLOTSYNC</span>
              <div style={{ fontSize: '0.675rem', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.08em' }}>
                ADMIN PORTAL
              </div>
            </div>
          </div>

          {/* Close Button for Mobile Drawer */}
          <button 
            className="sidebar-mobile-close" 
            onClick={onCloseMobile}
            aria-label="Close Mobile Navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon className="link-icon" size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Admin Engine Status / Logout Widget */}
        <div className="pro-upgrade-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <button className="btn-upgrade" onClick={onLogout}
            style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

