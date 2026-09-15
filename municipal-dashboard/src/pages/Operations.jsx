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
  const { complaints, kpis, teams, vehicles, refreshData, isLoading, analyticsData } = useApp();
  const navigate = useNavigate();

  const columns = [
    {
      header: 'Complaint',
      accessor: 'displayId',
      render: (val, row) => (
        <div>
          <span className="mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {val || row.id}
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
      render: (val, row) => {
        const teamObj = teams.find(t => t.id === val);
        return (
          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
            {teamObj ? teamObj.name : (val || row.recommendedTeam || 'Unassigned')}
          </span>
        );
      }
    },
    {
      header: 'Assigned Vehicle',
      accessor: 'assignedVehicle',
      render: (val, row) => {
        const vehObj = vehicles.find(v => v.id === val);
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <Truck size={13} style={{ color: 'var(--text-muted)' }} />
            {vehObj ? `${vehObj.type || vehObj.vehicle_type || 'Fleet'} (${vehObj.plate_number || vehObj.registration_number})` : (val || row.recommendedVehicle || 'Unassigned')}
          </span>
        );
      }
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
      title="Field Operations"
      subtitle="Monitor active cleanup teams and fleet dispatch"
      actions={
        <Button icon={RefreshCw} variant="outline" size="sm" onClick={refreshData} isLoading={isLoading}>
          Sync
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px'
          }}
        >
          <KPICard
            title="Active Field Crews"
            value={`${teams?.length || 0} Teams`}
            subtitle="Registered municipal crews"
            icon={Users}
          />
          <KPICard
            title="Fleet Units Deployed"
            value={`${vehicles?.length || 0} Vehicles`}
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
            value={analyticsData?.performance?.avgResolutionDisplay || 'N/A'}
            subtitle="System resolution time"
            icon={CheckCircle}
          />
        </div>
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
