import React from 'react';
import { 
  FileText, 
  ArrowUpRight, 
  Users, 
  UserCheck, 
  Calendar,
  ShieldCheck,
  Database
} from 'lucide-react';
import BarChartWidget from './BarChartWidget';

export default function DashboardOverview({ 
  creators = [], 
  appointments = [], 
  users = [],
  setActiveTab 
}) {
  const totalAppointmentsCount = appointments.length;
  const confirmedCount = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED').length;
  const pendingCount = appointments.filter(a => a.status === 'PENDING').length;
  const creatorsCount = creators.length;
  const totalUsersCount = users.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Live Hero Stats Row */}
      <div className="hero-stats-row">
        {/* Hero Card: Live Total Appointments */}
        <div className="hero-gradient-card">
          <div className="hero-vector-bg" />
          
          <div className="hero-card-header">
            <div className="hero-icon-box">
              <ShieldCheck size={22} color="#ffffff" />
            </div>
            <button className="btn-details-link" onClick={() => setActiveTab('appointments')}>
              <span>View Bookings</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div>
            <div className="hero-card-value">
              {totalAppointmentsCount}
            </div>
            <div className="hero-card-label">
              Total Appointments
            </div>
          </div>
        </div>

        {/* Stacked Secondary Metric Cards */}
        <div className="stacked-metrics-col">
          {/* Total Platform Users (Clients + Creators) */}
          <div 
            className="metric-mini-card" 
            style={{ cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
            onClick={() => setActiveTab('clients')}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            <div className="metric-mini-left">
              <div className="metric-icon-badge violet">
                <Users size={20} />
              </div>
              <div>
                <div className="metric-mini-value">{totalUsersCount}</div>
                <div className="metric-mini-label">Total Users (Clients & Creators)</div>
              </div>
            </div>
            <ArrowUpRight size={18} style={{ color: '#4f46e5' }} />
          </div>

          {/* Confirmed & Completed Bookings */}
          <div 
            className="metric-mini-card" 
            style={{ cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
            onClick={() => setActiveTab('appointments')}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            <div className="metric-mini-left">
              <div className="metric-icon-badge" style={{ background: '#ecfdf5', color: '#10b981' }}>
                <Calendar size={20} />
              </div>
              <div>
                <div className="metric-mini-value">{confirmedCount}</div>
                <div className="metric-mini-label">Confirmed / Completed</div>
              </div>
            </div>
            <ArrowUpRight size={18} style={{ color: '#10b981' }} />
          </div>

          {/* Active Creator Profiles */}
          <div 
            className="metric-mini-card" 
            style={{ cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
            onClick={() => setActiveTab('creators')}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            <div className="metric-mini-left">
              <div className="metric-icon-badge cyan">
                <UserCheck size={20} />
              </div>
              <div>
                <div className="metric-mini-value">{creatorsCount}</div>
                <div className="metric-mini-label">Creator Profiles</div>
              </div>
            </div>
            <ArrowUpRight size={18} style={{ color: '#06b6d4' }} />
          </div>
        </div>
      </div>

      {/* Dynamic Bar Chart: Appointment Status Breakdown */}
      <BarChartWidget appointments={appointments} />

      {/* Recent Appointments Table */}
      <div className="card-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} style={{ color: '#4f46e5' }} />
            Recent Appointments
          </h2>
          <button className="btn-upgrade" style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.775rem' }} onClick={() => setActiveTab('appointments')}>
            Manage All ({appointments.length})
          </button>
        </div>

        {appointments.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <Calendar size={36} style={{ color: 'var(--text-dim)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>No appointments found</h3>
            <p style={{ fontSize: '0.825rem', marginTop: '0.25rem' }}>
              No scheduled appointments yet. Any new bookings will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="responsive-table-wrapper">
            <table className="consult-table mobile-card-table">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Client</th>
                  <th>Creator Profile</th>
                  <th>Start Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.slice(0, 5).map((appt) => (
                  <tr key={appt.id}>
                    <td className="card-row-header" data-label="Booking">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg, #4338ca, #6366f1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: '0.875rem',
                        }}>
                          {appt.client?.full_name ? appt.client.full_name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {appt.client ? appt.client.full_name : `Client (${(appt.client_id || '').substring(0,6)})`}
                          </div>
                          <code style={{ fontSize: '0.7rem', color: '#4f46e5', fontWeight: 600 }}>
                            {appt.id ? `${appt.id.substring(0, 8)}…` : 'N/A'}
                          </code>
                        </div>
                        <span className={`badge badge-${(appt.status || 'pending').toLowerCase()}`}>
                          {appt.status || 'PENDING'}
                        </span>
                      </div>
                    </td>
                    <td data-label="Client">{appt.client ? appt.client.full_name : appt.client_id ? `Client (${appt.client_id.substring(0,6)})` : 'Client User'}</td>
                    <td data-label="Creator">{appt.creator ? appt.creator.title : appt.creator_id ? `Creator (${appt.creator_id.substring(0,6)})` : 'Creator Service'}</td>
                    <td data-label="Start Time" style={{ color: 'var(--text-muted)' }}>
                      {appt.start_time_utc
                        ? new Date(appt.start_time_utc).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) +
                          ' · ' + new Date(appt.start_time_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'N/A'}
                    </td>
                    <td data-label="Status">
                      <span className={`badge badge-${(appt.status || 'pending').toLowerCase()}`}>
                        {appt.status || 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
