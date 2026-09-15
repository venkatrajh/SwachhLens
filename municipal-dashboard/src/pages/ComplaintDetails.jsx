import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Sparkles,
  Truck,
  Users,
  FileCheck,
  Zap,
  Check,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { GlassImage } from '../components/ui/GlassImage';
import { StatusBadge, Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Timeline } from '../components/ui/Timeline';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { adaptTimelineHistory, buildOperationalTimeline } from '../services/reportsAdapter';

export const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    getComplaintById,
    getReportHistory,
    assignTeam, 
    assignVehicle, 
    updateStatus,
    resolveReport,
    verifyCleanup,
    rejectCleanup,
    teams,
    vehicles
  } = useApp();

  const complaint = getComplaintById(id);

  const [history, setHistory] = useState([]);

  useEffect(() => {
    let isMounted = true;
    if (complaint?.id) {
      getReportHistory(complaint.id).then(data => {
        if (isMounted) setHistory(data || []);
      });
    }
    return () => { isMounted = false; };
  }, [complaint?.id, complaint?.rawStatus, complaint?.progress]);

  // Modal states for Team & Vehicle assignment
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [assignmentError, setAssignmentError] = useState(null);

  // Modal states for Resolution
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolveImageFile, setResolveImageFile] = useState(null);
  const [resolveImagePreview, setResolveImagePreview] = useState(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [resolveError, setResolveError] = useState(null);

  // Modal states for Rejection / Re-clean
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Insufficient site clearance — waste remnants remain on site');
  const [customReason, setCustomReason] = useState('');
  const [rejectError, setRejectError] = useState(null);
  const [isRejecting, setIsRejecting] = useState(false);

  if (!complaint) {
    return (
      <PageContainer title="Complaint Not Found">
        <Card level="2">
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Complaint {id} does not exist</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '20px' }}>
              The requested municipal incident ID was not found in the active records.
            </p>
            <Button variant="primary" onClick={() => navigate('/complaints')} icon={ArrowLeft}>
              Back to Complaints
            </Button>
          </div>
        </Card>
      </PageContainer>
    );
  }

  const handleResolveReport = async () => {
    if (!resolveImageFile) {
      setResolveError("Please select an evidence image.");
      return;
    }
    try {
      setResolveError(null);
      
      // Convert File to base64 data URI
      const base64Url = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(resolveImageFile);
      });

      await resolveReport(complaint.id, base64Url, resolveNotes);
      setIsResolveModalOpen(false);
      setResolveImageFile(null);
      setResolveImagePreview(null);
      setResolveNotes('');
    } catch (error) {
      setResolveError(error.response?.data?.detail || "Failed to submit evidence. Please try again.");
    }
  };

  const handleRejectCleanup = async () => {
    try {
      setIsRejecting(true);
      setRejectError(null);
      const reasonToUse = rejectReason === 'OTHER' ? (customReason.trim() || 'Evidence rejected by municipal officer') : rejectReason;
      await rejectCleanup(complaint.id, reasonToUse);
      setIsRejectModalOpen(false);
      setCustomReason('');
    } catch (error) {
      setRejectError(error.response?.data?.detail || "Failed to reject evidence. Please try again.");
    } finally {
      setIsRejecting(false);
    }
  };

  const handleAssignTeam = async () => {
    if (selectedTeam) {
      try {
        setAssignmentError(null);
        await assignTeam(complaint.id, selectedTeam);
        setIsTeamModalOpen(false);
      } catch (error) {
        setAssignmentError(error.response?.data?.detail || "Failed to assign team. Please try again.");
      }
    }
  };

  const handleAssignVehicle = async () => {
    if (selectedVehicle) {
      try {
        setAssignmentError(null);
        await assignVehicle(complaint.id, selectedVehicle);
        setIsVehicleModalOpen(false);
      } catch (error) {
        setAssignmentError(error.response?.data?.detail || "Failed to assign vehicle. Please try again.");
      }
    }
  };

  const handleConfirmAndDispatch = async () => {
    const teamId = selectedTeam || complaint.assignedTeam;
    const vehicleId = selectedVehicle || complaint.assignedVehicle;

    if (!teamId || !vehicleId) {
      setAssignmentError("Please assign both a Team and a Vehicle before dispatching.");
      return;
    }

    try {
      setAssignmentError(null);
      if (selectedTeam && selectedTeam !== complaint.assignedTeam) {
        await assignTeam(complaint.id, selectedTeam);
      }
      if (selectedVehicle && selectedVehicle !== complaint.assignedVehicle) {
        await assignVehicle(complaint.id, selectedVehicle);
      }
      if (complaint.rawStatus !== 'in_progress') {
        await updateStatus(complaint.id, 'in_progress', 'Field crew dispatched');
      }
      navigate('/operations');
    } catch (error) {
      setAssignmentError(error.response?.data?.detail || "Failed to dispatch all. Please try again.");
    }
  };

  return (
    <PageContainer
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate('/complaints')} icon={ArrowLeft}>
          Back to Register
        </Button>
      }
    >
      {/* Header Liquid Glass Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 24px',
          backgroundColor: 'var(--glass-level-1)',
          backdropFilter: 'var(--liquid-glass-lg)',
          WebkitBackdropFilter: 'var(--liquid-glass-lg)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--glass-border-light)',
          boxShadow: 'var(--shadow-md), inset 0 1px 0 var(--glass-highlight)',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span
            className="mono"
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: 'var(--accent-primary)',
              padding: '6px 12px',
              backgroundColor: 'var(--surface-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-xs), 0 0 12px var(--accent-cyan-glow)'
            }}
          >
            {complaint.displayId || complaint.id}
          </span>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {complaint.wasteType}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <MapPin size={13} style={{ color: 'var(--text-muted)' }} />
                {complaint.location}
              </span>
              <span style={{ color: 'var(--border-strong)' }}>•</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} />
                {complaint.reportedAt}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <StatusBadge priority={complaint.priority} />
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      {/* Main 2-Column Details Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
          gap: '20px'
        }}
      >
        {/* LEFT COLUMN: Visual Evidence & Resolution Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Incident Image Card with GlassImage Fallback */}
          <Card level="2" title="Incident Visual Evidence" subtitle="Citizen geotagged photo capture">
            <GlassImage
              src={complaint.beforeImage}
              alt={`Waste Evidence for ${complaint.displayId || complaint.id}`}
              height="320px"
              objectFit="contain"
              label={`Incident Capture — ${complaint.wasteType}`}
              caption={complaint.latitude != null && complaint.longitude != null ? `LAT: ${Number(complaint.latitude).toFixed(5)}° N | LNG: ${Number(complaint.longitude).toFixed(5)}° E • ${complaint.location}` : complaint.location}
            />

            <div style={{ marginTop: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Citizen Description
              </span>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--surface-secondary)',
                  backdropFilter: 'var(--liquid-glass-sm)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  marginTop: '6px',
                  lineHeight: 1.55
                }}
              >
                "{complaint.description}"
              </p>
            </div>
          </Card>

          {/* After Cleanup Clearance Card */}
          {complaint.afterImage && (
            <Card level="2" title="Site Clearance Verification" subtitle="Crew clearance verification photo">
              <GlassImage
                src={complaint.afterImage}
                alt={`Clearance Evidence for ${complaint.displayId || complaint.id}`}
                height="320px"
                objectFit="contain"
                label="AFTER — Crew Clearance Photo"
                caption={`Cleared Site Verification • ${complaint.location}`}
              />
            </Card>
          )}

          {/* Incident Audit History */}
          <Card level="2" title="Incident Audit Log" subtitle="Recorded chronological operational event history">
            <Timeline steps={adaptTimelineHistory(history, complaint)} />
          </Card>
        </div>

        {/* RIGHT COLUMN: AI Analysis & Recommended Response */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* AI ANALYSIS CARD */}
          <Card
            level="1"
            title="AI Analysis Results"
            subtitle="Deep learning classification & hazard assessment"
            action={
              <Badge variant="info" dot>
                {complaint.confidence}% Confidence
              </Badge>
            }
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '14px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                  Waste Classification
                </span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {complaint.wasteType}
                </div>
              </div>

              <div style={{ padding: '14px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                  Estimated Volume
                </span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {complaint.volume}
                </div>
              </div>

              <div style={{ padding: '14px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                  Severity Score
                </span>
                <div className="mono" style={{ fontSize: '18px', fontWeight: 800, color: complaint.severity >= 8.5 ? 'var(--priority-critical)' : complaint.severity >= 7 ? 'var(--priority-high)' : 'var(--text-primary)', marginTop: '2px' }}>
                  {complaint.severity} / 10.0
                </div>
              </div>

              <div style={{ padding: '14px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                  Triage Priority
                </span>
                <div style={{ marginTop: '4px' }}>
                  <StatusBadge priority={complaint.priority} />
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: '16px',
                padding: '14px',
                backgroundColor: 'var(--surface-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <Sparkles size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  AI Recommendation Rationalization:
                </span>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px', lineHeight: 1.45 }}>
                  {complaint.recommendedAction}
                </p>
              </div>
            </div>
          </Card>

          {/* RECOMMENDED RESPONSE CARD */}
          <Card
            level="2"
            title="🤖 Recommended Response"
            subtitle="Optimal crew and asset allocation suggested by AI"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {(() => {
                const assignedTeamObj = teams.find(t => t.id === complaint.assignedTeam);
                const assignedVehicleObj = vehicles.find(v => v.id === complaint.assignedVehicle);
                const teamDisplay = assignedTeamObj ? assignedTeamObj.name : (complaint.assignedTeam || complaint.recommendedTeam || 'Unassigned');
                const vehicleDisplay = assignedVehicleObj
                  ? `${assignedVehicleObj.type || assignedVehicleObj.vehicle_type || 'Fleet'} (${assignedVehicleObj.plate_number || assignedVehicleObj.registration_number})`
                  : (complaint.assignedVehicle || complaint.recommendedVehicle || 'Unassigned');

                return (
                  <>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        backgroundColor: 'var(--surface-secondary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Users size={18} style={{ color: 'var(--text-muted)' }} />
                        <div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                            Assigned Crew
                          </span>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {teamDisplay}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsTeamModalOpen(true)}
                      >
                        {complaint.assignedTeam ? 'Reassign Team' : 'Assign Team'}
                      </Button>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        backgroundColor: 'var(--surface-secondary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Truck size={18} style={{ color: 'var(--text-muted)' }} />
                        <div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                            Assigned Vehicle
                          </span>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {vehicleDisplay}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsVehicleModalOpen(true)}
                      >
                        {complaint.assignedVehicle ? 'Reassign Vehicle' : 'Assign Vehicle'}
                      </Button>
                    </div>
                  </>
                );
              })()}

              {/* Assignment Error Message */}
              {assignmentError && (
                <div
                  style={{
                    padding: '10px 14px',
                    backgroundColor: 'var(--status-critical-bg)',
                    color: 'var(--status-critical-text)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: '1px solid var(--border-subtle)',
                    marginTop: '8px'
                  }}
                >
                  {assignmentError}
                </div>
              )}

              {/* Action triggers */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleConfirmAndDispatch}
                  style={{ flex: 1 }}
                  icon={Zap}
                >
                  Confirm & Dispatch All
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate('/verification')}
                  icon={FileCheck}
                >
                  Verification Queue
                </Button>
              </div>

              {/* Operational Lifecycle Transition Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {complaint.rawStatus === 'assigned' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => updateStatus(complaint.id, 'in_progress', 'Field crew commenced cleanup')}
                      icon={Zap}
                    >
                      Start Field Cleanup (In Progress)
                    </Button>
                  )}
                  {complaint.rawStatus === 'in_progress' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsResolveModalOpen(true)}
                      icon={Check}
                    >
                      Upload Cleanup Evidence
                    </Button>
                  )}
                  {complaint.rawStatus === 'completed' && (
                    <>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setRejectError(null);
                          setIsRejectModalOpen(true);
                        }}
                        icon={RotateCcw}
                      >
                        Reject Evidence / Re-Clean
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => verifyCleanup(complaint.id)}
                        icon={ShieldCheck}
                      >
                        Verify Site Clearance
                      </Button>
                    </>
                  )}
                  {complaint.rawStatus === 'verified' && (
                    <Badge variant="success" dot>
                      ✓ Final Clearance Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* RESOLUTION TIMELINE */}
          <Card
            level="2"
            title="Resolution Timeline"
            subtitle="End to end operational lifecycle"
          >
            <Timeline steps={buildOperationalTimeline(complaint, history)} orientation="horizontal" />
          </Card>
        </div>
      </div>

      {/* ASSIGN TEAM LEVEL 3 LIQUID GLASS MODAL */}
      <Modal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        title="Assign Municipal Crew"
        subtitle={`Select cleanup team for incident ${complaint.id}`}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsTeamModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAssignTeam}>
              Confirm Team Assignment
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {assignmentError && (
            <div style={{ padding: '12px', backgroundColor: 'var(--status-critical-bg)', color: 'var(--status-critical-text)', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600 }}>
              {assignmentError}
            </div>
          )}
          <div style={{ padding: '12px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>AI Suggested Team:</span>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              {complaint.recommendedTeam}
            </div>
          </div>

          <Select
            label="Available Municipal Teams"
            placeholder="Select a response team..."
            value={selectedTeam || complaint.assignedTeam || ''}
            onChange={(e) => setSelectedTeam(e.target.value)}
            options={(teams || []).map(team => ({ value: team.id, label: team.name }))}
          />
        </div>
      </Modal>

      {/* ASSIGN VEHICLE LEVEL 3 LIQUID GLASS MODAL */}
      <Modal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        title="Assign Fleet Vehicle"
        subtitle={`Allocate municipal equipment for ${complaint.id}`}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsVehicleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAssignVehicle}>
              Confirm Vehicle Assignment
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {assignmentError && (
            <div style={{ padding: '12px', backgroundColor: 'var(--status-critical-bg)', color: 'var(--status-critical-text)', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600 }}>
              {assignmentError}
            </div>
          )}
          <div style={{ padding: '12px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>AI Suggested Vehicle:</span>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              {complaint.recommendedVehicle}
            </div>
          </div>

          <Select
            label="Available Fleet Units"
            placeholder="Select a vehicle..."
            value={selectedVehicle || complaint.assignedVehicle || ''}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            options={(vehicles || []).map(v => ({ value: v.id, label: `${v.type} (${v.plate_number})` }))}
          />
        </div>
      </Modal>

      {/* RESOLVE CLEANUP MODAL */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Upload Cleanup Evidence"
        subtitle="Submit photographic proof of site clearance"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsResolveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleResolveReport}>
              Submit Evidence
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {resolveError && (
            <div style={{ padding: '12px', backgroundColor: 'var(--status-critical-bg)', color: 'var(--status-critical-text)', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600 }}>
              {resolveError}
            </div>
          )}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', display: 'block' }}>Cleanup Photo (Required)</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setResolveImageFile(file);
                  setResolveImagePreview(URL.createObjectURL(file));
                }
              }}
              style={{ display: 'block', width: '100%', padding: '8px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-primary)', color: 'var(--text-primary)' }}
            />
            {resolveImagePreview && (
              <img src={resolveImagePreview} alt="Preview" style={{ marginTop: '12px', width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }} />
            )}
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', display: 'block' }}>Resolution Notes (Optional)</label>
            <textarea
              value={resolveNotes}
              onChange={(e) => setResolveNotes(e.target.value)}
              placeholder="Any details about the cleanup..."
              rows={3}
              style={{ width: '100%', padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-primary)', color: 'var(--text-primary)', resize: 'vertical' }}
            />
          </div>
        </div>
      </Modal>

      {/* REJECT EVIDENCE MODAL */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Cleanup Evidence"
        subtitle={`Request field re-cleanup for ${complaint.displayId || complaint.id}`}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleRejectCleanup} disabled={isRejecting}>
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
            Rejecting this cleanup evidence transitions the incident back to <strong>In Progress</strong>. The field crew must perform re-cleanup and upload new photographic proof.
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
