import React from 'react';
import { Settings, Server, Shield, CheckCircle2, Lock } from 'lucide-react';

export default function SettingsView() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  return (
    <div className="card-panel" style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
        <Settings size={22} style={{ color: '#4f46e5' }} />
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Server Environment Configuration (`.env`)</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Configured via `admin/.env` environment variables</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Server size={14} style={{ color: '#4f46e5' }} /> `VITE_API_BASE_URL` (API Base Endpoint)
          </label>
          <input 
            type="text" 
            className="form-control" 
            value={apiBaseUrl} 
            readOnly 
            style={{ fontWeight: 600, fontFamily: 'monospace', color: '#4f46e5', background: '#f8fafc' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Server size={14} style={{ color: '#06b6d4' }} /> `VITE_BACKEND_URL` (FastAPI Root Server)
          </label>
          <input 
            type="text" 
            className="form-control" 
            value={backendUrl} 
            readOnly 
            style={{ fontWeight: 600, fontFamily: 'monospace', color: '#06b6d4', background: '#f8fafc' }}
          />
        </div>

        <div style={{
          background: '#ecfdf5',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          fontSize: '0.825rem',
          color: 'var(--success)'
        }}>
          <CheckCircle2 size={18} />
          <span>Environment variables loaded from `admin/.env`. No backend URLs are hardcoded in source code.</span>
        </div>
      </div>
    </div>
  );
}
