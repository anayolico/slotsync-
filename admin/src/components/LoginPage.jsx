import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { loginUser } from '../services/api';
import SlotSyncLogo from './SlotSyncLogo';

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

        {/* Animated Background Rings */}
        <div className="animated-ring ring-1" />
        <div className="animated-ring ring-2" />
        <div className="animated-ring ring-3" />
        <div className="animated-ring ring-4" />

        {/* Centered Brand Content */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, margin: 'auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.25))'
          }}>
            <SlotSyncLogo size={80} />
          </div>

          <h1 style={{
            fontSize: '2.75rem',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            fontFamily: "'Outfit', sans-serif",
            textShadow: '0 4px 16px rgba(0,0,0,0.2)'
          }}>
            SLOTSYNC
          </h1>

          <p style={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.85)',
            marginTop: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Admin Control Portal
          </p>
        </div>
      </div>

      {/* ─── RIGHT LOGIN PANEL ─── */}
      <div className="login-form-panel">
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Redesigned Sleek Login Card */}
          <div className="login-card-premium">

            {/* Card Header — Clean title without icon */}
            <div style={{ marginBottom: '1.75rem', textAlign: 'left' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#1e293b',
                fontFamily: "'Outfit', sans-serif",
                lineHeight: 1.2,
                letterSpacing: '-0.02em'
              }}>
                Admin Sign In
              </h2>
              <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '0.25rem', fontWeight: 500 }}>
                Enter your credentials to access the control portal
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#ef4444',
                padding: '0.8rem 1rem',
                borderRadius: '12px',
                fontSize: '0.825rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

              {/* Email */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#475569',
                  marginBottom: '0.45rem',
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="admin@slotsync.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="login-input"
                />
              </div>

              {/* Password */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#475569',
                  marginBottom: '0.45rem',
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
                    className="login-input"
                    style={{ paddingRight: '2.75rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '0.2rem',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="login-submit-btn"
              >
                {loading ? (
                  <>
                    <span className="btn-spinner" />
                    <span>Signing In…</span>
                  </>
                ) : (
                  <span>Sign In to Admin Portal</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        /* Animated Background Rings */
        .animated-ring {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .ring-1 {
          width: 540px;
          height: 540px;
          border: 60px solid rgba(255, 255, 255, 0.07);
          top: -100px;
          right: -120px;
          animation: floatRotate1 16s ease-in-out infinite alternate;
        }

        .ring-2 {
          width: 360px;
          height: 360px;
          border: 45px solid rgba(255, 255, 255, 0.05);
          bottom: -70px;
          left: -70px;
          animation: floatRotate2 20s ease-in-out infinite alternate;
        }

        .ring-3 {
          width: 220px;
          height: 220px;
          border: 30px solid rgba(255, 255, 255, 0.08);
          top: 35%;
          left: -40px;
          animation: pulseRing 12s ease-in-out infinite;
        }

        .ring-4 {
          width: 140px;
          height: 140px;
          border: 20px solid rgba(255, 255, 255, 0.06);
          bottom: 20%;
          right: -20px;
          animation: floatRotate1 14s ease-in-out infinite alternate;
        }

        @keyframes floatRotate1 {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
          50% {
            transform: translate(25px, -30px) rotate(90deg) scale(1.05);
          }
          100% {
            transform: translate(-20px, 20px) rotate(180deg) scale(0.95);
          }
        }

        @keyframes floatRotate2 {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
          50% {
            transform: translate(-30px, 25px) rotate(-90deg) scale(1.08);
          }
          100% {
            transform: translate(20px, -20px) rotate(-180deg) scale(0.92);
          }
        }

        @keyframes pulseRing {
          0%, 100% {
            transform: scale(1) translateY(0);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.15) translateY(-25px);
            opacity: 1;
          }
        }

        /* Redesigned Premium Login Card */
        .login-card-premium {
          background: #ffffff;
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 16px 40px rgba(79, 70, 229, 0.08), 0 2px 10px rgba(0, 0, 0, 0.04);
          border: 1px solid #e2e8f0;
          position: relative;
          overflow: hidden;
        }

        .login-card-premium::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #4f46e5, #06b6d4, #6366f1);
        }

        .login-input {
          width: 100%;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 0.75rem 1rem;
          font-size: 0.9rem;
          color: #0f172a;
          outline: none;
          font-family: inherit;
          transition: all 0.2s ease;
        }

        .login-input:focus {
          border-color: #4f46e5;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.12);
        }

        .login-submit-btn {
          width: 100%;
          margin-top: 0.5rem;
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          padding: 0.85rem 1.25rem;
          font-size: 0.925rem;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          box-shadow: 0 8px 24px rgba(79, 70, 229, 0.35);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .login-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 12px 28px rgba(79, 70, 229, 0.42);
        }

        .login-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
