import React, { useState } from 'react';
import { CheckCircle2, XCircle, Search, Database } from 'lucide-react';

export default function AppointmentsView({ appointments = [], onUpdateStatus }) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAppointments = appointments.filter(appt => {
    const matchesSearch = 
      (appt.notes && appt.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (appt.client && appt.client.full_name && appt.client.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (appt.id && appt.id.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || (appt.status || 'PENDING') === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Status Filter Pills */}
        <div className="scrollable-filter-row">
          {['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED', 'REJECTED'].map((status) => (
            <button
              key={status}
              className={`filter-pill ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '220px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search appointments..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.2rem', borderRadius: '9999px', fontSize: '0.8rem' }}
          />
        </div>
      </div>

      {/* Live Appointments Data Table */}
      {filteredAppointments.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Database size={44} style={{ color: 'var(--text-dim)', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>No appointments match filter</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            0 records found for current filter selection in backend database.
          </p>
        </div>
      ) : (
        <div className="responsive-table-wrapper">
          <table className="consult-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Client User</th>
                <th>Creator Profile</th>
                <th>Start Time (UTC)</th>
                <th>End Time (UTC)</th>
                <th>Status</th>
                <th>Notes</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appt) => (
                <tr key={appt.id}>
                  <td>
                    <code style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 700 }}>
                      {appt.id ? `${appt.id.substring(0, 8)}...` : 'N/A'}
                    </code>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {appt.client ? appt.client.full_name : appt.client_id ? appt.client_id.substring(0, 8) : 'Client'}
                  </td>
                  <td>
                    {appt.creator ? appt.creator.title : appt.creator_id ? appt.creator_id.substring(0, 8) : 'Creator'}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {appt.start_time_utc ? new Date(appt.start_time_utc).toUTCString() : 'N/A'}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {appt.end_time_utc ? new Date(appt.end_time_utc).toUTCString() : 'N/A'}
                  </td>
                  <td>
                    <span className={`badge badge-${(appt.status || 'pending').toLowerCase()}`}>
                      {appt.status || 'PENDING'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                    {appt.notes || '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      {appt.status !== 'CONFIRMED' && (
                        <button 
                          className="filter-pill"
                          style={{ padding: '0.25rem 0.5rem', color: 'var(--success)' }}
                          onClick={() => onUpdateStatus && onUpdateStatus(appt.id, 'CONFIRMED')}
                          title="Confirm Booking"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      )}
                      {appt.status !== 'CANCELLED' && (
                        <button 
                          className="filter-pill"
                          style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)' }}
                          onClick={() => onUpdateStatus && onUpdateStatus(appt.id, 'CANCELLED')}
                          title="Cancel Booking"
                        >
                          <XCircle size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
