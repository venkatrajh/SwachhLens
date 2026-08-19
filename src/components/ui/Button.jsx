import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // primary | secondary | outline | ghost | danger | success
  size = 'md', // sm | md | lg | iconSm | iconMd
  icon: Icon,
  iconPosition = 'left',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  style = {},
  ...props
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
    transition: 'all var(--transition-fast)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    whiteSpace: 'nowrap',
    fontFamily: 'inherit',
    border: '1px solid transparent',
    outline: 'none',
    position: 'relative'
  };

  const sizes = {
    sm: { padding: '6px 12px', fontSize: '12px' },
    md: { padding: '8px 16px', fontSize: '13px' },
    lg: { padding: '11px 20px', fontSize: '14px', fontWeight: 600 },
    iconSm: { padding: '6px', width: '32px', height: '32px' },
    iconMd: { padding: '8px', width: '38px', height: '38px' }
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--accent-primary)',
      color: 'var(--text-inverse)',
      borderColor: 'var(--accent-primary)',
      boxShadow: '0 2px 12px var(--accent-cyan-glow)'
    },
    secondary: {
      backgroundColor: 'var(--surface-secondary)',
      color: 'var(--text-primary)',
      borderColor: 'var(--glass-border)',
      boxShadow: 'var(--shadow-xs)'
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--text-primary)',
      borderColor: 'var(--glass-border)'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)',
      borderColor: 'transparent'
    },
    danger: {
      backgroundColor: 'var(--priority-critical-bg)',
      color: 'var(--priority-critical)',
      borderColor: 'var(--priority-critical-border)'
    },
    success: {
      backgroundColor: 'var(--status-completed-bg)',
      color: 'var(--status-completed)',
      borderColor: 'var(--status-completed-border)'
    }
  };

  const currentSize = sizes[size] || sizes.md;
  const currentVariant = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        ...baseStyles,
        ...currentSize,
        ...currentVariant,
        ...style
      }}
      className={`ui-button ${className}`}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === 'primary') {
          e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)';
          e.currentTarget.style.boxShadow = '0 4px 16px var(--accent-cyan-glow)';
        } else if (variant === 'secondary' || variant === 'outline') {
          e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
          e.currentTarget.style.borderColor = 'var(--accent-primary)';
        } else if (variant === 'ghost') {
          e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        if (variant === 'primary') {
          e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
          e.currentTarget.style.boxShadow = '0 2px 12px var(--accent-cyan-glow)';
        } else if (variant === 'secondary') {
          e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
          e.currentTarget.style.borderColor = 'var(--glass-border)';
        } else if (variant === 'outline') {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = 'var(--glass-border)';
        } else if (variant === 'ghost') {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }
      }}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 16} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 16} />}
    </button>
  );
};
