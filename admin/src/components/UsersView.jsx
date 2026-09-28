import React, { useState } from 'react';
import { Users, Mail, Database, Search, UserPlus, Shield } from 'lucide-react';
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
      <div className="mobile-action-bar" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div className="scrollable-filter-row" style={{ flex: 1, minWidth: 0 }}>
          {['ALL', 'CLIENT', 'CREATOR', 'ADMIN'].map((role) => (
            <button
              key={role}
              className={`filter-pill ${roleFilter === role ? 'active' : ''}`}
              onClick={() => setRoleFilter(role)}
            >{role}</button>
          ))}
        </div>

        <div className="mobile-search-group" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '200px', flexShrink: 0 }}>
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
        </div>

        <button
          className="btn-upgrade"
          style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.95rem', fontSize: '0.8rem', flexShrink: 0 }}
          onClick={() => setIsModalOpen(true)}
        >
          <UserPlus size={16} />
          <span>Create New User</span>
        </button>
      </div>

      {filteredUsers.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Database size={44} style={{ color: 'var(--text-dim)', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>No user accounts found</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            0 records returned. Click "Create New User" to register an account.
          </p>
        </div>
      ) : (
        <div className="responsive-table-wrapper">
          <table className="consult-table mobile-card-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Registered</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id || Math.random()}>
                  <td className="card-row-header" data-label="User">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                        background: u.role === 'ADMIN'
                          ? 'linear-gradient(135deg, #4f46e5, #6366f1)'
                          : u.role === 'CREATOR'
                          ? 'linear-gradient(135deg, #06b6d4, #3b82f6)'
                          : 'linear-gradient(135deg, #fb923c, #ec4899)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, color: '#fff', fontSize: '0.9rem',
                      }}>
                        {u.full_name ? u.full_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {u.full_name || 'System User'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                          {u.id ? `${u.id.substring(0, 10)}…` : 'N/A'}
                        </div>
                      </div>
                      <span className={`badge ${u.role === 'ADMIN' ? 'badge-confirmed' : u.role === 'CREATOR' ? 'badge-pending' : 'badge-active'}`} style={{ flexShrink: 0 }}>
                        {u.role || 'CLIENT'}
                      </span>
                    </div>
                  </td>
                  <td data-label="Email" style={{ color: 'var(--text-muted)' }}>{u.email || '—'}</td>
                  <td data-label="Role">
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-confirmed' : u.role === 'CREATOR' ? 'badge-pending' : 'badge-active'}`}>
                      {u.role || 'CLIENT'}
                    </span>
                  </td>
                  <td data-label="Registered" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                  </td>
                  <td data-label="Status">
                    <span className="badge badge-active">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserCreated={onUserCreated}
      />
    </div>
  );
}


