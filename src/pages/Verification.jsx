import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  MapPin,
  Truck,
  Users,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { GlassImage } from '../components/ui/GlassImage';
import { StatusBadge, Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const Verification = () => {
  const { complaints, verifyCleanup } = useApp();
  const navigate = useNavigate();

  const [filterMode, setFilterMode] = useState('ALL'); // ALL | PENDING_AUDIT | VERIFIED

  const filteredItems = complaints.filter(item => {
    if (filterMode === 'PENDING_AUDIT') return !item.verified;
    if (filterMode === 'VERIFIED') return item.verified;
    return true;
  });

  const verifiedCount = complaints.filter(c => c.verified).length;
  const pendingCount = complaints.filter(c => !c.verified).length;

  return (
    <PageContainer
      title="Cleanup Verification & Audit"
      subtitle="Review before & after computer vision visual evidence, audit AI assessments, and certify site clearance."
      actions={
        <div style={{ display: 'flex', gap: '8px' }}>
          <Badge variant="success" dot>
            Verified: {verifiedCount}
          </Badge>
          <Badge variant="default" dot>
            Pending Audit: {pendingCount}
          </Badge>
        </div>
      }
    >
      {/* Level 1 Liquid Glass Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 18px',
          backgroundColor: 'var(--glass-level-1)',
          backdropFilter: 'var(--liquid-glass-lg)',
          WebkitBackdropFilter: 'var(--liquid-glass-lg)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--glass-border-light)',
          boxShadow: 'var(--shadow-sm), inset 0 1px 0 var(--glass-highlight)'
        }}
      >
        <button
          onClick={() => setFilterMode('ALL')}
          style={{
            padding: '6px 16px',
            fontSize: '12px',
            fontWeight: filterMode === 'ALL' ? 600 : 500,
            borderRadius: 'var(--radius-md)',
            backgroundColor: filterMode === 'ALL' ? 'var(--accent-primary)' : 'var(--surface-secondary)',
            color: filterMode === 'ALL' ? 'var(--text-inverse)' : 'var(--text-secondary)',
            border: filterMode === 'ALL' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
            boxShadow: filterMode === 'ALL' ? '0 2px 10px var(--accent-glow)' : 'none',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          All Incidents ({complaints.length})
        </button>
        <button
          onClick={() => setFilterMode('PENDING_AUDIT')}
          style={{
            padding: '6px 16px',
            fontSize: '12px',
            fontWeight: filterMode === 'PENDING_AUDIT' ? 600 : 500,
            borderRadius: 'var(--radius-md)',
            backgroundColor: filterMode === 'PENDING_AUDIT' ? 'var(--accent-primary)' : 'var(--surface-secondary)',
            color: filterMode === 'PENDING_AUDIT' ? 'var(--text-inverse)' : 'var(--text-secondary)',
            border: filterMode === 'PENDING_AUDIT' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
            boxShadow: filterMode === 'PENDING_AUDIT' ? '0 2px 10px var(--accent-glow)' : 'none',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          Awaiting Verification ({pendingCount})
        </button>
        <button
          onClick={() => setFilterMode('VERIFIED')}
          style={{
            padding: '6px 16px',
            fontSize: '12px',
            fontWeight: filterMode === 'VERIFIED' ? 600 : 500,
            borderRadius: 'var(--radius-md)',
            backgroundColor: filterMode === 'VERIFIED' ? 'var(--accent-primary)' : 'var(--surface-secondary)',
            color: filterMode === 'VERIFIED' ? 'var(--text-inverse)' : 'var(--text-secondary)',
            border: filterMode === 'VERIFIED' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
            boxShadow: filterMode === 'VERIFIED' ? '0 2px 10px var(--accent-glow)' : 'none',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          Certified / Verified ({verifiedCount})
        </button>
      </div>

      {/* Verification Liquid Glass Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredItems.map((complaint) => {
          return (
            <Card
              key={complaint.id}
              level="2"
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="mono" style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                    {complaint.id}
                  </span>
                  <span style={{ color: 'var(--text-primary)' }}>— {complaint.wasteType}</span>
                </div>
              }
              subtitle={`Reported at ${complaint.reportedAt} • Zone 5 Chennai`}
              action={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StatusBadge priority={complaint.priority} />
                  {complaint.verified ? (
                    <Badge variant="success" dot>
                      ✓ Verified
                    </Badge>
                  ) : (
                    <Badge variant="default" dot>
                      Pending Audit
                    </Badge>
                  )}
                </div>
              }
            >
              {/* Before & After Visual Comparison Layout */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '18px',
                  marginBottom: '18px'
                }}
              >
                {/* BEFORE IMAGE with GlassImage */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--priority-critical)' }}>
                      BEFORE — Citizen Evidence
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Initial Report</span>
                  </div>
                  <GlassImage
                    src={complaint.beforeImage}
                    alt={`Before cleanup of ${complaint.id}`}
                    height="210px"
                    label="Citizen Report Photo"
                    caption={`LAT: ${complaint.latitude}° N • ${complaint.location}`}
                  />
                </div>

                {/* AFTER IMAGE with GlassImage */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--status-completed)' }}>
                      AFTER — Crew Clearance Photo
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Post-Remediation</span>
                  </div>
                  <GlassImage
                    src={complaint.afterImage}
                    alt={`After cleanup of ${complaint.id}`}
                    height="210px"
                    label="Crew Clearance Capture"
                    caption={`Cleared by ${complaint.assignedTeam || complaint.recommendedTeam}`}
                  />
                </div>
              </div>

              {/* Metadata Summary & Verification Action */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-subtle)'
                }}
              >
                {/* Metadata Row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', fontSize: '13px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Location</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '2px' }}>
                      <MapPin size={13} style={{ color: 'var(--text-muted)' }} />
                      {complaint.location}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Cleanup Crew</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '2px' }}>
                      <Users size={13} style={{ color: 'var(--text-muted)' }} />
                      {complaint.assignedTeam || complaint.recommendedTeam}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Vehicle Fleet</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '2px' }}>
                      <Truck size={13} style={{ color: 'var(--text-muted)' }} />
                      {complaint.assignedVehicle || complaint.recommendedVehicle}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Audit Status</span>
                    <span style={{ fontWeight: 600, color: complaint.verified ? 'var(--status-completed)' : 'var(--text-primary)', marginTop: '2px', display: 'block' }}>
                      {complaint.verified ? 'Certified & Verified' : 'Field Work Completed'}
                    </span>
                  </div>
                </div>

                {/* Verification Action Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/complaints/${complaint.id}`)}
                  >
                    Inspect Details
                  </Button>

                  {complaint.verified ? (
                    <Button variant="success" size="md" disabled icon={Check}>
                      ✓ Cleanup Verified
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => verifyCleanup(complaint.id)}
                      icon={ShieldCheck}
                    >
                      ✓ VERIFY CLEANUP
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
};
