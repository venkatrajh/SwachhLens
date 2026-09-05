import React from 'react';
import { Card } from './Card';

export const KPICard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'neutral', // positive | negative | neutral
  accentColor,
  onClick
}) => {
  return (
    <Card
      level="2"
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Subtle Cyan / Semantic Ambient Edge Glow on top */}
      {accentColor ? (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            backgroundColor: accentColor,
            boxShadow: `0 0 12px ${accentColor}`
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'var(--glass-specular-edge)'
          }}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--surface-secondary)',
              backdropFilter: 'var(--liquid-glass-sm)',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
              boxShadow: 'inset 0 1px 0 var(--glass-highlight)'
            }}
          >
            <Icon size={16} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span
          className="mono"
          style={{
            fontSize: '28px',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            lineHeight: 1
          }}
        >
          {value}
        </span>
        {trend && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color:
                trendType === 'positive'
                  ? 'var(--status-completed)'
                  : trendType === 'negative'
                  ? 'var(--priority-critical)'
                  : 'var(--text-muted)'
            }}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
          {subtitle}
        </p>
      )}
    </Card>
  );
};
