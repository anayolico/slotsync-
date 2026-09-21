import React from 'react';
import { Box, Clock, DollarSign, Database, Plus } from 'lucide-react';

export default function ServicesView({ creators = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Configured slot durations, pricing, and service categories across live Creator Profiles (`creator_profiles` table)
        </p>
      </div>

      {creators.length === 0 ? (
        <div className="card-panel" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <Database size={44} style={{ color: 'var(--text-dim)', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>No creator slot services in backend database</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            0 records found from FastAPI `/api/v1/creators/`.
          </p>
        </div>
      ) : (
        <div className="creators-grid">
          {creators.map((creator) => (
            <div key={creator.id} className="creator-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  background: '#eef2ff',
                  color: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Box size={20} />
                </div>
                <span className={`badge ${creator.is_active ? 'badge-active' : 'badge-cancelled'}`}>
                  {creator.is_active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{creator.title || 'Creator Service'}</h3>
              
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={14} /> {creator.slot_duration_minutes || 30} mins
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <DollarSign size={14} /> ${creator.hourly_rate || 0}/hr
                </div>
              </div>

              <div style={{
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-light)',
                marginTop: 'auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span className="filter-pill" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>{creator.category || 'General'}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>ID: {creator.id ? creator.id.substring(0, 6) : 'N/A'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
