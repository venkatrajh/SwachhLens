import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  MapPin,
  Truck,
  BarChart3,
  CheckCircle2,
  Settings,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const Sidebar = () => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/complaints', label: 'Complaints', icon: ClipboardList },
    { to: '/map', label: 'Waste Map', icon: MapPin },
    { to: '/operations', label: 'Operations', icon: Truck },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/verification', label: 'Verification', icon: CheckCircle2 }
  ];

  return (
    <>
      <aside
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--glass-sidebar)',
          backdropFilter: 'var(--liquid-glass-lg)',
          WebkitBackdropFilter: 'var(--liquid-glass-lg)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px 14px',
          flexShrink: 0,
          minHeight: '100%',
          zIndex: 40,
          transition: 'var(--transition-theme)'
        }}
      >
        {/* Navigation Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div
            style={{
              padding: '6px 12px 12px 12px',
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em'
            }}
          >
            Command Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  backgroundColor: isActive ? 'var(--surface-active)' : 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid var(--accent-border)' : '1px solid transparent',
                  boxShadow: isActive ? '0 2px 12px var(--accent-cyan-glow)' : 'none',
                  transition: 'all var(--transition-fast)'
                })}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Bottom utility items: Settings & Help */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)'
          }}
        >
          <button
            onClick={() => setShowSettingsModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '9px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>

          <button
            onClick={() => setShowHelpModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '9px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <HelpCircle size={16} />
            <span>Help & Docs</span>
          </button>

          {/* AI Municipal Engine Info Glass Pill with Cyan Accent */}
          <div
            style={{
              marginTop: '12px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--surface-secondary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '11px',
              boxShadow: 'inset 0 1px 0 var(--glass-highlight)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-primary)' }}>
              <Sparkles size={12} style={{ color: 'var(--accent-primary)' }} />
              <span>SwachhLens AI Engine</span>
            </div>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.35 }}>
              Active severity triage & municipal dispatch active
            </p>
          </div>
        </div>
      </aside>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Municipal System Settings"
        subtitle="Configure dispatch rules, SLA alerts, and notification preferences."
        footer={
          <Button variant="primary" size="sm" onClick={() => setShowSettingsModal(false)}>
            Save Preferences
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Emergency Auto-Escalation</label>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Automatically dispatch priority alerts when AI severity rating exceeds 8.5.
            </p>
          </div>
          <div style={{ padding: '12px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Jurisdiction:</span>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>Greater Chennai Corporation - Zone 5</div>
          </div>
        </div>
      </Modal>

      {/* Help & Docs Modal */}
      <Modal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="SwachhLens Operator Guide"
        subtitle="Quick reference for municipal dispatchers and zonal commissioners."
        footer={
          <Button variant="outline" size="sm" onClick={() => setShowHelpModal(false)}>
            Close
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <p>
            <strong style={{ color: 'var(--text-primary)' }}>1. Resolution Workflow:</strong> Citizen Report → AI Analysis → Priority Triage → Team/Vehicle Assignment → Operations Tracking → Verification.
          </p>
          <p>
            <strong style={{ color: 'var(--text-primary)' }}>2. Priority Levels:</strong>
            <br /><span style={{ color: 'var(--priority-critical)' }}>● Critical:</span> Hazardous, road-blocking, toxic or construction debris (&gt;8.5).
            <br /><span style={{ color: 'var(--priority-high)' }}>● High / Amber:</span> Overflowing commercial dumpsters, dense market waste (7.0 - 8.5).
            <br /><span style={{ color: 'var(--priority-medium)' }}>● Medium:</span> Segregated plastic/organic street litter (4.0 - 6.9).
            <br /><span style={{ color: 'var(--priority-low)' }}>● Low / Green:</span> Garden cuttings, light leaf litter (&lt;4.0).
          </p>
        </div>
      </Modal>
    </>
  );
};
