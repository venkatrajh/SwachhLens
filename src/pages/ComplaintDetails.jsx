import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Sparkles,
  Truck,
  Users,
  FileCheck,
  Zap
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
import { MOCK_TEAMS, MOCK_VEHICLES } from '../data/mockData';

export const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getComplaintById, assignTeam, assignVehicle } = useApp();

  const complaint = getComplaintById(id);

  // Modal states for Team & Vehicle assignment
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');

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

  const handleAssignTeam = () => {
    if (selectedTeam || complaint.recommendedTeam) {
      assignTeam(complaint.id, selectedTeam || complaint.recommendedTeam);
      setIsTeamModalOpen(false);
    }
  };

  const handleAssignVehicle = () => {
    if (selectedVehicle || complaint.recommendedVehicle) {
      assignVehicle(complaint.id, selectedVehicle || complaint.recommendedVehicle);
      setIsVehicleModalOpen(false);
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
            {complaint.id}
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '20px'
        }}
      >
        {/* LEFT COLUMN: Visual Evidence & Resolution Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Incident Image Card with GlassImage Fallback */}
          <Card level="2" title="Incident Visual Evidence" subtitle="Citizen geotagged photo capture">
            <GlassImage
              src={complaint.beforeImage}
              alt={`Waste Evidence for ${complaint.id}`}
              height="280px"
              label={`Incident Capture — ${complaint.wasteType}`}
              caption={`LAT: ${complaint.latitude}° N | LNG: ${complaint.longitude}° E • ${complaint.location}`}
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

          {/* Cleanup Progress Timeline */}
          <Card level="2" title="Resolution Timeline" subtitle="End-to-end incident operational lifecycle">
            <Timeline steps={complaint.timelineSteps} />
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
                      {complaint.assignedTeam || complaint.recommendedTeam}
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
                      {complaint.assignedVehicle || complaint.recommendedVehicle}
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

              {/* Action triggers */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    handleAssignTeam();
                    handleAssignVehicle();
                  }}
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
            </div>
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
            options={MOCK_TEAMS.map(team => ({ value: team, label: team }))}
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
            options={MOCK_VEHICLES.map(v => ({ value: v, label: v }))}
          />
        </div>
      </Modal>
    </PageContainer>
  );
};
