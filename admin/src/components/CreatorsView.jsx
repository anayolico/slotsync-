import React, { useState } from 'react';
import { Tag, DollarSign, Search, Database, Clock, Globe, Edit3 } from 'lucide-react';
import EditCreatorModal from './EditCreatorModal';

export default function CreatorsView({ creators = [], onCreatorUpdated }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCreator, setEditingCreator] = useState(null);

  const categories = ['ALL', ...new Set(creators.map(c => c.category).filter(Boolean))];

  const filteredCreators = creators.filter(creator => {
    const matchesSearch = 
      (creator.title && creator.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (creator.category && creator.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (creator.bio && creator.bio.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || creator.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Category Filter Pills */}
        <div className="scrollable-filter-row">
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

        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search creator profiles..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.2rem', borderRadius: '9999px' }}
          />
        </div>
      </div>

      {/* Grid of Live Creator Profiles */}
      {filteredCreators.length === 0 ? (
        <div className="card-panel" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <Database size={44} style={{ color: 'var(--text-dim)', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>No creator profiles in backend database</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem', maxWidth: '480px', margin: '0.25rem auto 0 auto' }}>
            0 records returned from FastAPI `/api/v1/creators/`. When creators register or profiles are created in the server, they will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="creators-grid">
          {filteredCreators.map((creator) => (
            <div key={creator.id} className="creator-card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4f46e5, #ec4899)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '1rem',
                    flexShrink: 0
                  }}>
                    {creator.title ? creator.title.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.2 }}>{creator.title || 'Creator Profile'}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      <Tag size={12} /> {creator.category || 'General'}
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  className="filter-pill"
                  onClick={() => setEditingCreator(creator)}
                  title="Edit Creator Profile"
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    color: '#4f46e5',
                    borderColor: '#c7d2fe',
                    background: '#eef2ff'
                  }}
                >
                  <Edit3 size={13} />
                  <span>Edit</span>
                </button>
              </div>

              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', minHeight: '36px', lineHeight: '1.4' }}>
                {creator.bio || 'No bio provided for this creator.'}
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Clock size={12} /> {creator.slot_duration_minutes || 30} mins slot</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Globe size={12} /> {creator.timezone || 'UTC'}</span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-light)',
                marginTop: 'auto'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--success)', fontWeight: 700, fontSize: '0.9rem' }}>
                  <DollarSign size={15} />
                  <span>{creator.hourly_rate ? `${creator.hourly_rate}/hr` : '0/hr'}</span>
                </div>
                <span className={`badge ${creator.is_active ? 'badge-active' : 'badge-cancelled'}`}>
                  {creator.is_active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Creator Profile Modal */}
      <EditCreatorModal
        isOpen={!!editingCreator}
        onClose={() => setEditingCreator(null)}
        creator={editingCreator}
        onCreatorUpdated={onCreatorUpdated}
      />
    </div>
  );
}
