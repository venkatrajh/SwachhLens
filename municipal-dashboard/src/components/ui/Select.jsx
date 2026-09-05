import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = ({
  label,
  options = [],
  value,
  onChange,
  error,
  helperText,
  id,
  className = '',
  style = {},
  disabled = false,
  required = false,
  placeholder = 'Select option...',
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }} className={className}>
      {label && (
        <label
          htmlFor={selectId}
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
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          style={{
            width: '100%',
            padding: '9px 36px 9px 12px',
            fontSize: '13px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--surface-secondary)',
            border: error ? '1px solid var(--priority-critical)' : '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            outline: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
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
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => {
            const optVal = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={optVal} value={optVal} style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                {optLabel}
              </option>
            );
          })}
        </select>
        <div
          style={{
            position: 'absolute',
            right: '12px',
            pointerEvents: 'none',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ChevronDown size={15} />
        </div>
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
