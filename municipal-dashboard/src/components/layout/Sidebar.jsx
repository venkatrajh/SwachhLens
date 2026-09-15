import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Bell,
  Volume2,
  RefreshCw,
  Layers,
  Shield,
  Clock,
  Phone,
  Check
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user } = useAuth();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Persistent Municipal Settings
  const [settingsState, setSettingsState] = useState(() => {
    try {
      const saved = localStorage.getItem('swachhlens_municipal_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      autoRefreshInterval: '30',
      autoEscalation: true,
      soundAlerts: true,
      desktopNotifications: true,
      mapStyle: 'dark',
      minSeverityAlert: '8.5'
    };
  });

  const handleSaveSettings = () => {
    try {
      localStorage.setItem('swachhlens_municipal_settings', JSON.stringify(settingsState));
    } catch {
      // ignore
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setShowSettingsModal(false);
    }, 900);
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/complaints', label: 'Complaints', icon: ClipboardList },
    { to: '/map', label: 'Waste Map', icon: MapPin },
    { to: '/operations', label: 'Operations', icon: Truck },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/verification', label: 'Verification', icon: CheckCircle2 }
  ];

  const jurisdictionLabel = user?.ward 
    ? `Ward ${user.ward}` 
    : (user?.department ? `${user.department} • Nationwide Jurisdiction` : 'All India / Nationwide Jurisdiction');

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
              backgroundColor: 'transparent',
              border: 'none',
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
              backgroundColor: 'transparent',
              border: 'none',
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
        subtitle="Configure dispatch rules, SLA alerts, and real-time monitoring preferences."
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span style={{ fontSize: '12px', color: savedSuccess ? 'var(--status-completed)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {savedSuccess ? <><Check size={14} /> Preferences Saved Successfully!</> : 'Changes persist to local browser storage.'}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="ghost" size="sm" onClick={() => setShowSettingsModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveSettings}>
                {savedSuccess ? 'Saved' : 'Save Preferences'}
              </Button>
            </div>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Active Jurisdiction Info Box */}
          <div style={{ padding: '12px 14px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>Active Officer Jurisdiction:</span>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{jurisdictionLabel}</div>
            </div>
            <Shield size={20} style={{ color: 'var(--accent-primary)' }} />
          </div>

          {/* Auto Refresh Setting */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                <RefreshCw size={14} style={{ color: 'var(--accent-primary)' }} />
                <span>Auto-Refresh Feed</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Automatically refresh incident inbox and live map
              </p>
            </div>
            <select
              value={settingsState.autoRefreshInterval}
              onChange={(e) => setSettingsState(prev => ({ ...prev, autoRefreshInterval: e.target.value }))}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--surface-primary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                outline: 'none'
              }}
            >
              <option value="15">Every 15s</option>
              <option value="30">Every 30s</option>
              <option value="60">Every 60s</option>
              <option value="0">Disabled (Manual only)</option>
            </select>
          </div>

          {/* Emergency Auto Escalation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                <Bell size={14} style={{ color: 'var(--priority-critical)' }} />
                <span>Emergency Auto-Escalation</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Trigger priority dispatch when AI severity ≥ {settingsState.minSeverityAlert}
              </p>
            </div>
            <input
              type="checkbox"
              checked={settingsState.autoEscalation}
              onChange={(e) => setSettingsState(prev => ({ ...prev, autoEscalation: e.target.checked }))}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
            />
          </div>

          {/* Sound Alerts */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                <Volume2 size={14} style={{ color: 'var(--accent-primary)' }} />
                <span>Audio Alert Chimes</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Play auditory alert upon receiving critical incident reports
              </p>
            </div>
            <input
              type="checkbox"
              checked={settingsState.soundAlerts}
              onChange={(e) => setSettingsState(prev => ({ ...prev, soundAlerts: e.target.checked }))}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
            />
          </div>

          {/* Map Layer Style */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                <Layers size={14} style={{ color: 'var(--accent-primary)' }} />
                <span>Default Map Layer</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Cartographic base theme for GIS operations view
              </p>
            </div>
            <select
              value={settingsState.mapStyle}
              onChange={(e) => setSettingsState(prev => ({ ...prev, mapStyle: e.target.value }))}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--surface-primary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                outline: 'none'
              }}
            >
              <option value="dark">Dark Liquid Glass</option>
              <option value="streets">Standard Street Grid</option>
              <option value="satellite">Satellite Photogrammetry</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Help & Docs Modal */}
      <Modal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="SwachhLens Municipal Operator Reference Guide"
        subtitle="Standard Operating Procedures for dispatchers, inspectors, and commissioners."
        footer={
          <Button variant="outline" size="sm" onClick={() => setShowHelpModal(false)}>
            Close Guide
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px' }}>
          {/* Section 1: Workflow Lifecycle */}
          <div style={{ padding: '12px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} /> 1. Incident Resolution Lifecycle
            </h4>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <strong>Stage 1:</strong> Citizen submission with GPS geotag & photo evidence.<br />
              <strong>Stage 2:</strong> AI Vision classification (waste type, volume, severity score).<br />
              <strong>Stage 3:</strong> Municipal Triage & Crew/Vehicle assignment.<br />
              <strong>Stage 4:</strong> Field Cleanup Execution (In Progress).<br />
              <strong>Stage 5:</strong> After-cleanup clearance photo upload.<br />
              <strong>Stage 6:</strong> Municipal Official verification & final closure.
            </div>
          </div>

          {/* Section 2: Severity & SLA Matrix */}
          <div style={{ padding: '12px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} /> 2. Severity Triage & SLA Matrix
            </h4>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <span style={{ color: 'var(--priority-critical)', fontWeight: 700 }}>● CRITICAL (Score 8.5 – 10.0):</span> Hazardous waste, chemical runoff, road obstruction. <em>SLA: &lt; 2 Hours</em><br />
              <span style={{ color: 'var(--priority-high)', fontWeight: 700 }}>● HIGH (Score 7.0 – 8.4):</span> Overflowing public dumpsters, dense market waste, animal carcasses. <em>SLA: &lt; 6 Hours</em><br />
              <span style={{ color: 'var(--priority-medium)', fontWeight: 700 }}>● MEDIUM (Score 4.0 – 6.9):</span> Segregated plastic/organic street litter, uncollected bins. <em>SLA: &lt; 24 Hours</em><br />
              <span style={{ color: 'var(--priority-low)', fontWeight: 700 }}>● LOW (Score 0.0 – 3.9):</span> Garden cuttings, leaf litter, light dry waste. <em>SLA: &lt; 48 Hours</em>
            </div>
          </div>

          {/* Section 3: Verification & Anti-Fraud Protocols */}
          <div style={{ padding: '12px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} /> 3. Verification & Anti-Fraud Policy
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              All field clearance submissions require a high-resolution after-photo taken at the exact geotag location. If evidence reveals incomplete clearance or remnants, officers must click <strong>Reject / Re-Clean</strong> to return the report to field crews with specific instructions.
            </p>
          </div>

          {/* Section 4: Emergency Contacts */}
          <div style={{ padding: '12px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={14} /> 4. Central Control Room & Support
            </h4>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <strong>Sanitation Control Room:</strong> 1913 (24/7 Toll-Free)<br />
              <strong>Hazardous Response Hotline:</strong> +91 44 2538 4520<br />
              <strong>Technical Support Desk:</strong> support@swachhlens.gov.in
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
