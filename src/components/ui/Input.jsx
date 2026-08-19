import React from 'react';

export const Input = ({
  label,
  icon: Icon,
  error,
  helperText,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  style = {},
  disabled = false,
  required = false,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }} className={className}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--text-secondary)'
          }}
        >
          {label} {required && <span style={{ color: 'var(--priority-critical)' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none'
            }}
          >
            <Icon size={16} />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          style={{
            width: '100%',
            padding: Icon ? '9px 12px 9px 38px' : '9px 12px',
            fontSize: '13px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--surface-secondary)',
            border: error ? '1px solid var(--priority-critical)' : '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            outline: 'none',
            transition: 'border-color var(--transition-fast), background-color var(--transition-fast), box-shadow var(--transition-fast)',
            ...style
          }}
          onFocus={(e) => {
            if (!error) {
              e.target.style.borderColor = 'var(--accent-primary)';
              e.target.style.backgroundColor = 'var(--surface-hover)';
              e.target.style.boxShadow = '0 0 10px var(--accent-cyan-glow)';
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.target.style.borderColor = 'var(--border-subtle)';
              e.target.style.backgroundColor = 'var(--surface-secondary)';
              e.target.style.boxShadow = 'none';
            }
          }}
          {...props}
        />
      </div>
      {error && (
        <span style={{ fontSize: '11px', color: 'var(--priority-critical)' }}>{error}</span>
      )}
      {helperText && !error && (
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{helperText}</span>
      )}
    </div>
  );
};
