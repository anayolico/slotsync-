import React, { useState } from 'react';
import { Users, Mail, Phone, Calendar, Search, ShieldCheck } from 'lucide-react';

export default function ClientsView({ users = [], appointments = [] }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter for client users (role === 'CLIENT' or users who are not CREATOR or ADMIN)
  const clients = users.filter(u => !u.role || u.role === 'CLIENT');

  const filteredClients = clients.filter(client => {
    const q = searchQuery.toLowerCase();
    const nameMatch = client.full_name && client.full_name.toLowerCase().includes(q);
    const emailMatch = client.email && client.email.toLowerCase().includes(q);
    const phoneMatch = client.phone_number && client.phone_number.toLowerCase().includes(q);
    return nameMatch || emailMatch || phoneMatch;
  });

  // Helper to count appointments for a client
  const getAppointmentCount = (clientId, clientEmail) => {
    return appointments.filter(a => 
      (a.client_id && a.client_id === clientId) || 
      (a.client && (a.client.id === clientId || a.client.email === clientEmail))
    ).length;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Bar: Search & Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredClients.length}</strong> {filteredClients.length === 1 ? 'Client' : 'Clients'}
          </span>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search clients by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.3rem', borderRadius: '9999px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Grid of Client Cards */}
      {filteredClients.length === 0 ? (
        <div className="card-panel" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Users size={48} style={{ color: 'var(--text-dim)', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>No client profiles found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem', maxWidth: '440px', margin: '0.25rem auto 0 auto' }}>
            When clients register or book appointments through the app, their profiles will automatically appear here.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '1.25rem'
        }}>
          {filteredClients.map((client, idx) => {
            const apptCount = getAppointmentCount(client.id, client.email);
            const avatarGradients = [
              'linear-gradient(135deg, #4f46e5, #7c3aed)',
              'linear-gradient(135deg, #0891b2, #2563eb)',
              'linear-gradient(135deg, #059669, #10b981)',
              'linear-gradient(135deg, #db2777, #ec4899)',
              'linear-gradient(135deg, #d97706, #f59e0b)',
            ];
            const grad = avatarGradients[idx % avatarGradients.length];
            const rawAvatarUrl = client.avatar_url;
            const backendBase = import.meta.env.VITE_BACKEND_URL || '';
            const avatarUrl = rawAvatarUrl 
              ? (rawAvatarUrl.startsWith('http://') || rawAvatarUrl.startsWith('https://') 
                  ? rawAvatarUrl 
                  : `${backendBase}${rawAvatarUrl.startsWith('/') ? '' : '/'}${rawAvatarUrl}`)
              : null;

            return (
              <div
                key={client.id || idx}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'; }}
              >
                {/* Header: Avatar & Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={client.full_name || 'Client'}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextElementSibling) {
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }
                        }}
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #e0e7ff'
                        }}
                      />
                    ) : null}
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: grad,
                      display: avatarUrl ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '1.15rem',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                      flexShrink: 0
                    }}>
                      {client.full_name ? client.full_name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                        {client.full_name || 'Client User'}
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                        <ShieldCheck size={12} />
                        Client Account
                      </div>
                    </div>
                  </div>

                  <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
                    Active
                  </span>
                </div>

                {/* Details Section */}
                <div style={{
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                    <Mail size={14} style={{ color: '#6366f1', flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {client.email || 'No email provided'}
                    </span>
                  </div>

                  {client.phone_number && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                      <Phone size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                      <span>{client.phone_number}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <Calendar size={14} style={{ color: '#8b5cf6', flexShrink: 0 }} />
                    <span>
                      Joined {client.created_at ? new Date(client.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recently'}
                    </span>
                  </div>
                </div>

                {/* Bottom Stats */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid var(--border-light)',
                  fontSize: '0.775rem'
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Appointments:</span>
                  <span style={{ fontWeight: 700, color: '#4f46e5', background: '#eef2ff', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
                    {apptCount} {apptCount === 1 ? 'Booking' : 'Bookings'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
