import React, { useState, useEffect } from 'react';
import { X, Edit3, Briefcase, Tag, FileText, DollarSign, Clock, Globe, CheckCircle2, AlertCircle } from 'lucide-react';
import { updateCreatorProfileAdmin } from '../services/api';

export default function EditCreatorModal({ isOpen, onClose, creator, onCreatorUpdated }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('0');
  const [slotDuration, setSlotDuration] = useState('30');
  const [timezone, setTimezone] = useState('UTC');
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (creator) {
      setTitle(creator.title || '');
      setCategory(creator.category || 'General');
      setBio(creator.bio || '');
      setHourlyRate(creator.hourly_rate !== undefined ? String(creator.hourly_rate) : '0');
      setSlotDuration(creator.slot_duration_minutes ? String(creator.slot_duration_minutes) : '30');
      setTimezone(creator.timezone || 'UTC');
      setIsActive(creator.is_active !== undefined ? creator.is_active : true);
    }
  }, [creator]);

  if (!isOpen || !creator) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const updateData = {
        title,
        category,
        bio,
        hourly_rate: parseFloat(hourlyRate) || 0.0,
        slot_duration_minutes: parseInt(slotDuration, 10) || 30,
        timezone,
        is_active: isActive
      };

      await updateCreatorProfileAdmin(creator.id, updateData);
      setSuccessMsg('Successfully updated creator profile!');

      setTimeout(() => {
        if (onCreatorUpdated) onCreatorUpdated();
        onClose();
        setSuccessMsg(null);
      }, 1000);

    } catch (err) {
      setError(err.message || 'Failed to update creator profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
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
              <Edit3 size={18} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.1 }}>
                Edit Creator Profile
              </h2>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                ID: <span style={{ fontFamily: 'monospace' }}>{creator.id ? creator.id.substring(0, 8) : 'N/A'}</span>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
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
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Tag size={13} /> Category / Profession
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Doctor, Lawyer, Barber..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <FileText size={13} /> Bio / Description Note
            </label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Describe services, offerings, and booking details..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <DollarSign size={13} /> Hourly Rate ($/hr)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                className="form-control"
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
                <option value="15">15 Mins</option>
                <option value="30">30 Mins</option>
                <option value="45">45 Mins</option>
                <option value="60">60 Mins (1h)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Globe size={13} /> Timezone
              </label>
              <input
                type="text"
                className="form-control"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.25rem' }}>
            <label className="form-label">Profile Status</label>
            <select
              className="form-control"
              value={isActive ? 'active' : 'inactive'}
              onChange={(e) => setIsActive(e.target.value === 'active')}
            >
              <option value="active">Active Profile</option>
              <option value="inactive">Inactive Profile</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn-upgrade"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.7rem 1rem', fontSize: '0.9rem' }}
            disabled={loading}
          >
            {loading ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
