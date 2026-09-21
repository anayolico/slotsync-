import React from 'react';
import CalendarWidget from './CalendarWidget';
import { Clock, Calendar as CalendarIcon, Database } from 'lucide-react';

export default function RightPanel({ appointments = [] }) {
  const upcomingAppointments = appointments.slice(0, 4);

  return (
    <aside className="right-panel-column">
      {/* Live Calendar Widget */}
      <CalendarWidget appointments={appointments} />

      {/* Live Upcoming Platform Schedule */}
      <div className="upcoming-appointments-card">
        <h2 className="calendar-title" style={{ marginBottom: '1.25rem' }}>
          Live Schedule ({appointments.length})
        </h2>

        {upcomingAppointments.length === 0 ? (
          <div style={{ padding: '1.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <Database size={24} style={{ color: 'var(--text-dim)', marginBottom: '0.4rem' }} />
            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>No upcoming appointments</div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
              0 records in backend database
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {upcomingAppointments.map((item) => (
              <div key={item.id} className="upcoming-item">
                <div className="upcoming-user-info">
                  <div className="upcoming-avatar">
                    {item.client && item.client.full_name ? item.client.full_name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div>
                    <div className="upcoming-name">{item.client ? item.client.full_name : 'Client'}</div>
                    <div className="upcoming-role">{item.creator ? item.creator.title : 'Creator Service'}</div>
                  </div>
                </div>
                <div className="time-pill">
                  <Clock size={12} />
                  <span>{item.start_time_utc ? new Date(item.start_time_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'UTC'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
