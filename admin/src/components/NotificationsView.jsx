import React, { useMemo } from 'react';
import { Bell, CheckCircle2, UserPlus, CalendarCheck, AlertCircle, Clock } from 'lucide-react';

function timeAgo(dateStr) {
  if (!dateStr) return 'Recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hrs > 0) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  if (mins > 0) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  return 'Just now';
}

export default function NotificationsView({ users = [], appointments = [], creators = [] }) {
  const notifications = useMemo(() => {
    const items = [];

    [...users]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .forEach(u => {
        items.push({
          id: `user-${u.id}`,
          title: `New ${u.role || 'Client'} Registered`,
          message: `${u.full_name || 'A user'} created an account${u.email ? ` (${u.email})` : ''}.`,
          time: u.created_at,
          type: 'user',
        });
      });

    [...appointments]
      .sort((a, b) => new Date(b.created_at || b.start_time_utc) - new Date(a.created_at || a.start_time_utc))
      .slice(0, 5)
      .forEach(a => {
        const clientName = a.client?.full_name || 'A client';
        const creatorTitle = a.creator?.title || 'a creator';
        const isConfirmed = a.status === 'CONFIRMED' || a.status === 'COMPLETED';
        items.push({
          id: `appt-${a.id}`,
          title: `Booking ${a.status || 'Pending'}`,
          message: `${clientName} booked a session with ${creatorTitle}.`,
          time: a.created_at || a.start_time_utc,
          type: isConfirmed ? 'success' : a.status === 'CANCELLED' ? 'warning' : 'info',
        });
      });

    return items.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 12);
  }, [users, appointments, creators]);

  const iconMap = {
    user: <UserPlus size={18} style={{ color: '#6366f1', marginTop: '0.1rem' }} />,
    success: <CheckCircle2 size={18} style={{ color: '#10b981', marginTop: '0.1rem' }} />,
    warning: <AlertCircle size={18} style={{ color: '#f59e0b', marginTop: '0.1rem' }} />,
    info: <CalendarCheck size={18} style={{ color: '#3b82f6', marginTop: '0.1rem' }} />,
  };

  return (
    <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
        <Bell size={20} style={{ color: '#4f46e5' }} />
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, flex: 1 }}>System Notifications</h2>
        {notifications.length > 0 && (
          <span style={{ background: '#eef2ff', color: '#4f46e5', borderRadius: '9999px', padding: '0.15rem 0.55rem', fontSize: '0.75rem', fontWeight: 700 }}>
            {notifications.length}
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Bell size={40} style={{ color: 'var(--text-dim)', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>No notifications yet</h3>
          <p style={{ fontSize: '0.825rem', marginTop: '0.25rem' }}>
            Activity from users, bookings and creators will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {notifications.map((n) => (
            <div key={n.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.85rem',
              padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)', border: '1px solid var(--border-color)',
            }}>
              {iconMap[n.type] || iconMap.info}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{n.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{n.message}</div>
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.72rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                <Clock size={11} />{timeAgo(n.time)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

