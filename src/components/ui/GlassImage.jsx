import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';

export const GlassImage = ({
  src,
  alt = 'Municipal Incident Capture',
  height = '240px',
  label = 'Visual Evidence',
  caption = '',
  style = {}
}) => {
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    setHasError(!src);
  }, [src]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--glass-border)',
        backgroundColor: 'var(--glass-surface-strong)',
        backdropFilter: 'var(--liquid-glass-md)',
        boxShadow: 'var(--shadow-md), inset 0 1px 0 var(--glass-highlight)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
    >
      {!hasError && src ? (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      ) : (
        /* Polished Liquid Glass Fallback Placeholder */
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '24px',
            textAlign: 'center',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, var(--accent-subtle) 0%, transparent 80%)'
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: 'var(--surface-secondary)',
              border: '1px solid var(--accent-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
              boxShadow: '0 0 16px var(--accent-glow)'
            }}
          >
            <Camera size={22} />
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {label}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '240px' }}>
            {caption || 'Municipal field inspection photo securely registered on SwachhLens AI gateway.'}
          </span>
        </div>
      )}

      {/* Subtle Bottom Metadata Bar */}
      {caption && !hasError && (
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            backgroundColor: 'var(--glass-modal)',
            backdropFilter: 'blur(8px)',
            color: 'var(--text-primary)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--glass-border)',
            fontSize: '10px',
            fontFamily: 'var(--font-mono)'
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
};
