import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  MapPin,
  Truck,
  Users,
  ShieldCheck,
  Check,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { GlassImage } from '../components/ui/GlassImage';
import { StatusBadge, Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';

export const Verification = () => {
  const { complaints, verifyCleanup, rejectCleanup, teams, vehicles } = useApp();
  const navigate = useNavigate();

  const [filterMode, setFilterMode] = useState('ALL'); // ALL | PENDING_AUDIT | VERIFIED
  const [rejectModalComplaint, setRejectModalComplaint] = useState(null);
  const [rejectReason, setRejectReason] = useState('Insufficient site clearance — waste remnants remain on site');
  const [customReason, setCustomReason] = useState('');
  const [rejectError, setRejectError] = useState(null);
  const [isRejecting, setIsRejecting] = useState(false);

  const filteredItems = complaints.filter(item => {
    if (filterMode === 'PENDING_AUDIT') return !item.verified;
    if (filterMode === 'VERIFIED') return item.verified;
    return true;
  });

  const verifiedCount = complaints.filter(c => c.verified).length;
  const pendingCount = complaints.filter(c => !c.verified).length;

  const handleConfirmReject = async () => {
    if (!rejectModalComplaint) return;
    try {
      setIsRejecting(true);
      setRejectError(null);
      const reasonToUse = rejectReason === 'OTHER' ? (customReason.trim() || 'Evidence rejected by municipal officer') : rejectReason;
      await rejectCleanup(rejectModalComplaint.id, reasonToUse);
      setRejectModalComplaint(null);
      setCustomReason('');
    } catch (err) {
      setRejectError(err.response?.data?.detail || "Failed to reject evidence. Please try again.");
    } finally {
      setIsRejecting(false);
    }
  };

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
                    {complaint.displayId || complaint.id}
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
                    alt={`Before cleanup of ${complaint.displayId || complaint.id}`}
                    height="280px"
                    objectFit="contain"
                    label="Citizen Report Photo"
                    caption={complaint.latitude != null && complaint.longitude != null ? `LAT: ${Number(complaint.latitude).toFixed(5)}° N • ${complaint.location}` : complaint.location}
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
                    alt={`After cleanup of ${complaint.displayId || complaint.id}`}
                    height="280px"
                    objectFit="contain"
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
                      {(() => {
                        const teamObj = teams?.find(t => t.id === complaint.assignedTeam);
                        return teamObj ? teamObj.name : (complaint.recommendedTeam || complaint.assignedTeam || 'Unassigned');
                      })()}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Vehicle Fleet</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '2px' }}>
                      <Truck size={13} style={{ color: 'var(--text-muted)' }} />
                      {(() => {
                        const vehObj = vehicles?.find(v => v.id === complaint.assignedVehicle);
                        return vehObj
                          ? `${vehObj.type || vehObj.vehicle_type || 'Fleet'} (${vehObj.plate_number || vehObj.registration_number})`
                          : (complaint.recommendedVehicle || complaint.assignedVehicle || 'Unassigned');
                      })()}
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
                    <>
                      <Button
                        variant="danger"
                        size="md"
                        onClick={() => {
                          setRejectError(null);
                          setRejectModalComplaint(complaint);
                        }}
                        icon={RotateCcw}
                      >
                        Reject / Re-Clean
                      </Button>
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => verifyCleanup(complaint.id)}
                        disabled={!complaint.afterImage}
                        title={!complaint.afterImage ? "Genuine evidence required for verification" : ""}
                        icon={ShieldCheck}
                      >
                        ✓ VERIFY CLEANUP
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* REJECT EVIDENCE / RE-CLEAN MODAL */}
      <Modal
        isOpen={!!rejectModalComplaint}
        onClose={() => setRejectModalComplaint(null)}
        title="Reject Cleanup Evidence"
        subtitle={`Request field re-cleanup for incident ${rejectModalComplaint?.displayId || rejectModalComplaint?.id}`}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setRejectModalComplaint(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmReject} disabled={isRejecting}>
              {isRejecting ? "Processing..." : "Confirm Rejection & Request Re-Clean"}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {rejectError && (
            <div style={{ padding: '12px', backgroundColor: 'var(--status-critical-bg)', color: 'var(--status-critical-text)', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600 }}>
              {rejectError}
            </div>
          )}
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Rejecting this evidence will transition the complaint back to <strong>In Progress</strong>, notify the response team, and require fresh clearance photographic proof before it can be certified.
          </p>

          <Select
            label="Rejection Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            options={[
              { value: "Insufficient site clearance — waste remnants remain on site", label: "Insufficient clearance / waste remnants remain" },
              { value: "After-photo unclear or does not match geotag location", label: "After-photo unclear or location mismatch" },
              { value: "Incomplete cleanup — hazardous materials still present", label: "Hazardous or bulky waste left behind" },
              { value: "OTHER", label: "Other (specify custom reason below)" }
            ]}
          />

          {rejectReason === 'OTHER' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Custom Rejection Notes
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Explain why the cleanup evidence is being rejected..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--surface-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}
        </div>
      </Modal>
    </PageContainer>
  );
};
