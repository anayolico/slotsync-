import React, { useState } from 'react';
import { Sparkles, Eye, EyeOff, AlertCircle, Server, ShieldCheck } from 'lucide-react';
import { loginUser } from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginUser(email, password);
      onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">

      {/* ─── LEFT HERO PANEL ─── */}
      <div className="login-hero-panel">

        {/* Decorative circle rings */}
        <div style={{
          position: 'absolute', width: '520px', height: '520px', borderRadius: '50%',
          border: '60px solid rgba(255,255,255,0.06)',
          top: '-120px', right: '-140px', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: '340px', height: '340px', borderRadius: '50%',
          border: '40px solid rgba(255,255,255,0.05)',
          bottom: '-80px', left: '-80px', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: '200px', height: '200px', borderRadius: '50%',
          border: '30px solid rgba(255,255,255,0.07)',
          top: '40%', left: '-50px', pointerEvents: 'none',
        }} />

        {/* Brand */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '20px',
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
          }}>
            <Sparkles size={30} color="#ffffff" />
          </div>

          <h1 style={{
            fontSize: '2.4rem', fontWeight: 800, color: '#ffffff',
            letterSpacing: '-0.03em', lineHeight: 1.1,
            fontFamily: "'Outfit', sans-serif",
          }}>
            SLOTSYNC
          </h1>

          <p style={{
            fontSize: '0.925rem', color: 'rgba(255,255,255,0.7)',
            marginTop: '0.5rem', fontWeight: 500, letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            Admin Control Portal
          </p>

          {/* Hero stat card */}
          <div className="login-hero-stat-card" style={{
            marginTop: '3rem',
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '16px',
            padding: '1.75rem 2rem',
            textAlign: 'left',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          }}>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', fontWeight: 600, marginBottom: '0.4rem' }}>
              PLATFORM TOTAL
            </p>
            <div style={{ fontSize: '2.6rem', fontWeight: 800, color: '#ffffff', lineHeight: 1, fontFamily: "'Outfit', sans-serif" }}>
              1,436
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.35rem' }}>
              Total Bookings &amp; Appointments
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>424</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Confirmed Slots</div>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }} />
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>103</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Active Creators</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT LOGIN PANEL ─── */}
      <div className="login-form-panel">
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Sign-In Card */}
          <div style={{
            background: '#ffffff',            /* design.md Card Background */
            borderRadius: '16px',             /* design.md card border-radius */
            padding: '2.25rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.03)',  /* design.md box-shadow */
            border: '1px solid #e2e8f0',     /* design.md border */
          }}>

            {/* Card Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.85rem' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',   /* design.md button radius */
                background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(79,70,229,0.3)',
              }}>
                <ShieldCheck size={20} color="#ffffff" />
              </div>
              <div>
                <h2 style={{
                  fontSize: '1.3rem', fontWeight: 800, color: '#1e293b',
                  fontFamily: "'Outfit', sans-serif", lineHeight: 1.1,
                }}>
                  Admin Sign In
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
                  SlotSync Administrator access only
                </p>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid rgba(239,68,68,0.3)',
                color: '#ef4444', padding: '0.75rem 1rem',
                borderRadius: '12px',
                fontSize: '0.825rem', marginBottom: '1.25rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

              {/* Email */}
              <div>
                <label style={{
                  display: 'block', fontSize: '0.78rem', fontWeight: 700,
                  color: '#64748b', marginBottom: '0.4rem',
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="admin@slotsync.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '0.7rem 1rem',
                    fontSize: '0.875rem',
                    color: '#0f172a',
                    outline: 'none',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4f46e5';
                    e.target.style.background = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.background = '#f1f5f9';
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{
                  display: 'block', fontSize: '0.78rem', fontWeight: 700,
                  color: '#64748b', marginBottom: '0.4rem',
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '0.7rem 2.75rem 0.7rem 1rem',
                      fontSize: '0.875rem',
                      color: '#0f172a',
                      outline: 'none',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.2s, background 0.2s',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4f46e5';
                      e.target.style.background = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.background = '#f1f5f9';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '0.85rem', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none',
                      color: '#94a3b8', cursor: 'pointer', padding: '0.15rem',
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', marginTop: '0.35rem',
                  background: loading
                    ? 'rgba(79,70,229,0.5)'
                    : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                  color: '#ffffff', border: 'none',
                  borderRadius: '12px',               /* design.md button radius */
                  padding: '0.8rem 1rem',
                  fontSize: '0.9rem', fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: loading ? 'none' : '0 8px 24px rgba(79,70,229,0.35)',
                  transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '0.5rem',
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      display: 'inline-block', width: '16px', height: '16px',
                      border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#ffffff',
                      borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                    }} />
                    Signing In…
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Sign In to Admin Portal
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: '1.5rem', textAlign: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.4rem', color: '#94a3b8', fontSize: '0.775rem',
          }}>
            <Server size={13} />
            <span>
              FastAPI Engine · {import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
