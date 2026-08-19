import React from 'react';

export const PageContainer = ({
  title,
  subtitle,
  actions,
  children,
  className = '',
  maxWidth = '1400px'
}) => {
  return (
    <div
      style={{
        maxWidth,
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}
      className={`page-container ${className}`}
    >
      {(title || subtitle || actions) && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '4px'
          }}
        >
          <div>
            {title && (
              <h1
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                  lineHeight: 1.2
                }}
              >
                {title}
              </h1>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  marginTop: '4px'
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>{actions}</div>}
        </div>
      )}

      {children}
    </div>
  );
};
