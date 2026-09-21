import React, { useState } from 'react';
import { Users, Shield, Mail, Database, Search, UserPlus } from 'lucide-react';
import CreateUserModal from './CreateUserModal';

export default function UsersView({ users = [], onUserCreated }) {
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Role Filter Pills */}
        <div className="scrollable-filter-row">
          <Shield size={16} style={{ color: '#4f46e5', flexShrink: 0 }} />
          {['ALL', 'CLIENT', 'CREATOR', 'ADMIN'].map((role) => (
            <button
              key={role}
              className={`filter-pill ${roleFilter === role ? 'active' : ''}`}
              onClick={() => setRoleFilter(role)}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Right Tools: Search & Create User Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '220px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.2rem', borderRadius: '9999px', fontSize: '0.8rem' }}
            />
          </div>

          <button
            className="btn-upgrade"
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.95rem', fontSize: '0.8rem' }}
            onClick={() => setIsModalOpen(true)}
          >
            <UserPlus size={16} />
            <span>Create New User</span>
          </button>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Database size={44} style={{ color: 'var(--text-dim)', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>No user accounts found</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            0 records returned from backend database. Click "Create New User" to register an account.
          </p>
        </div>
      ) : (
        <div className="responsive-table-wrapper">
          <table className="consult-table">
            <thead>
              <tr>
                <th>User Profile</th>
                <th>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Mail size={14} /> Email Address
                  </div>
                </th>
                <th>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Shield size={14} /> Role (`UserRole`)
                  </div>
                </th>
                <th>Registered Date</th>
                <th>Account Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id || Math.random()}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: u.role === 'ADMIN'
                          ? 'linear-gradient(135deg, #4f46e5, #6366f1)'
                          : u.role === 'CREATOR'
                          ? 'linear-gradient(135deg, #06b6d4, #3b82f6)'
                          : 'linear-gradient(135deg, #fb923c, #ec4899)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        color: '#fff',
                        fontSize: '0.85rem',
                        flexShrink: 0,
                      }}>
                        {u.full_name ? u.full_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{u.full_name || 'System User'}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                          {u.id ? `ID: ${u.id.substring(0, 8)}...` : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.email || '—'}</td>
                  <td>
                    <span className={`badge ${
                      u.role === 'ADMIN' ? 'badge-confirmed' :
                      u.role === 'CREATOR' ? 'badge-pending' :
                      'badge-active'
                    }`}>
                      {u.role || 'CLIENT'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <span className="badge badge-active">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserCreated={onUserCreated}
      />
    </div>
  );
}
