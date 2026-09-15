import React, { useState, useEffect } from 'react';
import { Camera, Maximize2, X, ZoomIn, AlertCircle } from 'lucide-react';

export const GlassImage = ({
  src,
  alt = 'Municipal Incident Capture',
  height = '280px',
  label = 'Visual Evidence',
  caption = '',
  style = {},
  enableLightbox = true,
  objectFit = 'contain'
}) => {
  const resolveSrc = (url) => {
    if (!url) return '';
    const trimmed = String(url).trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
      return trimmed;
    }
    if (trimmed.startsWith('/media/')) {
      return `http://localhost:8000${trimmed}`;
    }
    if (trimmed.startsWith('media/')) {
      return `http://localhost:8000/${trimmed}`;
    }
    return trimmed;
  };

  const resolvedUrl = resolveSrc(src);
  const [hasError, setHasError] = useState(!resolvedUrl);
  const [isLoading, setIsLoading] = useState(!!resolvedUrl);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    setHasError(!resolvedUrl);
    setIsLoading(!!resolvedUrl);
  }, [resolvedUrl]);

  // Handle Escape key to close Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  const handleImageClick = () => {
    if (enableLightbox && !hasError && resolvedUrl) {
      setIsLightboxOpen(true);
    }
  };

  return (
    <>
      <div
        onClick={handleImageClick}
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
          cursor: enableLightbox && !hasError && resolvedUrl ? 'pointer' : 'default',
          transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
          ...style
        }}
        title={enableLightbox && !hasError && resolvedUrl ? 'Click to inspect in full-resolution lightbox' : undefined}
      >
        {/* Loading Skeleton */}
        {isLoading && !hasError && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--surface-secondary)',
              zIndex: 1,
              animation: 'pulse 1.8s infinite ease-in-out'
            }}
          >
            <Camera size={24} style={{ color: 'var(--accent-primary)', opacity: 0.6 }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Loading visual evidence...</span>
          </div>
        )}

        {!hasError && resolvedUrl ? (
          <>
            <img
              src={resolvedUrl}
              alt={alt}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit,
                display: isLoading ? 'none' : 'block',
                transition: 'transform var(--transition-fast)'
              }}
            />

            {/* Hover Zoom Hint Overlay */}
            {enableLightbox && !isLoading && (
              <div
                className="glass-image-hover-hint"
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: 'rgba(0, 0, 0, 0.55)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  pointerEvents: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}
              >
                <Maximize2 size={12} />
                <span>Enlarge</span>
              </div>
            )}
          </>
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
        {caption && !hasError && !isLoading && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              right: '10px',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(8px)',
              color: '#FFFFFF',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }}
          >
            {caption}
          </div>
        )}
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(5, 7, 15, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {/* Top Bar with Title & Close Button */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '90vw',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
              color: '#FFFFFF'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.01em' }}>
                {label}
              </span>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                (High-Resolution Evidence Viewer)
              </span>
            </div>

            <button
              onClick={() => setIsLightboxOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#FFFFFF',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              title="Close (Esc)"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Image Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '80vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              overflow: 'hidden',
              padding: '8px'
            }}
          >
            <img
              src={resolvedUrl}
              alt={alt}
              style={{
                maxWidth: '100%',
                maxHeight: '76vh',
                objectFit: 'contain',
                borderRadius: 'var(--radius-md)'
              }}
            />
          </div>

          {/* Bottom Caption Bar */}
          {caption && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '90vw',
                marginTop: '12px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#E2E8F0',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                textAlign: 'center'
              }}
            >
              {caption}
            </div>
          )}
        </div>
      )}
    </>
  );
};
