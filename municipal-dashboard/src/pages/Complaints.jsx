import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  MapPin,
  Clock,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { StatusBadge, Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const Complaints = () => {
  const { complaints } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filters state
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [wasteTypeFilter, setWasteTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Extract unique locations and waste types for dropdowns
  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(complaints.map(c => c.location.split(' ')[0])));
  }, [complaints]);

  const uniqueWasteTypes = useMemo(() => {
    return Array.from(new Set(complaints.map(c => c.wasteType)));
  }, [complaints]);

  // Filtered dataset
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const matchSearch =
        !search ||
        (c.displayId && c.displayId.toLowerCase().includes(search.toLowerCase())) ||
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        c.location.toLowerCase().includes(search.toLowerCase()) ||
        c.wasteType.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase());

      const matchPriority = !priorityFilter || c.priority.toUpperCase() === priorityFilter.toUpperCase();
      const matchStatus = !statusFilter || c.status.toLowerCase() === statusFilter.toLowerCase();
      const matchWasteType = !wasteTypeFilter || c.wasteType === wasteTypeFilter;
      const matchLocation = !locationFilter || c.location.toLowerCase().includes(locationFilter.toLowerCase());

      return matchSearch && matchPriority && matchStatus && matchWasteType && matchLocation;
    });
  }, [complaints, search, priorityFilter, statusFilter, wasteTypeFilter, locationFilter]);

  const handleResetFilters = () => {
    setSearch('');
    setPriorityFilter('');
    setStatusFilter('');
    setWasteTypeFilter('');
    setLocationFilter('');
    setSearchParams({});
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'displayId',
      render: (val, row) => (
        <span className="mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {val || row.id}
        </span>
      )
    },
    {
      header: 'Waste Type',
      accessor: 'wasteType',
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span>
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
      header: 'Reported',
      accessor: 'reportedAt',
      render: (val) => {
        if (!val) return <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pending</span>;
        const parts = String(val).split(' ');
        const displayTime = parts.length >= 3 ? `${parts[1]} ${parts[2]}` : val;
        return (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} />
            {displayTime}
          </span>
        );
      }
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
      title="Complaints"
      subtitle="Monitor, filter and manage citizen-reported municipal waste incidents."
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant="default">
            Total: {complaints.length}
          </Badge>
          <Badge variant="info">
            Showing: {filteredComplaints.length}
          </Badge>
        </div>
      }
    >
      {/* Level 1 Liquid Glass Filter & Search Card */}
      <Card level="1" noPadding>
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'var(--surface-secondary)',
            backdropFilter: 'var(--liquid-glass-sm)',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          {/* Search Box */}
          <div style={{ flex: '1 1 240px', minWidth: '200px' }}>
            <Input
              icon={Search}
              placeholder="Search complaints, IDs, areas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Priority Dropdown */}
          <div style={{ flex: '0 1 140px' }}>
            <Select
              placeholder="Priority: All"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[
                { value: '', label: 'Priority: All' },
                { value: 'CRITICAL', label: '🔴 Critical' },
                { value: 'HIGH', label: '🟠 High' },
                { value: 'MEDIUM', label: '🟡 Medium' },
                { value: 'LOW', label: '🟢 Low' }
              ]}
            />
          </div>

          {/* Status Dropdown */}
          <div style={{ flex: '0 1 140px' }}>
            <Select
              placeholder="Status: All"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'Status: All' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Assigned', label: 'Assigned' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Completed', label: 'Completed' }
              ]}
            />
          </div>

          {/* Waste Type Dropdown */}
          <div style={{ flex: '0 1 170px' }}>
            <Select
              placeholder="Waste Type: All"
              value={wasteTypeFilter}
              onChange={(e) => setWasteTypeFilter(e.target.value)}
              options={[
                { value: '', label: 'Waste Type: All' },
                ...uniqueWasteTypes.map(t => ({ value: t, label: t }))
              ]}
            />
          </div>

          {/* Location Dropdown */}
          <div style={{ flex: '0 1 150px' }}>
            <Select
              placeholder="Location: All"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              options={[
                { value: '', label: 'Location: All' },
                ...uniqueLocations.map(loc => ({ value: loc, label: loc }))
              ]}
            />
          </div>

          {/* Reset Filters */}
          {(search || priorityFilter || statusFilter || wasteTypeFilter || locationFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              icon={RotateCcw}
            >
              Reset
            </Button>
          )}
        </div>

        {/* Glass Complaints Table */}
        <Table
          columns={columns}
          data={filteredComplaints}
          onRowClick={(row) => navigate(`/complaints/${row.id}`)}
          emptyMessage="No complaints match the selected filter criteria."
        />
      </Card>
    </PageContainer>
  );
};
