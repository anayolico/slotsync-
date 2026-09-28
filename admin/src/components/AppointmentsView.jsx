import React, { useState } from 'react';
import { CheckCircle2, XCircle, Search, Database, Calendar } from 'lucide-react';

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

  const formatTime = (utcStr) => {
    if (!utcStr) return 'N/A';
    const d = new Date(utcStr);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Top Action Bar ── */}
      <div className="mobile-action-bar" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>

        {/* Status Filter Pills */}
        <div className="scrollable-filter-row" style={{ flex: 1 }}>
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
        <div className="mobile-search-group" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
      </div>

      {/* ── Appointments List ── */}
      {filteredAppointments.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Database size={44} style={{ color: 'var(--text-dim)', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>No appointments match filter</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            0 records found for current filter selection.
          </p>
        </div>
      ) : (
        <div className="responsive-table-wrapper">
          <table className="consult-table mobile-card-table">
            <thead>
              <tr>
                <th>Booking</th>
                <th>Client</th>
                <th>Creator</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Status</th>
                <th>Notes</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appt) => (
                <tr key={appt.id}>
                  {/* Profile header cell — shown as card header on mobile */}
                  <td className="card-row-header" data-label="Booking">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                      }}>
                        {appt.client?.full_name ? appt.client.full_name.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                          {appt.client ? appt.client.full_name : 'Client'}
                        </div>
                        <code style={{ fontSize: '0.72rem', color: '#4f46e5', fontWeight: 600 }}>
                          {appt.id ? `${appt.id.substring(0, 8)}…` : 'N/A'}
                        </code>
                      </div>
                      {/* Status badge — always visible */}
                      <span className={`badge badge-${(appt.status || 'pending').toLowerCase()}`}>
                        {appt.status || 'PENDING'}
                      </span>
                    </div>
                  </td>

                  {/* Hidden on mobile (merged into header) */}
                  <td data-label="Client" style={{ fontWeight: 600 }}>
                    {appt.client ? appt.client.full_name : appt.client_id ? appt.client_id.substring(0, 8) : 'Client'}
                  </td>

                  <td data-label="Creator">
                    {appt.creator ? appt.creator.title : appt.creator_id ? appt.creator_id.substring(0, 8) : 'Creator'}
                  </td>

                  <td data-label="Start Time" style={{ color: 'var(--text-muted)' }}>
                    {formatTime(appt.start_time_utc)}
                  </td>

                  <td data-label="End Time" style={{ color: 'var(--text-muted)' }}>
                    {formatTime(appt.end_time_utc)}
                  </td>

                  <td data-label="Status">
                    <span className={`badge badge-${(appt.status || 'pending').toLowerCase()}`}>
                      {appt.status || 'PENDING'}
                    </span>
                  </td>

                  <td data-label="Notes" style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                    {appt.notes || '—'}
                  </td>

                  <td data-label="Actions" style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      {appt.status !== 'CONFIRMED' && (
                        <button
                          className="filter-pill"
                          style={{ padding: '0.3rem 0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.775rem' }}
                          onClick={() => onUpdateStatus && onUpdateStatus(appt.id, 'CONFIRMED')}
                        >
                          <CheckCircle2 size={13} /> Confirm
                        </button>
                      )}
                      {appt.status !== 'CANCELLED' && (
                        <button
                          className="filter-pill"
                          style={{ padding: '0.3rem 0.75rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.775rem' }}
                          onClick={() => onUpdateStatus && onUpdateStatus(appt.id, 'CANCELLED')}
                        >
                          <XCircle size={13} /> Cancel
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


