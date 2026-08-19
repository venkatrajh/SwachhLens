import React from 'react';
import { FileQuestion } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = FileQuestion,
  title = "No data available",
  description = "There are no records matching your current filter criteria.",
  actionLabel,
  onAction,
  className = ""
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center'
      }}
      className={className}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--surface-secondary)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-primary)',
          marginBottom: '16px',
          boxShadow: '0 0 16px var(--accent-cyan-glow)'
        }}
      >
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
        {title}
      </h4>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: actionLabel ? '16px' : 0 }}>
        {description}
      </p>
      {actionLabel && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  className = ""
}) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        padding: '3px',
        backgroundColor: 'var(--surface-secondary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        gap: '4px'
      }}
      className={className}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: isActive ? 600 : 500,
              borderRadius: 'var(--radius-md)',
              backgroundColor: isActive ? 'var(--surface-active)' : 'transparent',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
              boxShadow: isActive ? '0 2px 8px var(--accent-cyan-glow)' : 'none',
              border: isActive ? '1px solid var(--accent-border)' : '1px solid transparent',
              transition: 'all var(--transition-fast)'
            }}
          >
            {tab.label} {tab.count !== undefined && `(${tab.count})`}
          </button>
        );
      })}
    </div>
  );
};
