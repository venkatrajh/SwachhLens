import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  AlertTriangle,
  Flame,
  Activity,
  CheckCircle2,
  MapPin,
  ArrowRight,
  ExternalLink,
  Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { KPICard } from '../components/ui/KPICard';
import { Table } from '../components/ui/Table';
import { StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { InteractiveWasteMap } from '../components/map/InteractiveWasteMap';

export const Dashboard = () => {
  const { complaints, kpis } = useApp();
  const navigate = useNavigate();

  // Filter high & critical priority issues
  const priorityIssues = complaints
    .filter(c => c.priority === 'CRITICAL' || c.priority === 'HIGH')
    .slice(0, 4);

  // Table columns for Recent Complaints
  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      render: (val) => (
        <span className="mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {val}
        </span>
      )
    },
    {
      header: 'Waste Type',
      accessor: 'wasteType',
      render: (val) => <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{val}</span>
    },
    {
      header: 'Location',
      accessor: 'location',
      render: (val) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
          <MapPin size={13} style={{ color: 'var(--text-muted)' }} />
          {val}
        </span>
      )
    },
    {
      header: 'Severity',
      accessor: 'severity',
      render: (val) => (
        <span
          className="mono"
          style={{
            fontWeight: 700,
            color: val >= 8.5 ? 'var(--priority-critical)' : val >= 7.0 ? 'var(--priority-high)' : 'var(--text-primary)'
          }}
        >
          {val} / 10
        </span>
      )
    },
    {
      header: 'Priority',
      accessor: 'priority',
      render: (_, row) => <StatusBadge priority={row.priority} />
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      header: 'Action',
      accessor: 'id',
      align: 'right',
      render: (id) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/complaints/${id}`);
          }}
          icon={ArrowRight}
          iconPosition="right"
        >
          Inspect
        </Button>
      )
    }
  ];

  return (
    <PageContainer
      title="Municipal Command Center"
      subtitle="Monitor, prioritize, respond and verify municipal waste operations in real time."
      actions={
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="outline" size="sm" onClick={() => navigate('/map')} icon={MapPin}>
            Live Map
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/operations')} icon={Activity}>
            Operations Hub
          </Button>
        </div>
      }
    >
      {/* 6 Level 2 Liquid Glass KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px'
        }}
      >
        <KPICard
          title="Total Reports"
          value={kpis.totalReports}
          subtitle="Cumulative city intake"
          icon={FileText}
          trend="+12% today"
          trendType="neutral"
        />
        <KPICard
          title="Pending"
          value={kpis.pending}
          subtitle="Awaiting triage & crew"
          icon={Clock}
          accentColor="var(--status-pending)"
        />
        <KPICard
          title="High Priority"
          value={kpis.highPriority}
          subtitle="SLA < 2 hours"
          icon={AlertTriangle}
          accentColor="var(--priority-high)"
        />
        <KPICard
          title="Critical"
          value={kpis.critical}
          subtitle="Urgent hazard alerts"
          icon={Flame}
          accentColor="var(--priority-critical)"
        />
        <KPICard
          title="In Progress"
          value={kpis.inProgress}
          subtitle="Teams actively on-site"
          icon={Activity}
          accentColor="var(--status-progress)"
        />
        <KPICard
          title="Completed"
          value={kpis.completed}
          subtitle="Cleared & certified"
          icon={CheckCircle2}
          accentColor="var(--status-completed)"
        />
      </div>

      {/* Main Two-Column Section: Level 1 Liquid Glass Priority Issues & Real Leaflet Map Preview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '20px'
        }}
      >
        {/* LEFT: Priority Issues Panel */}
        <Card
          level="1"
          title="Priority Issues Requiring Immediate Action"
          subtitle="AI triaged severity score above threshold"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/complaints')} icon={ExternalLink} iconPosition="right">
              View All
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {priorityIssues.map((issue) => {
              const isCritical = issue.priority === 'CRITICAL';
              return (
                <div
                  key={issue.id}
                  onClick={() => navigate(`/complaints/${issue.id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isCritical ? 'var(--priority-critical-bg)' : 'var(--surface-secondary)',
                    backdropFilter: 'var(--liquid-glass-sm)',
                    border: `1px solid ${isCritical ? 'var(--priority-critical-border)' : 'var(--border-subtle)'}`,
                    boxShadow: isCritical ? '0 0 16px rgba(251, 113, 133, 0.12)' : 'none',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isCritical ? 'var(--priority-critical-border)' : 'var(--surface-hover)';
                    e.currentTarget.style.borderColor = isCritical ? 'var(--priority-critical)' : 'var(--accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isCritical ? 'var(--priority-critical-bg)' : 'var(--surface-secondary)';
                    e.currentTarget.style.borderColor = isCritical ? 'var(--priority-critical-border)' : 'var(--border-subtle)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: isCritical ? 'var(--priority-critical)' : 'var(--priority-high)',
                        boxShadow: `0 0 8px ${isCritical ? 'var(--priority-critical)' : 'var(--priority-high)'}`,
                        flexShrink: 0
                      }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="mono" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {issue.id}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {issue.wasteType}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
                        <span>{issue.location}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="mono" style={{ fontSize: '13px', fontWeight: 700, color: isCritical ? 'var(--priority-critical)' : 'var(--priority-high)' }}>
                      Severity {issue.severity}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {issue.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* RIGHT: Real Interactive Leaflet Waste Map Preview */}
        <Card
          level="1"
          title="Waste Map Preview"
          subtitle="Real-time spatial distribution across Chennai municipal zones"
          action={
            <Button variant="outline" size="sm" onClick={() => navigate('/map')} icon={Compass}>
              Open Full Map
            </Button>
          }
          noPadding
        >
          <div style={{ height: '270px', width: '100%', position: 'relative' }}>
            <InteractiveWasteMap
              complaints={complaints}
              height="100%"
              zoom={11}
              onSelectComplaint={(c) => navigate(`/complaints/${c.id}`)}
            />
          </div>
        </Card>
      </div>

      {/* RECENT COMPLAINTS LEVEL 2 LIQUID GLASS TABLE */}
      <Card
        level="2"
        title="Recent Complaints"
        subtitle="Latest citizen submissions and AI analyzed dispatch priorities"
        action={
          <Button variant="outline" size="sm" onClick={() => navigate('/complaints')}>
            View Complete Register ({complaints.length})
          </Button>
        }
      >
        <Table
          columns={columns}
          data={complaints.slice(0, 5)}
          onRowClick={(row) => navigate(`/complaints/${row.id}`)}
        />
      </Card>
    </PageContainer>
  );
};
