import React, { useState } from 'react';
import { Clock, ChevronDown, ChevronUp, Database, Globe, User, Plus, Edit3 } from 'lucide-react';
import { getAvailabilityRules } from '../services/api';
import ManageAvailabilityModal from './ManageAvailabilityModal';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AvailabilityView({ creators = [] }) {
  const [expandedCreator, setExpandedCreator] = useState(null);
  const [rulesMap, setRulesMap] = useState({}); // { [creatorId]: rules[] }
  const [loadingId, setLoadingId] = useState(null);
  const [selectedCreatorForRules, setSelectedCreatorForRules] = useState(null);

  const loadRulesForCreator = async (creatorId) => {
    setLoadingId(creatorId);
    try {
      const rules = await getAvailabilityRules(creatorId);
      setRulesMap((prev) => ({ ...prev, [creatorId]: Array.isArray(rules) ? rules : [] }));
    } catch {
      setRulesMap((prev) => ({ ...prev, [creatorId]: [] }));
    } finally {
      setLoadingId(null);
    }
  };

  const toggleCreator = async (creator) => {
    const id = creator.id;
    if (expandedCreator === id) {
      setExpandedCreator(null);
      return;
    }

    setExpandedCreator(id);
    if (!rulesMap[id]) {
      await loadRulesForCreator(id);
    }
  };

  const handleRulesUpdated = (creatorId) => {
    loadRulesForCreator(creatorId);
    setExpandedCreator(creatorId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Explanation Banner */}
      <div style={{
        background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '12px',
        padding: '0.85rem 1.15rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.65rem',
        fontSize: '0.825rem', color: '#4338ca', fontWeight: 500,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <User size={16} style={{ flexShrink: 0 }} />
          <span>
            Availability rules are configured <strong>per creator profile</strong> in the <code style={{ fontFamily: 'monospace', background: 'rgba(79,70,229,0.1)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>availability_rules</code> database table.
          </span>
        </div>
      </div>

      {/* Creators List */}
      {creators.length === 0 ? (
        <div className="card-panel" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <Database size={44} style={{ color: 'var(--text-dim)', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>No creator profiles found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Creator profiles must exist in the backend before availability rules can be configured.
          </p>
        </div>
      ) : (
        creators.map((creator) => {
          const isOpen = expandedCreator === creator.id;
          const rules = rulesMap[creator.id] || [];
          const isLoading = loadingId === creator.id;

          return (
            <div
              key={creator.id}
              className="card-panel"
              style={{ padding: '0', overflow: 'hidden', transition: 'box-shadow 0.2s' }}
            >
              {/* Creator Row Header */}
              <div
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', padding: '1.1rem 1.5rem',
                  background: isOpen ? '#f8faff' : '#ffffff',
                  borderBottom: isOpen ? '1px solid var(--border-color)' : 'none',
                  flexWrap: 'wrap', gap: '0.75rem',
                }}
              >
                <div 
                  onClick={() => toggleCreator(creator)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', cursor: 'pointer', flex: '1 1 240px' }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                  }}>
                    {creator.title ? creator.title.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      {creator.title || 'Creator Profile'}
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.1rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Clock size={11} /> {creator.slot_duration_minutes || 30} min slots
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Globe size={11} /> {creator.timezone || 'UTC'}
                      </span>
                      <span className="filter-pill" style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem' }}>
                        {creator.category || 'General'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {/* Action Button to Add/Edit Rules */}
                  <button
                    className="btn-upgrade"
                    style={{
                      width: 'auto',
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.775rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCreatorForRules(creator);
                    }}
                  >
                    <Plus size={14} />
                    <span>+ Add / Edit Rules</span>
                  </button>

                  <button
                    onClick={() => toggleCreator(creator)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}
                  >
                    {isOpen
                      ? <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} />
                      : <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />
                    }
                  </button>
                </div>
              </div>

              {/* Expandable Rules Panel */}
              {isOpen && (
                <div style={{ padding: '1.25rem 1.5rem' }}>
                  {isLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>
                      <span style={{
                        display: 'inline-block', width: '16px', height: '16px',
                        border: '2px solid rgba(79,70,229,0.3)', borderTopColor: '#4f46e5',
                        borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                      }} />
                      Loading availability rules from backend…
                    </div>
                  ) : rules.length === 0 ? (
                    <div style={{
                      textAlign: 'center', padding: '1.5rem',
                      background: 'var(--bg-input)', borderRadius: 'var(--radius-md)',
                      color: 'var(--text-muted)', fontSize: '0.85rem',
                    }}>
                      <Clock size={28} style={{ color: 'var(--text-dim)', marginBottom: '0.5rem' }} />
                      <div style={{ fontWeight: 700 }}>No availability rules set</div>
                      <div style={{ fontSize: '0.775rem', marginTop: '0.2rem' }}>
                        This creator has not configured a weekly schedule yet.
                      </div>
                      <button
                        className="filter-pill"
                        style={{ marginTop: '0.75rem', background: '#4f46e5', color: '#fff', borderColor: '#4f46e5', padding: '0.35rem 0.85rem', fontSize: '0.775rem' }}
                        onClick={() => setSelectedCreatorForRules(creator)}
                      >
                        + Create Rules for {creator.title || 'Creator'}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          WEEKLY SCHEDULE (`availability_rules` · creator_id: {creator.id ? `${creator.id.substring(0, 8)}...` : 'N/A'})
                        </p>
                        <button
                          className="filter-pill"
                          style={{ fontSize: '0.725rem', padding: '0.25rem 0.65rem' }}
                          onClick={() => setSelectedCreatorForRules(creator)}
                        >
                          <Edit3 size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                          Edit Schedule
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                        {rules.map((rule) => (
                          <div key={rule.id || Math.random()} style={{
                            background: '#f8faff',
                            border: '1px solid #c7d2fe',
                            borderRadius: '12px',
                            padding: '0.85rem 1rem',
                            display: 'flex', flexDirection: 'column', gap: '0.3rem',
                          }}>
                            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#4f46e5' }}>
                              {WEEKDAYS[rule.day_of_week] ?? `Day ${rule.day_of_week}`}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              <Clock size={13} />
                              <span style={{ fontWeight: 600 }}>{rule.start_time}</span>
                              <span>→</span>
                              <span style={{ fontWeight: 600 }}>{rule.end_time}</span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                              day_of_week: {rule.day_of_week}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Manage Availability Rules Modal */}
      <ManageAvailabilityModal
        isOpen={!!selectedCreatorForRules}
        onClose={() => setSelectedCreatorForRules(null)}
        creator={selectedCreatorForRules}
        onRulesUpdated={handleRulesUpdated}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
