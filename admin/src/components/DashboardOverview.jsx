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
              Total Appointments (`appointments` table)
            </div>
          </div>
        </div>

        {/* Stacked Secondary Metric Cards */}
        <div className="stacked-metrics-col">
          {/* Confirmed & Completed */}
          <div className="metric-mini-card">
            <div className="metric-mini-left">
              <div className="metric-icon-badge violet">
                <Users size={20} />
              </div>
              <div>
                <div className="metric-mini-value">{confirmedCount}</div>
                <div className="metric-mini-label">Confirmed / Completed</div>
              </div>
            </div>
            <ArrowUpRight size={18} style={{ color: '#4f46e5' }} />
          </div>

          {/* Active Creator Profiles */}
          <div className="metric-mini-card">
            <div className="metric-mini-left">
              <div className="metric-icon-badge cyan">
                <UserCheck size={20} />
              </div>
              <div>
                <div className="metric-mini-value">{creatorsCount}</div>
                <div className="metric-mini-label">Creator Profiles (`creator_profiles`)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Bar Chart: Live Appointment Status Breakdown */}
      <BarChartWidget appointments={appointments} />

      {/* Live Appointments Table from FastAPI */}
      <div className="card-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={18} style={{ color: '#4f46e5' }} />
            Backend Appointments Audit Log (`appointments` Table)
          </h2>
          <button className="btn-upgrade" style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.775rem' }} onClick={() => setActiveTab('appointments')}>
            Manage All ({appointments.length})
          </button>
        </div>

        {appointments.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <Database size={36} style={{ color: 'var(--text-dim)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>No appointments in backend database</h3>
            <p style={{ fontSize: '0.825rem', marginTop: '0.25rem' }}>
              0 records returned from FastAPI `/api/v1/appointments/`. Book an appointment via mobile or API to view real records here.
            </p>
          </div>
        ) : (
          <div className="responsive-table-wrapper">
            <table className="consult-table">
              <thead>
                <tr>
                  <th><div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><FileText size={14} /> ID</div></th>
                  <th><div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Users size={14} /> Client</div></th>
                  <th><div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><UserCheck size={14} /> Creator Profile</div></th>
                  <th><div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Calendar size={14} /> Start Time UTC</div></th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.slice(0, 5).map((appt) => (
                  <tr key={appt.id}>
                    <td style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.8rem', color: '#4f46e5' }}>
                      {appt.id ? `${appt.id.substring(0, 8)}...` : 'N/A'}
                    </td>
                    <td>{appt.client ? appt.client.full_name : appt.client_id ? `Client (${appt.client_id.substring(0,6)})` : 'Client User'}</td>
                    <td>{appt.creator ? appt.creator.title : appt.creator_id ? `Creator (${appt.creator_id.substring(0,6)})` : 'Creator Service'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {appt.start_time_utc ? new Date(appt.start_time_utc).toUTCString() : 'N/A'}
                    </td>
                    <td>
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
