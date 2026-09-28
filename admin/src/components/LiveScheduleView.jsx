import React from 'react';
import CalendarWidget from './CalendarWidget';
import { Clock, Calendar as CalendarIcon, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const statusStyles = {
  CONFIRMED:  { color: '#16a34a', bg: '#dcfce7', icon: CheckCircle },
  COMPLETED:  { color: '#2563eb', bg: '#dbeafe', icon: CheckCircle },
  PENDING:    { color: '#d97706', bg: '#fef3c7', icon: AlertCircle },
  CANCELLED:  { color: '#dc2626', bg: '#fee2e2', icon: XCircle },
};

export default function LiveScheduleView({ appointments = [] }) {
  return (
    <div className="live-schedule-layout">

      {/* ── LEFT: Live Schedule List ── */}
      <div className="live-schedule-list-col">

        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.15rem' }}>
              Live Schedule
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
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

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}>
            <CalendarIcon size={44} style={{ color: 'var(--text-dim)', marginBottom: '0.75rem' }} />
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>No scheduled appointments yet</div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              New appointments booked by clients will appear here automatically
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
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
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
                    <span>{item.status || 'PENDING'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── RIGHT: Calendar Column ── */}
      <div className="live-schedule-cal-col">
        <CalendarWidget appointments={appointments} />
      </div>

      <style>{`
        .live-schedule-layout {
          display: flex;
          gap: 1.75rem;
          align-items: flex-start;
          width: 100%;
        }

        .live-schedule-list-col {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
        }

        .live-schedule-cal-col {
          width: 330px;
          flex-shrink: 0;
          position: sticky;
          top: 1.5rem;
        }

        @media (max-width: 960px) {
          .live-schedule-layout {
            flex-direction: column;
            gap: 1.5rem;
          }

          .live-schedule-cal-col {
            width: 100%;
            max-width: 100%;
            position: static;
          }
        }

        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
