import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Layers,
  ArrowRight,
  Compass,
  Filter,
  Search,
  ExternalLink,
  Flame
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageContainer } from '../components/layout/PageContainer';
import { InteractiveWasteMap } from '../components/map/InteractiveWasteMap';
import { StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const WasteMap = () => {
  const { complaints, hotspots } = useApp();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showHotspots, setShowHotspots] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(complaints[0] || null);
  const navigate = useNavigate();

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const matchFilter = filter === 'ALL' || c.priority === filter;
      const matchSearch =
        !search ||
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        c.location.toLowerCase().includes(search.toLowerCase()) ||
        c.wasteType.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [complaints, filter, search]);

  return (
    <PageContainer
      title="Waste Locations & GIS Intelligence"
      subtitle="Interactive spatial mapping and real-time incident clusters across Chennai municipal zones."
      actions={
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="primary" size="sm" onClick={() => navigate('/complaints')} icon={ArrowRight}>
            List View
          </Button>
        </div>
      }
    >
      {/* Level 1 Liquid Glass Overlaid Filter Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '12px 18px',
          backgroundColor: 'var(--glass-level-1)',
          backdropFilter: 'var(--liquid-glass-lg)',
          WebkitBackdropFilter: 'var(--liquid-glass-lg)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--glass-border-light)',
          boxShadow: 'var(--shadow-md), inset 0 1px 0 var(--glass-highlight)'
        }}
      >
        {/* Priority Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: '4px' }}>
            Filter Priority:
          </span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => {
            const isActive = filter === p;
            return (
              <button
                key={p}
                onClick={() => setFilter(p)}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: isActive ? 600 : 500,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive ? 'var(--accent-primary)' : 'var(--surface-secondary)',
                  color: isActive ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  boxShadow: isActive ? '0 2px 12px var(--accent-cyan-glow)' : 'none',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {p === 'ALL' ? 'All Incidents' : p.charAt(0) + p.slice(1).toLowerCase()}
              </button>
            );
          })}

          {/* Hotspots Density Layer Toggle */}
          <button
            onClick={() => setShowHotspots(prev => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: showHotspots ? 600 : 500,
              borderRadius: 'var(--radius-md)',
              backgroundColor: showHotspots ? 'rgba(251, 113, 133, 0.15)' : 'var(--surface-secondary)',
              color: showHotspots ? 'var(--priority-critical)' : 'var(--text-secondary)',
              border: showHotspots ? '1px solid var(--priority-critical)' : '1px solid var(--border-subtle)',
              boxShadow: showHotspots ? '0 2px 10px rgba(251, 113, 133, 0.25)' : 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Flame size={13} style={{ color: showHotspots ? 'var(--priority-critical)' : 'var(--text-muted)' }} />
            <span>Hotspots ({hotspots ? hotspots.length : 0})</span>
          </button>
        </div>

        {/* Search Input on Map */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search map locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                fontSize: '12px',
                backgroundColor: 'var(--surface-secondary)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {filteredComplaints.length} plotted
          </span>
        </div>
      </div>

      {/* Main Real Leaflet Map View */}
      <div style={{ position: 'relative', height: '580px', width: '100%' }}>
        <InteractiveWasteMap
          complaints={filteredComplaints}
          hotspots={hotspots || []}
          showHotspots={showHotspots}
          selectedId={selectedComplaint?.id}
          onSelectComplaint={(c) => setSelectedComplaint(c)}
          height="100%"
          zoom={12}
        />

        {/* Liquid Glass Overlay Legend (Top Left) */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            backgroundColor: 'var(--glass-level-2)',
            backdropFilter: 'var(--liquid-glass-lg)',
            WebkitBackdropFilter: 'var(--liquid-glass-lg)',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--glass-border-light)',
            boxShadow: 'var(--shadow-md), inset 0 1px 0 var(--glass-highlight)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontSize: '11px',
            zIndex: 400
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--priority-critical)', boxShadow: '0 0 6px var(--priority-critical)' }} />
            Critical (&gt;8.5)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--priority-high)' }} />
            High (7.0 - 8.5)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }} />
            Medium (4.0 - 6.9)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-completed)' }} />
            Low (&lt;4.0)
          </span>
          {showHotspots && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1.5px dashed var(--priority-critical)', backgroundColor: 'rgba(251, 113, 133, 0.25)' }} />
              Hotspot Zone (~250m)
            </span>
          )}
        </div>

        {/* Selected Incident Drawer (Level 3 Floating Liquid Glass - Bottom Right) */}
        {selectedComplaint && (
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              width: '360px',
              backgroundColor: 'var(--glass-level-3)',
              backdropFilter: 'var(--liquid-glass-xl)',
              WebkitBackdropFilter: 'var(--liquid-glass-xl)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--glass-border-light)',
              boxShadow: 'var(--shadow-xl), inset 0 1px 0 var(--glass-highlight)',
              padding: '18px',
              zIndex: 400,
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="mono" style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {selectedComplaint.id}
              </span>
              <StatusBadge priority={selectedComplaint.priority} />
            </div>

            <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {selectedComplaint.wasteType}
            </h4>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
              <MapPin size={13} style={{ color: 'var(--text-muted)' }} />
              {selectedComplaint.location}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '14px', border: '1px solid var(--border-subtle)' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Severity</span>
                <div className="mono" style={{ fontSize: '14px', fontWeight: 700, color: selectedComplaint.severity >= 8.5 ? 'var(--priority-critical)' : 'var(--text-primary)' }}>
                  {selectedComplaint.severity} / 10
                </div>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Status</span>
                <StatusBadge status={selectedComplaint.status} />
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/complaints/${selectedComplaint.id}`)}
              style={{ width: '100%' }}
              icon={ExternalLink}
              iconPosition="right"
            >
              Open Incident Details
            </Button>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
