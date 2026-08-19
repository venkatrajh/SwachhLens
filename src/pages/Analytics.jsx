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
          subtitle="Annual cumulative intake"
          icon={BarChart3}
          trend="+14% MoM"
          trendType="neutral"
        />
        <KPICard
          title="Avg Response Time"
          value={kpis.avgResponseTime}
          subtitle="Triage to crew assignment"
          icon={Clock}
          trend="-8 min SLA improvement"
          trendType="positive"
        />
        <KPICard
          title="Avg Cleanup Time"
          value={kpis.avgCleanupTime}
          subtitle="Dispatch to clearance"
          icon={TrendingUp}
          trend="-22 min faster"
          trendType="positive"
        />
        <KPICard
          title="Verification Rate"
          value={kpis.verificationRate}
          subtitle="AI & manual audit pass"
          icon={CheckCircle2}
          trend="99.4% target"
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '170px', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              {analyticsData.reportsOverTime.map((d, idx) => {
                const heightReports = Math.round((d.reports / 250) * 140);
                const heightResolved = Math.round((d.resolved / 250) * 140);
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
                          boxShadow: '0 0 10px var(--accent-cyan-glow)'
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

        {/* 4. Top Hotspots (Zone Breakdown) */}
        <Card title="4. Top Municipal Hotspots" subtitle="Zones with highest waste incident recurrence">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {analyticsData.topHotspots.map((h, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} style={{ color: 'var(--text-muted)' }} />
                    {h.zone}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Avg Severity: {h.severityAvg}/10</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{h.incidents}</div>
                  <span style={{ fontSize: '10px', color: h.status === 'Critical' ? 'var(--priority-critical)' : 'var(--text-muted)' }}>
                    {h.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 5. Response Performance (SLA adherence) */}
        <Card title="5. Response Performance (SLA)" subtitle="Time taken from citizen report to crew deployment">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {analyticsData.responseSLA.map((s, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                  <span style={{ color: 'var(--text-primary)' }}>{s.range}</span>
                  <span className="mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.percentage}%</span>
                </div>
                <ProgressBar
                  value={s.percentage}
                  height={6}
                  color={s.percentage > 50 ? 'var(--status-completed)' : 'var(--accent-primary)'}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* 6. Cleanup Performance */}
        <Card title="6. Cleanup Clearance Performance" subtitle="Weekly completion metrics and recycling recovery rate">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '14px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>First-Pass Clearance Rate</span>
                <span className="mono" style={{ fontSize: '15px', fontWeight: 800, color: 'var(--status-completed)' }}>94.6%</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                Incidents resolved in single crew visit without recurrence
              </p>
            </div>

            <div style={{ padding: '14px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>Material Recovery Facility (MRF) Diversion</span>
                <span className="mono" style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-primary)' }}>62.8%</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                Plastic and dry recyclables diverted from municipal landfills
              </p>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};
