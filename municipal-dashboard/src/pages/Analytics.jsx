import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  MapPin,
  Download
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { KPICard } from '../components/ui/KPICard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';

export const Analytics = () => {
  const { kpis, analyticsData } = useApp();

  return (
    <PageContainer
      title="Analytics"
      subtitle="Understand waste trends, municipal response performance, and hotspot density."
      actions={
        <Button variant="outline" size="sm" onClick={() => alert('Municipal analytics PDF report exported.')} icon={Download}>
          Export PDF Report
        </Button>
      }
    >
      {/* 4 Top Glass KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px'
        }}
      >
        <KPICard
          title="Total Reports"
          value={kpis.totalReports}
          subtitle="Cumulative city intake"
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
              const maxVal = Math.max(...analyticsData.reportsOverTime.map(d => Math.max(d.reports, d.resolved)), 1);
              return (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '170px', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  {analyticsData.reportsOverTime.map((d, idx) => {
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
        <Card title="2. Waste Type Distribution" subtitle="Composition breakdown from AI classification">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {analyticsData.wasteTypeDistribution.map((w, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{w.type}</span>
                  <span className="mono" style={{ color: 'var(--text-secondary)' }}>{w.count} ({w.percent}%)</span>
                </div>
                <ProgressBar value={w.percent} height={6} color="var(--accent-primary)" />
              </div>
            ))}
          </div>
        </Card>

        {/* 3. Priority Distribution */}
        <Card title="3. Priority Distribution" subtitle="Triage classification by urgency level">
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

        {/* 4. Top Hotspots — backend gap in Phase I, no geospatial endpoint available */}
        <Card title="4. Top Municipal Hotspots" subtitle="Zones with highest waste incident recurrence">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '36px 16px', gap: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>
            <MapPin size={28} style={{ opacity: 0.35 }} />
            <span style={{ fontSize: '13px', fontWeight: 500 }}>
              Hotspot analytics require a geospatial aggregation endpoint not yet available in Phase I.
            </span>
            <span style={{ fontSize: '11px' }}>This section will be populated in a future backend release.</span>
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
              // Use authoritative is_recyclable boolean (via analyticsData.recyclablePercent),
              // NOT a regex on wasteType strings.
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
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>Reports classified as plastic or recyclable by AI</p>
                </div>
              </>);
            })()}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};
