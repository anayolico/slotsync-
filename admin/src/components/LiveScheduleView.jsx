import React from 'react';
import CalendarWidget from './CalendarWidget';
import { Clock, Database, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const statusStyles = {
  CONFIRMED:  { color: '#16a34a', bg: '#dcfce7', icon: CheckCircle },
  COMPLETED:  { color: '#2563eb', bg: '#dbeafe', icon: CheckCircle },
  PENDING:    { color: '#d97706', bg: '#fef3c7', icon: AlertCircle },
  CANCELLED:  { color: '#dc2626', bg: '#fee2e2', icon: XCircle },
};

export default function LiveScheduleView({ appointments = [] }) {
  return (
    <div style={{
      display: 'flex',
      gap: '2rem',
      alignItems: 'flex-start',
      minHeight: '60vh',
    }}>

      {/* ── LEFT: Live Schedule List ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.15rem' }}>
              Live Schedule
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} in real-time
            </p>
          </div>
          {/* Live pulse indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '9999px', padding: '0.3rem 0.75rem' }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a',
              boxShadow: '0 0 0 2px rgba(22,163,74,0.3)',
              animation: 'livePulse 1.5s ease-in-out infinite',
            }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a' }}>LIVE</span>
          </div>
        </div>

        {/* Appointments */}
        {appointments.length === 0 ? (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '3rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}>
            <Database size={40} style={{ color: 'var(--text-dim)', marginBottom: '0.75rem' }} />
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>No appointments yet</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
              Appointments will appear here in real-time
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {appointments.map((item) => {
              const st = statusStyles[item.status] || statusStyles.PENDING;
              const Icon = st.icon;
              return (
                <div key={item.id} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'box-shadow 0.2s',
                  cursor: 'default',
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: '1rem',
                  }}>
                    {item.client?.full_name ? item.client.full_name.charAt(0).toUpperCase() : 'C'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.client?.full_name || 'Client'}
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      {item.creator?.title || 'Creator Service'}
                    </div>
                  </div>

                  {/* Time + Date */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end', marginBottom: '0.2rem' }}>
                      <Clock size={13} style={{ color: '#6366f1' }} />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {item.start_time_utc
                          ? new Date(item.start_time_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      {item.start_time_utc
                        ? new Date(item.start_time_utc).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                        : ''}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    background: st.bg, color: st.color,
                    borderRadius: '9999px', padding: '0.3rem 0.65rem',
                    fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                  }}>
                    <Icon size={12} />
                    {item.status || 'PENDING'}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <style>{`
          @keyframes livePulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.2); }
          }
        `}</style>
      </div>

      {/* ── RIGHT: Calendar ── */}
      <div style={{
        width: '320px',
        flexShrink: 0,
        position: 'sticky',
        top: '1.5rem',
      }}>
        <div style={{ marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Calendar
        </div>
        <div style={{ transform: 'scale(1)', transformOrigin: 'top left' }}>
          <CalendarWidget appointments={appointments} />
        </div>
      </div>

    </div>
  );
}
