import React from 'react';

export const Badge = ({
  children,
  variant = 'default', // default | critical | high | medium | low | success | info
  size = 'md', // sm | md
  className = '',
  style = {},
  dot = false,
  ...props
}) => {
  const variants = {
    default: {
      backgroundColor: 'var(--surface-secondary)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-subtle)'
    },
    critical: {
      backgroundColor: 'var(--priority-critical-bg)',
      color: 'var(--priority-critical)',
      border: '1px solid var(--priority-critical-border)',
      boxShadow: '0 0 10px rgba(251, 113, 133, 0.1)'
    },
    high: {
      backgroundColor: 'var(--priority-high-bg)',
      color: 'var(--priority-high)',
      border: '1px solid var(--priority-high-border)'
    },
    medium: {
      backgroundColor: 'var(--priority-medium-bg)',
      color: 'var(--priority-medium)',
      border: '1px solid var(--priority-medium-border)'
    },
    low: {
      backgroundColor: 'var(--priority-low-bg)',
      color: 'var(--priority-low)',
      border: '1px solid var(--priority-low-border)'
    },
    success: {
      backgroundColor: 'var(--status-completed-bg)',
      color: 'var(--status-completed)',
      border: '1px solid var(--status-completed-border)'
    },
    info: {
      backgroundColor: 'var(--accent-cyan-subtle)',
      color: 'var(--accent-primary)',
      border: '1px solid var(--accent-border)'
    }
  };

  const sizes = {
    sm: { padding: '2px 8px', fontSize: '11px' },
    md: { padding: '4px 10px', fontSize: '12px' }
  };

  const currentVariant = variants[variant] || variants.default;
  const currentSize = sizes[size] || sizes.md;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: 600,
        borderRadius: 'var(--radius-full)',
        letterSpacing: '0.03em',
        ...currentVariant,
        ...currentSize,
        ...style
      }}
      className={`ui-badge ${className}`}
      {...props}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            boxShadow: '0 0 6px currentColor'
          }}
        />
      )}
      {children}
    </span>
  );
};

export const StatusBadge = ({ status, priority, severity }) => {
  if (priority) {
    const p = String(priority).toUpperCase();
    let variant = 'default';
    if (p === 'CRITICAL') variant = 'critical';
    else if (p === 'HIGH') variant = 'high';
    else if (p === 'MEDIUM') variant = 'medium';
    else if (p === 'LOW') variant = 'low';

    return (
      <Badge variant={variant} dot>
        {p} {severity !== undefined && `(${severity})`}
      </Badge>
    );
  }

  if (status) {
    const s = String(status).toLowerCase();
    let variant = 'default';
    if (s.includes('completed') || s.includes('verified')) variant = 'success';
    else if (s.includes('assigned') || s.includes('progress')) variant = 'info';
    else if (s.includes('escalated') || s.includes('critical')) variant = 'critical';
    else if (s.includes('pending')) variant = 'default';
    let label = status;
    if (s === 'analyzing') {
      label = 'AI Analyzed';
      variant = 'primary';
    } else if (s === 'in_progress') {
      label = 'In Progress';
    } else {
      label = String(status).charAt(0).toUpperCase() + String(status).slice(1);
    }

    return (
      <Badge variant={variant} dot>
        {label}
      </Badge>
    );
  }

  return <Badge>Normal</Badge>;
};
