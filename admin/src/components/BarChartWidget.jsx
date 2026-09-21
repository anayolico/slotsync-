import React from 'react';

export default function BarChartWidget({ appointments = [] }) {
  const confirmed = appointments.filter(a => a.status === 'CONFIRMED').length;
  const pending = appointments.filter(a => a.status === 'PENDING').length;
  const completed = appointments.filter(a => a.status === 'COMPLETED').length;
  const cancelled = appointments.filter(a => a.status === 'CANCELLED' || a.status === 'REJECTED').length;

  const maxVal = Math.max(confirmed, pending, completed, cancelled, 5);

  const getPercent = (count) => Math.min(100, Math.round((count / maxVal) * 100));

  return (
    <div className="card-panel">
      <div className="chart-header">
        <h2 className="chart-title">Appointment Status Breakdown (Live Backend Data)</h2>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#10b981' }} />
            <span>Confirmed ({confirmed})</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#f59e0b' }} />
            <span>Pending ({pending})</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#4f46e5' }} />
            <span>Completed ({completed})</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#ef4444' }} />
            <span>Cancelled ({cancelled})</span>
          </div>
        </div>
      </div>

      {/* SVG / CSS Bar Visualization */}
      <div style={{ position: 'relative', height: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: '1rem' }}>
        {[maxVal, Math.round(maxVal * 0.75), Math.round(maxVal * 0.5), Math.round(maxVal * 0.25), 0].map((val, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', width: '24px', textAlign: 'right' }}>{val}</span>
            <div style={{ flex: 1, borderTop: val === 0 ? '1px solid #cbd5e1' : '1px dashed #e2e8f0' }} />
          </div>
        ))}

        {/* Grouped Bar Grid Overlay */}
        <div style={{
          position: 'absolute',
          left: '40px',
          right: '0',
          top: '10px',
          bottom: '24px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'flex-end'
        }}>
          {/* Confirmed Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{
              width: '32px',
              height: `${getPercent(confirmed)}%`,
              minHeight: confirmed > 0 ? '8px' : '0px',
              background: '#10b981',
              borderRadius: '6px 6px 0 0',
              transition: 'height 0.4s ease'
            }} title={`Confirmed: ${confirmed}`} />
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted)' }}>Confirmed</span>
          </div>

          {/* Pending Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{
              width: '32px',
              height: `${getPercent(pending)}%`,
              minHeight: pending > 0 ? '8px' : '0px',
              background: '#f59e0b',
              borderRadius: '6px 6px 0 0',
              transition: 'height 0.4s ease'
            }} title={`Pending: ${pending}`} />
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted)' }}>Pending</span>
          </div>

          {/* Completed Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{
              width: '32px',
              height: `${getPercent(completed)}%`,
              minHeight: completed > 0 ? '8px' : '0px',
              background: '#4f46e5',
              borderRadius: '6px 6px 0 0',
              transition: 'height 0.4s ease'
            }} title={`Completed: ${completed}`} />
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted)' }}>Completed</span>
          </div>

          {/* Cancelled Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{
              width: '32px',
              height: `${getPercent(cancelled)}%`,
              minHeight: cancelled > 0 ? '8px' : '0px',
              background: '#ef4444',
              borderRadius: '6px 6px 0 0',
              transition: 'height 0.4s ease'
            }} title={`Cancelled: ${cancelled}`} />
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted)' }}>Cancelled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
