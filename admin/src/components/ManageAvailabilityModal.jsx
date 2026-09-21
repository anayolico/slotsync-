import React, { useState, useEffect } from 'react';
import { X, Clock, Plus, Trash2, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { getAvailabilityRules, setCreatorAvailabilityRulesAdmin } from '../services/api';

const WEEKDAYS = [
  { id: 0, name: 'Monday' },
  { id: 1, name: 'Tuesday' },
  { id: 2, name: 'Wednesday' },
  { id: 3, name: 'Thursday' },
  { id: 4, name: 'Friday' },
  { id: 5, name: 'Saturday' },
  { id: 6, name: 'Sunday' },
];

export default function ManageAvailabilityModal({ isOpen, onClose, creator, onRulesUpdated }) {
  const [rules, setRules] = useState([]);
  const [newDay, setNewDay] = useState(0);
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('17:00');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (isOpen && creator) {
      loadRules();
    }
  }, [isOpen, creator]);

  const loadRules = async () => {
    setFetching(true);
    setError(null);
    try {
      const data = await getAvailabilityRules(creator.id);
      if (Array.isArray(data)) {
        setRules(data.map(r => ({
          day_of_week: r.day_of_week,
          start_time: r.start_time,
          end_time: r.end_time
        })));
      } else {
        setRules([]);
      }
    } catch {
      setRules([]);
    } finally {
      setFetching(false);
    }
  };

  if (!isOpen || !creator) return null;

  const handleAddRule = () => {
    // Check if rule for day already exists
    const existingIdx = rules.findIndex(r => r.day_of_week === parseInt(newDay, 10));
    const newRuleItem = {
      day_of_week: parseInt(newDay, 10),
      start_time: newStartTime,
      end_time: newEndTime,
    };

    if (existingIdx >= 0) {
      const updated = [...rules];
      updated[existingIdx] = newRuleItem;
      setRules(updated);
    } else {
      setRules([...rules, newRuleItem].sort((a, b) => a.day_of_week - b.day_of_week));
    }
  };

  const handleRemoveRule = (dayOfWeek) => {
    setRules(rules.filter(r => r.day_of_week !== dayOfWeek));
  };

  const handleSaveAll = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const formattedRules = rules.map(r => ({
        day_of_week: parseInt(r.day_of_week, 10),
        start_time: r.start_time,
        end_time: r.end_time
      }));

      await setCreatorAvailabilityRulesAdmin(creator.id, formattedRules);
      setSuccessMsg('Successfully saved weekly availability rules!');

      setTimeout(() => {
        if (onRulesUpdated) onRulesUpdated(creator.id);
        onClose();
        setSuccessMsg(null);
      }, 1000);

    } catch (err) {
      setError(err.message || 'Failed to save availability rules.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
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
              <Clock size={20} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.1 }}>
                Manage Availability Rules
              </h2>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                Creator: <strong style={{ color: 'var(--text-main)' }}>{creator.title || 'Creator Profile'}</strong>
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

        {/* Alerts */}
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

        {/* Form to Add a Day Rule */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Plus size={15} /> Add or Update Working Hours Rule
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.65rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Day of Week</label>
              <select
                className="form-control"
                value={newDay}
                onChange={(e) => setNewDay(e.target.value)}
              >
                {WEEKDAYS.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Start Time</label>
              <input
                type="text"
                className="form-control"
                placeholder="09:00"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>End Time</label>
              <input
                type="text"
                className="form-control"
                placeholder="17:00"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
              />
            </div>
          </div>

          <button
            type="button"
            className="filter-pill"
            onClick={handleAddRule}
            style={{
              alignSelf: 'flex-end',
              background: '#4f46e5',
              color: '#ffffff',
              borderColor: '#4f46e5',
              padding: '0.35rem 0.85rem',
              fontSize: '0.775rem'
            }}
          >
            + Add / Set Rule for Day
          </button>
        </div>

        {/* Current Rules List */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.65rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Configured Weekly Schedule ({rules.length} Days)</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>0=Mon ... 6=Sun</span>
          </div>

          {fetching ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
              Loading rules from server...
            </div>
          ) : rules.length === 0 ? (
            <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', fontSize: '0.825rem' }}>
              No rules set for this creator yet. Use the form above to add working days.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {rules.map((rule) => (
                <div key={rule.day_of_week} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.6rem 0.85rem',
                  fontSize: '0.825rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Calendar size={15} style={{ color: '#4f46e5' }} />
                    <span style={{ fontWeight: 700, width: '90px' }}>
                      {WEEKDAYS.find(w => w.id === parseInt(rule.day_of_week, 10))?.name || `Day ${rule.day_of_week}`}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      <Clock size={12} style={{ display: 'inline', marginRight: '0.2rem' }} />
                      {rule.start_time} — {rule.end_time}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveRule(rule.day_of_week)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.2rem' }}
                    title="Remove Day Rule"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <form onSubmit={handleSaveAll}>
          <button
            type="submit"
            className="btn-upgrade"
            style={{ width: '100%', padding: '0.7rem 1rem', fontSize: '0.9rem' }}
            disabled={loading}
          >
            {loading ? 'Saving Schedule...' : 'Save Availability Schedule'}
          </button>
        </form>
      </div>
    </div>
  );
}
