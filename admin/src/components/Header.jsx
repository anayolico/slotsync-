import React from 'react';
import { Menu } from 'lucide-react';

export default function Header({ pageTitle = "Admin Overview", currentUser, onLogout, onToggleMobileMenu }) {
  return (
    <header className="top-nav-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Mobile Navigation Drawer Toggle */}
        <button 
          className="hamburger-toggle-btn" 
          onClick={onToggleMobileMenu}
          aria-label="Open Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <h1 className="top-page-title">{pageTitle}</h1>
      </div>

      <div className="header-right-tools">
        {/* Admin Avatar + Name */}
        <div className="user-avatar-pill" style={{ cursor: 'default' }}>
          <div className="user-avatar-img">
            {currentUser?.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, lineHeight: 1.1, color: 'var(--text-main)' }}>
              {currentUser ? currentUser.full_name : 'Admin User'}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#4f46e5', fontWeight: 600 }}>
              {currentUser ? currentUser.role : 'ADMIN'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

