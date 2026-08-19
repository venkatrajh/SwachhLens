import React from 'react';

export const Card = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  headerBorder = true,
  noPadding = false,
  level = '2', // '1' | '2' | '3'
  style = {},
  onClick,
  ...props
}) => {
  const glassBackground =
    level === '1'
      ? 'var(--glass-level-1)'
      : level === '3'
      ? 'var(--glass-level-3)'
      : 'var(--glass-level-2)';

  const glassBlur =
    level === '1'
      ? 'var(--liquid-glass-lg)'
      : level === '3'
      ? 'var(--liquid-glass-xl)'
      : 'var(--liquid-glass-md)';

  const glassShadow =
    level === '1'
      ? 'var(--shadow-lg), inset 0 1px 0 var(--glass-highlight)'
      : level === '3'
      ? 'var(--shadow-xl), inset 0 1px 0 var(--glass-highlight)'
      : 'var(--shadow-md), inset 0 1px 0 var(--glass-highlight)';

  return (
    <div
      className={`ui-liquid-glass-card ${className}`}
      onClick={onClick}
      style={{
        backgroundColor: glassBackground,
        backdropFilter: glassBlur,
        WebkitBackdropFilter: glassBlur,
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: glassShadow,
        transition: 'all var(--transition-normal), var(--transition-theme)',
        overflow: 'hidden',
        position: 'relative',
        ...style
      }}
      {...props}
    >
      {/* Specular Edge Refraction on Top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'var(--glass-specular-edge)',
          pointerEvents: 'none'
        }}
      />

      {(title || subtitle || action) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: headerBorder ? '1px solid var(--border-subtle)' : 'none',
            gap: '12px'
          }}
        >
          <div>
            {title && (
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={{ padding: noPadding ? '0' : '20px' }}>
        {children}
      </div>
    </div>
  );
};
