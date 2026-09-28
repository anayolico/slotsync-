import React, { useState } from 'react';
import { DollarSign, Search, Clock, Globe, Edit3, UserCheck, UserPlus } from 'lucide-react';
import EditCreatorModal from './EditCreatorModal';
import CreateUserModal from './CreateUserModal';

export default function CreatorsView({ creators = [], onCreatorUpdated }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCreator, setEditingCreator] = useState(null);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

  const categories = ['ALL', ...new Set(creators.map(c => c.category).filter(Boolean))];

  const filteredCreators = creators.filter(creator => {
    const q = searchQuery.toLowerCase();
    const titleMatch = creator.title && creator.title.toLowerCase().includes(q);
    const categoryMatch = creator.category && creator.category.toLowerCase().includes(q);
    const bioMatch = creator.bio && creator.bio.toLowerCase().includes(q);
    const nameMatch = creator.user && creator.user.full_name && creator.user.full_name.toLowerCase().includes(q);

    const matchesSearch = titleMatch || categoryMatch || bioMatch || nameMatch;
    const matchesCategory = selectedCategory === 'ALL' || creator.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Toolbar: Categories, Search, and Create User Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Category Filter Pills */}
        <div className="scrollable-filter-row" style={{ flex: 1, minWidth: '220px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Right Actions: Search & Create New User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search creators..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.2rem', borderRadius: '9999px', fontSize: '0.825rem' }}
            />
          </div>

          <button
            className="btn-upgrade"
            style={{
              width: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem',
              fontSize: '0.825rem',
              whiteSpace: 'nowrap'
            }}
            onClick={() => setIsCreateUserOpen(true)}
          >
            <UserPlus size={16} />
            <span>Create New User</span>
          </button>
        </div>
      </div>

      {/* Grid of Creator Cards */}
      {filteredCreators.length === 0 ? (
        <div className="card-panel" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <UserCheck size={48} style={{ color: 'var(--text-dim)', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>No creator profiles found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem', maxWidth: '440px', margin: '0.25rem auto 0 auto' }}>
            When creators register or profiles are created, they will automatically appear here.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredCreators.map((creator, idx) => {
            const rawAvatarUrl = creator.user?.avatar_url || creator.avatar_url;
            const backendBase = import.meta.env.VITE_BACKEND_URL || '';
            const avatarUrl = rawAvatarUrl 
              ? (rawAvatarUrl.startsWith('http://') || rawAvatarUrl.startsWith('https://') 
                  ? rawAvatarUrl 
                  : `${backendBase}${rawAvatarUrl.startsWith('/') ? '' : '/'}${rawAvatarUrl}`)
              : null;

            const fullName = creator.user?.full_name || creator.title || 'Creator Specialist';
            const email = creator.user?.email;

            const avatarGradients = [
              'linear-gradient(135deg, #4f46e5, #7c3aed)',
              'linear-gradient(135deg, #0891b2, #2563eb)',
              'linear-gradient(135deg, #059669, #10b981)',
              'linear-gradient(135deg, #db2777, #ec4899)',
              'linear-gradient(135deg, #d97706, #f59e0b)',
            ];
            const grad = avatarGradients[idx % avatarGradients.length];

            return (
              <div 
                key={creator.id} 
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)',
                  padding: '1.6rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.2rem',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  minHeight: '380px'
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 30px rgba(99,102,241,0.12)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.03)'; e.currentTarget.style.transform = ''; }}
              >
                {/* Header: Profile Picture, Name, and Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={fullName}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextElementSibling) {
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }
                        }}
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '16px',
                          objectFit: 'cover',
                          border: '2px solid #e0e7ff',
                          boxShadow: '0 4px 12px rgba(99,102,241,0.15)'
                        }}
                      />
                    ) : null}
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      background: grad,
                      display: avatarUrl ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '1.4rem',
                      boxShadow: '0 6px 16px rgba(79,70,229,0.22)',
                      flexShrink: 0
                    }}>
                      {fullName ? fullName.charAt(0).toUpperCase() : 'C'}
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.25 }}>
                        {creator.title || fullName}
                      </h3>
                      {creator.title && creator.user?.full_name && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.15rem' }}>
                          {creator.user.full_name}
                        </div>
                      )}
                      <div style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 700, marginTop: '0.25rem' }}>
                        <span>{creator.category || 'General'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div style={{
                    background: creator.is_active ? '#dcfce7' : '#fee2e2',
                    color: creator.is_active ? '#16a34a' : '#dc2626',
                    border: `1px solid ${creator.is_active ? '#bbf7d0' : '#fecaca'}`,
                    borderRadius: '9999px',
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.675rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    flexShrink: 0
                  }}>
                    {creator.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </div>
                </div>

                {/* Offering Bio Description */}
                <div style={{ flex: 1, margin: '0.25rem 0' }}>
                  <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.6,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {creator.bio || 'No bio description provided for this creator profile.'}
                  </p>
                </div>

                {/* Metrics / Info Box */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 0.85rem',
                }}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.675rem', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.2rem' }}>SLOT</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                      <Clock size={13} style={{ color: '#6366f1' }} />
                      {creator.slot_duration_minutes || 30}m
                    </div>
                  </div>
                  <div style={{ width: '1px', background: 'var(--border-light)' }} />
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.675rem', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.2rem' }}>RATE</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.15rem' }}>
                      <span>₦</span>
                      {creator.hourly_rate ? `${Number(creator.hourly_rate).toLocaleString()}/hr` : '0/hr'}
                    </div>
                  </div>
                  <div style={{ width: '1px', background: 'var(--border-light)' }} />
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.675rem', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.2rem' }}>TIMEZONE</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                      <Globe size={12} style={{ color: '#0ea5e9' }} />
                      {(creator.timezone || 'UTC').replace('_', ' ').split('/').pop()}
                    </div>
                  </div>
                </div>

                {/* Edit Profile Action */}
                <button
                  onClick={() => setEditingCreator(creator)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.7rem',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(79,70,229,0.2)',
                    transition: 'opacity 0.2s, transform 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.92'; e.currentTarget.style.transform = 'scale(1.01)'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = ''; }}
                >
                  <Edit3 size={15} />
                  <span>Edit Profile</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Creator Profile Modal */}
      <EditCreatorModal
        isOpen={!!editingCreator}
        onClose={() => setEditingCreator(null)}
        creator={editingCreator}
        onCreatorUpdated={onCreatorUpdated}
      />

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        onUserCreated={onCreatorUpdated}
      />
    </div>
  );
}
