import React from 'react';

export const ProgressBar = ({
  value = 0,
  max = 100,
  height = 7,
  color = 'var(--accent-primary)',
  showLabel = false,
  className = ''
}) => {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }} className={className}>
      <div
        style={{
          flex: 1,
          height: `${height}px`,
          backgroundColor: 'var(--surface-secondary)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 0 10px var(--accent-cyan-glow)',
            transition: 'width var(--transition-normal)'
          }}
        />
      </div>
      {showLabel && (
        <span className="mono" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', minWidth: '32px' }}>
          {percentage}%
        </span>
      )}
    </div>
  );
};
