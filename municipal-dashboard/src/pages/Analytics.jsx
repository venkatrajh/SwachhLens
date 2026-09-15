import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  MapPin,
  Printer,
  FileSpreadsheet,
  Calendar,
  Flame,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { KPICard } from '../components/ui/KPICard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';

export const Analytics = () => {
  const { kpis, analyticsData, analyticsDateRange, loadAnalytics, hotspots } = useApp();
  const navigate = useNavigate();

  const DATE_RANGES = [
    { key: 'all', label: 'All Time' },
    { key: 'today', label: 'Today' },
    { key: '7d', label: 'Last 7 Days' },
    { key: '30d', label: 'Last 30 Days' },
  ];

  const hotspotsList = analyticsData.hotspots || hotspots || [];

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const rows = [
      ['SWACHHLENS MUNICIPAL INTELLIGENCE & ANALYTICS REPORT'],
      [`Generated: ${new Date().toISOString()}`],
      [`Timeframe: ${(analyticsDateRange || 'ALL').toUpperCase()}`],
      [],
      ['EXECUTIVE SUMMARY KPIS'],
      ['Total Reports Plotted', analyticsData.totalReports || kpis.totalReports || 0],
      ['Verified Reports', analyticsData.performance ? analyticsData.performance.verifiedCount : 0],
      ['Completed Reports', analyticsData.performance ? analyticsData.performance.completedCount : 0],
      ['Pending Resolution', analyticsData.performance ? analyticsData.performance.pendingResolution : 0],
      ['Average Resolution Duration', analyticsData.performance ? analyticsData.performance.avgResolutionDisplay : '—'],
      ['Average Verification Duration', analyticsData.performance ? analyticsData.performance.avgVerificationDisplay : '—'],
      ['Recyclable Waste Percentage', `${analyticsData.recyclablePercent ?? 0}%`],
      [],
      ['WASTE COMPOSITION BREAKDOWN'],
      ['Type', 'Incident Count', 'Percentage'],
      ...analyticsData.wasteTypeDistribution.map(w => [w.type, w.count, `${w.percent}%`]),
      [],
      ['INCIDENT PRIORITY DISTRIBUTION'],
      ['Priority Level', 'Incident Count'],
      ...analyticsData.priorityDistribution.map(p => [p.priority, p.count]),
      [],
      ['IDENTIFIED GEOGRAPHIC HOTSPOTS (250m Cluster Density)'],
      ['Hotspot ID', 'Center Lat', 'Center Lon', 'Incident Count', 'Dominant Waste', 'Max Severity', 'Priority Level', 'Address / Location'],
      ...hotspotsList.map(h => [
        h.id,
        h.center_lat,
        h.center_lon,
        h.report_count,
        h.primary_waste_type,
        h.max_severity,
        h.primary_priority,
        `"${(h.address_summary || '').replace(/"/g, '""')}"`
      ]),
    ];

    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `swachhlens_analytics_${analyticsDateRange || 'all'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <PageContainer
      title="Analytics"
      subtitle="Understand waste trends, municipal response performance, and hotspot density across the city."
      actions={
        <div className="no-print" style={{ display: 'flex', gap: '10px' }}>
          <Button variant="outline" size="sm" onClick={handleExportCSV} icon={FileSpreadsheet}>
            Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={handlePrintReport} icon={Printer}>
            Print / Save PDF
          </Button>
        </div>
      }
    >
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          nav, aside, header, .no-print, button {
            display: none !important;
          }
          .page-container {
            padding: 0 !important;
            margin: 0 !important;
          }
          * {
            box-shadow: none !important;
            text-shadow: none !important;
          }
        }
      `}</style>

      {/* Date Range Selector Pill Bar */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '10px 16px',
          backgroundColor: 'var(--glass-level-1)',
          backdropFilter: 'var(--liquid-glass-md)',
          WebkitBackdropFilter: 'var(--liquid-glass-md)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--glass-border-light)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: '4px' }}>
            Timeframe:
          </span>
          {DATE_RANGES.map((r) => {
            const isActive = (analyticsDateRange || 'all') === r.key;
            return (
              <button
                key={r.key}
                onClick={() => loadAnalytics && loadAnalytics(r.key)}
                style={{
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: isActive ? 600 : 500,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive ? 'var(--accent-primary)' : 'var(--surface-secondary)',
                  color: isActive ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  boxShadow: isActive ? '0 2px 10px var(--accent-cyan-glow)' : 'none',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {r.label}
              </button>
            );
          })}
        </div>
        {analyticsData.loading && (
          <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 600 }}>
            Refreshing analytics suite…
          </span>
        )}
      </div>

      {/* 4 Top Glass KPI Cards (Backed by full database) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px'
        }}
      >
        <KPICard
          title="Total Reports"
          value={analyticsData.totalReports || kpis.totalReports}
          subtitle="Full database city intake"
          icon={BarChart3}
          trendType="neutral"
        />
        <KPICard
          title="Avg Resolution Time"
          value={analyticsData.performance ? analyticsData.performance.avgResolutionDisplay : '—'}
          subtitle="From submission to completion"
          icon={Clock}
          trendType="neutral"
        />
        <KPICard
          title="Avg Verification Time"
          value={analyticsData.performance ? analyticsData.performance.avgVerificationDisplay : '—'}
          subtitle="From completion to verified"
          icon={TrendingUp}
          trendType="neutral"
        />
        <KPICard
          title="Verified Reports"
          value={analyticsData.performance ? analyticsData.performance.verifiedCount : '—'}
          subtitle="Successfully verified cleanups"
          icon={CheckCircle2}
          trendType="positive"
        />
      </div>

      {/* 6 Modular Monochromatic Glass Charts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '20px'
        }}
      >
        {/* 1. Reports Over Time (Architectural Bar Chart) */}
        <Card title="1. Reports Over Time" subtitle="Daily incident intake vs resolved cleanups">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {(() => {
              const dataList = analyticsData.reportsOverTime || [];
              if (dataList.length === 0) {
                return (
                  <div style={{ padding: '36px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                    No temporal reporting records found for selected period.
                  </div>
                );
              }
              const maxVal = Math.max(...dataList.map(d => Math.max(d.reports, d.resolved)), 1);
              return (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '170px', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  {dataList.map((d, idx) => {
                    const heightReports = d.reports > 0 ? Math.max(6, Math.round((d.reports / maxVal) * 120)) : 0;
                    const heightResolved = d.resolved > 0 ? Math.max(6, Math.round((d.resolved / maxVal) * 120)) : 0;
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '140px' }}>
                          <div
                            title={`Reports: ${d.reports}`}
                            style={{
                              width: '14px',
                              height: `${heightReports}px`,
                              backgroundColor: 'var(--accent-primary)',
                              borderRadius: '3px 3px 0 0',
                              boxShadow: d.reports > 0 ? '0 0 10px var(--accent-cyan-glow)' : 'none'
                            }}
                          />
                          <div
                            title={`Resolved: ${d.resolved}`}
                            style={{
                              width: '14px',
                              height: `${heightResolved}px`,
                              backgroundColor: 'var(--border-strong)',
                              borderRadius: '3px 3px 0 0'
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>{d.day}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--accent-primary)', borderRadius: '2px' }} />
                Reported Incidents
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--border-strong)', borderRadius: '2px' }} />
                Resolved
              </span>
            </div>
          </div>
        </Card>

        {/* 2. Waste Type Distribution */}
        <Card title="2. Waste Type Distribution" subtitle="Composition breakdown across entire dataset">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {analyticsData.wasteTypeDistribution.length === 0 ? (
              <div style={{ padding: '36px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                No waste categorization records available.
              </div>
            ) : (
              analyticsData.wasteTypeDistribution.map((w, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{w.type}</span>
                    <span className="mono" style={{ color: 'var(--text-secondary)' }}>{w.count} ({w.percent}%)</span>
                  </div>
                  <ProgressBar value={w.percent} height={6} color="var(--accent-primary)" />
                </div>
              ))
            )}
          </div>
        </Card>

        {/* 3. Priority Distribution */}
        <Card title="3. Priority Distribution" subtitle="Urgency classification triage breakdown">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {analyticsData.priorityDistribution.map((p, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: p.color, boxShadow: `0 0 6px ${p.color}` }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{p.priority} Priority</span>
                </div>
                <span className="mono" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {p.count} Incidents
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* 4. Top Hotspots — Live geospatial density clustering */}
        <Card
          title="4. Top Municipal Hotspots"
          subtitle="Zones with highest waste incident recurrence (250m clustering)"
          action={
            hotspotsList.length > 0 ? (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => navigate('/map')}
                icon={ExternalLink}
                className="no-print"
              >
                View Map
              </Button>
            ) : null
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {hotspotsList.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '36px 16px', gap: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>
                <MapPin size={28} style={{ opacity: 0.35 }} />
                <span style={{ fontSize: '13px', fontWeight: 500 }}>
                  No geographic waste incident hotspots detected in selected timeframe.
                </span>
                <span style={{ fontSize: '11px' }}>Clusters require at least 2 reports within a 250m radius.</span>
              </div>
            ) : (
              hotspotsList.slice(0, 5).map((h) => (
                <div
                  key={h.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    backgroundColor: 'var(--surface-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: h.primary_priority === 'CRITICAL' ? 'rgba(251, 113, 133, 0.15)' : 'rgba(0, 240, 255, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Flame
                        size={16}
                        style={{
                          color: h.primary_priority === 'CRITICAL' ? 'var(--priority-critical)' : 'var(--accent-primary)',
                        }}
                      />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="mono" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                          {h.id}
                        </span>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', backgroundColor: 'var(--surface-tertiary)', color: 'var(--text-secondary)' }}>
                          {h.primary_waste_type}
                        </span>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: h.max_severity >= 8 ? 'var(--priority-critical)' : 'var(--text-muted)' }}>
                          Sev: {h.max_severity}/10
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                        📍 {h.address_summary}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                    <span className="mono" style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {h.report_count} reports
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      radius ~250m
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* 5. Resolution Performance — real data from /analytics/performance */}
        <Card title="5. Resolution Performance" subtitle="Average time from submission to completion (live backend data)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {analyticsData.performanceLoading && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Loading performance data…</span>
            )}
            {analyticsData.performanceError && !analyticsData.performanceLoading && (
              <div style={{ padding: '12px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-muted)' }}>
                {analyticsData.performanceError}
              </div>
            )}
            {analyticsData.performance && !analyticsData.performanceLoading && (() => {
              const p = analyticsData.performance;
              const metrics = [
                { label: 'Completed Reports', value: p.completedCount, unit: 'reports' },
                { label: 'Verified Reports', value: p.verifiedCount, unit: 'reports' },
                { label: 'Pending Resolution', value: p.pendingResolution, unit: 'reports' },
                { label: 'Avg Resolution Time', value: p.avgResolutionDisplay, unit: '' },
                { label: 'Avg Verification Time', value: p.avgVerificationDisplay, unit: '' },
              ];
              return metrics.map((m, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>{m.label}</span>
                  <span className="mono" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {m.value}{m.unit ? ` ${m.unit}` : ''}
                  </span>
                </div>
              ));
            })()}
          </div>
        </Card>

        {/* 6. Cleanup Performance — real data derived from report counts */}
        <Card title="6. Cleanup Clearance Performance" subtitle="Completion metrics derived from live report data">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {(() => {
              const p = analyticsData.performance;
              const total = p ? (p.completedCount + p.verifiedCount + p.pendingResolution) : 0;
              const clearanceRate = (p && total > 0) ? Math.round(((p.completedCount + p.verifiedCount) / total) * 100) : null;
              const diversionRate = analyticsData.recyclablePercent ?? null;
              return (<>
                <div style={{ padding: '14px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>Clearance Rate</span>
                    <span className="mono" style={{ fontSize: '15px', fontWeight: 800, color: 'var(--status-completed)' }}>{clearanceRate !== null ? `${clearanceRate}%` : '—'}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>Reports completed or verified out of total tracked</p>
                </div>
                <div style={{ padding: '14px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>Recyclable Waste Reports</span>
                    <span className="mono" style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-primary)' }}>{diversionRate !== null ? `${diversionRate}%` : '—'}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>Reports classified as recyclable by backend AI</p>
                </div>
              </>);
            })()}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

