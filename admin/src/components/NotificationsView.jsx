import React from 'react';
import { Bell, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function NotificationsView() {
  const notifications = [
    { title: 'New Booking Confirmed', message: 'Simmons booked a UI/UX session for Sept 16.', time: '10 mins ago', type: 'success' },
    { title: 'Creator Account Registered', message: 'Alex Rivera registered a new creator profile.', time: '2 hours ago', type: 'info' },
    { title: 'FastAPI Backend Synced', message: 'Connection to SQLite database active on port 8000.', time: '1 day ago', type: 'success' },
  ];

  return (
    <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
        <Bell size={20} style={{ color: '#4f46e5' }} />
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>System Notifications</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {notifications.map((n, idx) => (
          <div key={idx} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)'
          }}>
            {n.type === 'success' ? (
              <CheckCircle2 size={18} style={{ color: 'var(--success)', marginTop: '0.1rem' }} />
            ) : (
              <Info size={18} style={{ color: '#3b82f6', marginTop: '0.1rem' }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{n.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{n.message}</div>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
