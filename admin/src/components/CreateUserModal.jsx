import React, { useState } from 'react';
import { X, UserPlus, Shield, AlertCircle, CheckCircle2, Briefcase, DollarSign, Clock, FileText, Tag } from 'lucide-react';
import { registerUser } from '../services/api';

export default function CreateUserModal({ isOpen, onClose, onUserCreated }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CLIENT');

  // Creator Specific Fields
  const [category, setCategory] = useState('General');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('0');
  const [slotDuration, setSlotDuration] = useState('30');

  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const creatorData = role === 'CREATOR' ? {
        category: category || 'General',
        title: title || `${fullName}'s Service`,
        bio: bio || 'Welcome to my SlotSync page. Book a slot below!',
        hourly_rate: parseFloat(hourlyRate) || 0.0,
        slot_duration_minutes: parseInt(slotDuration, 10) || 30
      } : {};

      await registerUser(email, password, fullName, role, creatorData);
      setSuccessMsg(`Successfully created ${role} account for ${fullName}!`);
      
      setTimeout(() => {
        if (onUserCreated) onUserCreated();
        onClose();
        // Reset form
        setFullName('');
        setEmail('');
        setPassword('');
        setRole('CLIENT');
        setCategory('General');
        setTitle('');
        setBio('');
        setHourlyRate('0');
        setSlotDuration('30');
        setSuccessMsg(null);
      }, 1200);

    } catch (err) {
      setError(err.message || 'Failed to create user account. Check email or server status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: role === 'CREATOR' ? '540px' : '440px', transition: 'max-width 0.3s ease' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(79,70,229,0.25)'
            }}>
              <UserPlus size={20} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.1 }}>
                Create New Account
              </h2>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                Register a Client, Creator, or Admin in backend database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: '50%',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: 'var(--success)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.825rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'var(--danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--danger)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.825rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: role === 'CREATOR' ? '1fr 1fr' : '1fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Onyebuchi Aboy"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="user@slotsync.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Role (`UserRole`)</label>
              <select
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="CLIENT">CLIENT (Standard User)</option>
                <option value="CREATOR">CREATOR (Slot Provider)</option>
                <option value="ADMIN">ADMIN (System Manager)</option>
              </select>
            </div>
          </div>

          {/* Expanded Creator Profile Inputs */}
          {role === 'CREATOR' && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 'var(--radius-md)',
              padding: '1.1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              marginTop: '0.25rem'
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Briefcase size={16} /> Creator Profile Details
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Tag size={13} /> Profession / Category
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Doctor, Lawyer, Barber..."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Briefcase size={13} /> Service Title
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Senior Cardiologist"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <FileText size={13} /> Bio / Offering Description Note
                </label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Describe services, background, and what clients can expect..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <DollarSign size={13} /> Hourly Rate ($/hr)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    className="form-control"
                    placeholder="e.g. 120"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={13} /> Slot Duration
                  </label>
                  <select
                    className="form-control"
                    value={slotDuration}
                    onChange={(e) => setSlotDuration(e.target.value)}
                  >
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="45">45 Minutes</option>
                    <option value="60">60 Minutes (1 Hour)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn-upgrade"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.7rem 1rem', fontSize: '0.9rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : role === 'CREATOR' ? 'Create Creator Account & Profile' : 'Create User Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
