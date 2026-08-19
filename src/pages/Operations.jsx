import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Users,
  Activity,
  CheckCircle,
  MapPin,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { KPICard } from '../components/ui/KPICard';
import { Table } from '../components/ui/Table';
import { ProgressBar } from '../components/ui/ProgressBar';
import { StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const Operations = () => {
  const { complaints, kpis } = useApp();
  const navigate = useNavigate();

  const columns = [
    {
      header: 'Complaint',
      accessor: 'id',
      render: (val, row) => (
        <div>
          <span className="mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {val}
          </span>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{row.wasteType}</div>
        </div>
      )
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
      header: 'Assigned Team',
      accessor: 'assignedTeam',
      render: (val, row) => (
        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
          {val || row.recommendedTeam || 'Unassigned'}
        </span>
      )
    },
    {
      header: 'Assigned Vehicle',
      accessor: 'assignedVehicle',
      render: (val, row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <Truck size={13} style={{ color: 'var(--text-muted)' }} />
          {val || row.recommendedVehicle || 'Unassigned'}
        </span>
      )
    },
    {
      header: 'Progress',
      accessor: 'progress',
      width: '190px',
      render: (val) => (
        <ProgressBar
          value={val}
          showLabel
          color={val === 100 ? 'var(--status-completed)' : 'var(--accent-primary)'}
        />
      )
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
          Track
        </Button>
      )
    }
  ];

  return (
    <PageContainer
      title="Operations"
      subtitle="Track active municipal cleanup operations, dispatched sanitation crews, and vehicle fleet telemetry."
      actions={
        <Button variant="outline" size="sm" onClick={() => alert('Live GPS telemetry sync simulated.')} icon={RefreshCw}>
          Sync Fleet Telemetry
        </Button>
      }
    >
      {/* 4 Glass KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px'
        }}
      >
        <KPICard
          title="Active Field Crews"
          value="8 Teams"
          subtitle="4 on-site, 4 standby"
          icon={Users}
          trend="85% efficiency"
          trendType="positive"
        />
        <KPICard
          title="Fleet Units Deployed"
          value="12 Vehicles"
          subtitle="Compactors & Tippers"
          icon={Truck}
          accentColor="var(--accent-primary)"
        />
        <KPICard
          title="Live Cleanup Ops"
          value={kpis.inProgress}
          subtitle="Active route dispatches"
          icon={Activity}
          accentColor="var(--status-progress)"
        />
        <KPICard
          title="Avg Clearance Time"
          value="3.2 hrs"
          subtitle="Well within 6h SLA"
          icon={CheckCircle}
          trend="-25m vs last week"
          trendType="positive"
          accentColor="var(--status-completed)"
        />
      </div>

      {/* Main Operations Dispatch Table */}
      <Card
        level="1"
        title="Live Operations & Crew Tracking"
        subtitle="Real-time incident response progress across Greater Chennai Corporation"
      >
        <Table
          columns={columns}
          data={complaints}
          onRowClick={(row) => navigate(`/complaints/${row.id}`)}
        />
      </Card>
    </PageContainer>
  );
};
