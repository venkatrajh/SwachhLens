import React from 'react';
import { Check, Circle } from 'lucide-react';

export const Timeline = ({
  steps = [],
  orientation = 'vertical', // vertical | horizontal
  className = ''
}) => {
  if (orientation === 'horizontal') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          position: 'relative',
          width: '100%',
          padding: '12px 0'
        }}
        className={className}
      >
        {steps.map((step, idx) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isLast = idx === steps.length - 1;

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: isLast ? '0 0 auto' : 1,
                position: 'relative'
              }}
            >
              {!isLast && (
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '50%',
                    right: '-50%',
                    height: '2px',
                    backgroundColor: isCompleted ? 'var(--status-completed)' : 'var(--border-subtle)',
                    zIndex: 1
                  }}
                />
              )}
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: isCompleted
                    ? 'var(--status-completed)'
                    : isCurrent
                    ? 'var(--accent-cyan-subtle)'
                    : 'var(--surface-secondary)',
                  border: isCurrent
                    ? '2px solid var(--accent-primary)'
                    : isCompleted
                    ? '2px solid var(--status-completed)'
                    : '1px solid var(--border-subtle)',
                  color: isCompleted ? '#ffffff' : 'var(--accent-primary)',
                  boxShadow: isCurrent ? '0 0 12px var(--accent-cyan-glow)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                  marginBottom: '8px'
                }}
              >
                {isCompleted ? <Check size={13} strokeWidth={3} /> : isCurrent ? <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }} /> : null}
              </div>
              <span style={{ fontSize: '11px', fontWeight: isCurrent ? 600 : 500, color: isCurrent || isCompleted ? 'var(--text-primary)' : 'var(--text-muted)', textAlign: 'center' }}>
                {step.label}
              </span>
              {step.time && (
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {step.time}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }} className={className}>
      {steps.map((step, idx) => {
        const isCompleted = step.status === 'completed';
        const isCurrent = step.status === 'current';
        const isLast = idx === steps.length - 1;

        return (
          <div key={idx} style={{ display: 'flex', gap: '16px', position: 'relative', minHeight: '48px' }}>
            {/* Timeline track line */}
            {!isLast && (
              <div
                style={{
                  position: 'absolute',
                  left: '11px',
                  top: '24px',
                  bottom: '-4px',
                  width: '2px',
                  backgroundColor: isCompleted ? 'var(--status-completed)' : 'var(--border-subtle)',
                  zIndex: 1
                }}
              />
            )}

            {/* Step icon node */}
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: isCompleted
                  ? 'var(--status-completed)'
                  : isCurrent
                  ? 'var(--accent-cyan-subtle)'
                  : 'var(--surface-secondary)',
                border: isCurrent
                  ? '2px solid var(--accent-primary)'
                  : isCompleted
                  ? '2px solid var(--status-completed)'
                  : '1px solid var(--border-subtle)',
                color: isCompleted ? '#ffffff' : 'var(--accent-primary)',
                boxShadow: isCurrent ? '0 0 12px var(--accent-cyan-glow)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                zIndex: 2
              }}
            >
              {isCompleted ? (
                <Check size={13} strokeWidth={3} />
              ) : isCurrent ? (
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }} />
              ) : (
                <Circle size={8} style={{ color: 'var(--text-muted)' }} />
              )}
            </div>

            {/* Step info */}
            <div style={{ flex: 1, paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: isCurrent ? 600 : isCompleted ? 500 : 400,
                    color: isCurrent ? 'var(--text-primary)' : isCompleted ? 'var(--text-primary)' : 'var(--text-muted)'
                  }}
                >
                  {step.label}
                </span>
                {step.time && (
                  <span
                    className="mono"
                    style={{
                      fontSize: '11px',
                      color: isCurrent ? 'var(--text-primary)' : 'var(--text-muted)'
                    }}
                  >
                    {step.time}
                  </span>
                )}
              </div>
              {step.description && (
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
