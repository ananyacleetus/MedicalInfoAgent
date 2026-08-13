import React, { useState, useMemo } from 'react';
import { MedicalDataBridge } from '../core/MedicalDataBridge';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Sparkles,
  FlaskConical,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Info,
  BarChart3,
  Zap
} from 'lucide-react';
import { BiomarkerTrendMetric, LabClinicalInsight } from '../core/types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

/* ─── Helpers ──────────────────────────────────────────────────── */

function trendIcon(direction: string) {
  if (direction === 'IMPROVING') return <TrendingUp size={16} color="#34d399" />;
  if (direction === 'WORSENING') return <TrendingDown size={16} color="#f43f5e" />;
  return <Minus size={16} color="#9ca3af" />;
}

function trendColor(direction: string): string {
  if (direction === 'IMPROVING') return '#34d399';
  if (direction === 'WORSENING') return '#f43f5e';
  return '#9ca3af';
}

function severityBadge(severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL') {
  const map: Record<string, { bg: string; color: string }> = {
    LOW:      { bg: 'rgba(16,185,129,0.15)',  color: '#34d399' },
    MODERATE: { bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24' },
    HIGH:     { bg: 'rgba(244,63,94,0.15)',   color: '#f43f5e' },
    CRITICAL: { bg: 'rgba(139,0,0,0.25)',     color: '#ff6b6b' },
  };
  const s = map[severity] || map.MODERATE;
  return (
    <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: s.bg, color: s.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {severity}
    </span>
  );
}

function insightTypeIcon(type: string) {
  const icons: Record<string, React.ReactNode> = {
    ABNORMAL_VALUE:       <AlertTriangle size={18} color="#f43f5e" />,
    RAPID_CHANGE:         <Zap size={18} color="#fbbf24" />,
    CONSISTENT_WORSENING: <TrendingDown size={18} color="#f43f5e" />,
    NORMALIZATION:        <CheckCircle size={18} color="#34d399" />,
    REFERENCE_EXCEEDED:   <AlertTriangle size={18} color="#fb923c" />,
  };
  return icons[type] || <Info size={18} color="#9ca3af" />;
}

/* ─── Component ─────────────────────────────────────────────────── */

export const TrendDashboard: React.FC = () => {
  const bridge = MedicalDataBridge.getInstance();
  const labAnalysis = useMemo(() => bridge.getLabAgentAnalysis(), []);
  const timeSeries = bridge.getBiomarkerTimeSeries();
  const biomarkerNames = Object.keys(timeSeries);

  const [activeBiomarker, setActiveBiomarker] = useState<string>(biomarkerNames[0] || 'Glucose');
  const [insightsExpanded, setInsightsExpanded] = useState(true);

  const selectedObs = timeSeries[activeBiomarker] || [];
  const activeTrendMetric: BiomarkerTrendMetric | undefined =
    labAnalysis.trendMetrics.find((m: BiomarkerTrendMetric) => m.biomarkerName === activeBiomarker);

  const labels = selectedObs.map(o => o.timestamp.substring(0, 10));
  const dataValues = selectedObs.map(o => o.value);
  const unit = activeTrendMetric?.normalizedUnit || selectedObs[0]?.unit || '';
  const minRef = selectedObs[0]?.refRangeMin ?? 0;
  const maxRef = selectedObs[0]?.refRangeMax ?? 200;

  const chartData = {
    labels: labels.length > 0 ? labels : ['2026-01-15', '2026-06-20'],
    datasets: [
      {
        label: `${activeBiomarker} (${unit})`,
        data: dataValues.length > 0 ? dataValues : [118, 94],
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56,189,248,0.12)',
        tension: 0.38,
        fill: true,
        pointBackgroundColor: dataValues.map(v => (v > maxRef || v < minRef ? '#f43f5e' : '#0284c7')),
        pointRadius: 7,
        pointHoverRadius: 10,
        borderWidth: 2.5,
      },
      {
        label: `Max Normal (${maxRef} ${unit})`,
        data: labels.length > 0 ? labels.map(() => maxRef) : [maxRef, maxRef],
        borderColor: 'rgba(244,63,94,0.45)',
        borderDash: [6, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      },
      {
        label: `Min Normal (${minRef} ${unit})`,
        data: labels.length > 0 ? labels.map(() => minRef) : [minRef, minRef],
        borderColor: 'rgba(16,185,129,0.45)',
        borderDash: [6, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#9ca3af', font: { family: 'Inter', size: 12 } } },
      tooltip: { backgroundColor: 'rgba(15,23,42,0.95)', titleColor: '#fff', bodyColor: '#38bdf8', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 12 },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#9ca3af', font: { size: 12 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#9ca3af', font: { size: 12 } } },
    },
  };

  const improvingCount  = labAnalysis.trendMetrics.filter((m: BiomarkerTrendMetric) => m.trendDirection === 'IMPROVING').length;
  const worseningCount  = labAnalysis.trendMetrics.filter((m: BiomarkerTrendMetric) => m.trendDirection === 'WORSENING').length;
  const abnormalCount   = labAnalysis.trendMetrics.filter((m: BiomarkerTrendMetric) => m.currentStatus !== 'NORMAL').length;
  const normalizedCount = labAnalysis.trendMetrics.filter((m: BiomarkerTrendMetric) => m.unitNormalized).length;

  const summaryCards = [
    { label: 'Biomarkers Tracked', value: labAnalysis.trendMetrics.length, icon: <BarChart3 size={22} color="#38bdf8" />, accent: '#38bdf8', bg: 'rgba(56,189,248,0.1)' },
    { label: 'Improving Trends',   value: improvingCount,                  icon: <TrendingUp size={22} color="#34d399" />, accent: '#34d399', bg: 'rgba(52,211,153,0.1)' },
    { label: 'Worsening / Abnormal', value: worseningCount + abnormalCount, icon: <AlertTriangle size={22} color="#f43f5e" />, accent: '#f43f5e', bg: 'rgba(244,63,94,0.1)' },
    { label: 'Units Normalized',   value: normalizedCount,                 icon: <RefreshCw size={22} color="#a78bfa" />, accent: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  ];

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', padding: '0 24px 48px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FlaskConical size={28} color="#38bdf8" />
          Lab <span className="gradient-text">Intelligence</span> Dashboard
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          AI-powered lab trend analysis with automated unit normalization, delta tracking, and pathology insights.
        </p>
      </div>

      {/* Summary stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {summaryCards.map(card => (
          <div key={card.label} className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: card.bg, padding: '12px', borderRadius: '12px', flexShrink: 0 }}>{card.icon}</div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: card.accent, lineHeight: 1 }}>{card.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pathology insights */}
      {labAnalysis.clinicalInsights.length > 0 && (
        <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '28px', borderLeft: '3px solid #fbbf24' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: insightsExpanded ? '16px' : 0 }}
            onClick={() => setInsightsExpanded(!insightsExpanded)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={20} color="#fbbf24" />
              <span style={{ fontWeight: 700, fontSize: '16px', color: '#fbbf24' }}>Automated Pathology Insights</span>
              <span style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24', fontSize: '12px', fontWeight: 700, padding: '2px 10px', borderRadius: '20px' }}>
                {labAnalysis.clinicalInsights.length} finding{labAnalysis.clinicalInsights.length !== 1 ? 's' : ''}
              </span>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{insightsExpanded ? '▲ Collapse' : '▼ Expand'}</span>
          </div>
          {insightsExpanded && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {labAnalysis.clinicalInsights.map((insight: LabClinicalInsight, i: number) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ marginTop: '2px', flexShrink: 0 }}>{insightTypeIcon(insight.insightType)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>{insight.biomarkerName}</span>
                      {severityBadge(insight.severity)}
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{insight.insightType.replace(/_/g, ' ')}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{insight.description}</p>
                    {insight.recommendation && (
                      <p style={{ fontSize: '12px', color: '#a78bfa', marginTop: '6px', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Info size={12} /> {insight.recommendation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Biomarker delta cards */}
      {labAnalysis.trendMetrics.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#8b5cf6" /> Biomarker Δ Summary — Baseline → Latest
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
            {labAnalysis.trendMetrics.map((metric: BiomarkerTrendMetric) => {
              const isAbnormal = metric.currentStatus !== 'NORMAL';
              const deltaPositive = (metric.deltaPercent ?? 0) >= 0;
              return (
                <div
                  key={metric.biomarkerName}
                  className="glass-card"
                  onClick={() => setActiveBiomarker(metric.biomarkerName)}
                  style={{ padding: '16px', cursor: 'pointer', border: activeBiomarker === metric.biomarkerName ? '1.5px solid #38bdf8' : isAbnormal ? '1.5px solid rgba(244,63,94,0.35)' : '1.5px solid var(--border-color)', transition: 'border 0.15s ease', position: 'relative', overflow: 'hidden' }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: trendColor(metric.trendDirection) }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{metric.biomarkerName}</span>
                    {trendIcon(metric.trendDirection)}
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: isAbnormal ? '#f43f5e' : '#38bdf8', lineHeight: 1 }}>
                    {metric.latestValue?.toFixed(1)} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)' }}>{metric.normalizedUnit}</span>
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Baseline: {metric.baselineValue?.toFixed(1)}</span>
                  </div>
                  {metric.deltaPercent !== undefined && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontSize: '12px', fontWeight: 700, color: deltaPositive ? '#f43f5e' : '#34d399', background: deltaPositive ? 'rgba(244,63,94,0.1)' : 'rgba(52,211,153,0.1)', padding: '3px 8px', borderRadius: '8px' }}>
                      {deltaPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {Math.abs(metric.deltaPercent).toFixed(1)}% Δ
                    </div>
                  )}
                  {metric.unitNormalized && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                      <RefreshCw size={11} color="#a78bfa" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Biomarker selector tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {biomarkerNames.map(name => {
          const isActive = activeBiomarker === name;
          const metric = labAnalysis.trendMetrics.find((m: BiomarkerTrendMetric) => m.biomarkerName === name);
          const abnormal = metric?.currentStatus !== 'NORMAL';
          return (
            <button
              key={name}
              onClick={() => setActiveBiomarker(name)}
              style={{ padding: '9px 16px', borderRadius: '10px', border: 'none', background: isActive ? 'linear-gradient(135deg, #0284c7, #6366f1)' : 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: isActive ? 700 : 500, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', transition: 'all 0.15s ease', boxShadow: isActive ? '0 4px 15px rgba(2,132,199,0.4)' : 'none', position: 'relative' }}
            >
              <Activity size={15} color={isActive ? '#fff' : '#06b6d4'} />
              {name}
              {abnormal && !isActive && (
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f43f5e', position: 'absolute', top: '5px', right: '5px' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Main chart */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '19px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: '#38bdf8', marginBottom: '4px' }}>
              <TrendingUp size={20} /> {activeBiomarker} — Time-Series Trend
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Reference interval: {minRef} – {maxRef} {unit}
              {activeTrendMetric?.unitNormalized && (
                <span style={{ color: '#a78bfa', marginLeft: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <RefreshCw size={11} /> Normalized from source unit
                </span>
              )}
            </p>
          </div>
          {activeTrendMetric && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ background: `${trendColor(activeTrendMetric.trendDirection)}18`, border: `1px solid ${trendColor(activeTrendMetric.trendDirection)}44`, padding: '8px 14px', borderRadius: '10px', fontSize: '13px', color: trendColor(activeTrendMetric.trendDirection), fontWeight: 600, display: 'flex', alignItems: 'center', gap: '7px' }}>
                {trendIcon(activeTrendMetric.trendDirection)}
                {activeTrendMetric.trendDirection}
                {activeTrendMetric.deltaPercent !== undefined && <span style={{ opacity: 0.8 }}>· {Math.abs(activeTrendMetric.deltaPercent).toFixed(1)}% Δ</span>}
              </div>
              <div style={{ background: activeTrendMetric.currentStatus === 'NORMAL' ? 'rgba(52,211,153,0.1)' : 'rgba(244,63,94,0.1)', border: `1px solid ${activeTrendMetric.currentStatus === 'NORMAL' ? 'rgba(52,211,153,0.3)' : 'rgba(244,63,94,0.3)'}`, padding: '8px 14px', borderRadius: '10px', fontSize: '13px', color: activeTrendMetric.currentStatus === 'NORMAL' ? '#34d399' : '#f43f5e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '7px' }}>
                {activeTrendMetric.currentStatus === 'NORMAL' ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
                {activeTrendMetric.currentStatus}
              </div>
            </div>
          )}
        </div>
        <div style={{ height: '360px', width: '100%' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Raw observations */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="#8b5cf6" /> Raw Observations — {activeBiomarker}
        </h4>
        {selectedObs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>No observations found for this biomarker.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {selectedObs.map((obs, idx) => {
              const isAbn = obs.status !== 'NORMAL';
              const isLast = idx === selectedObs.length - 1;
              return (
                <div key={obs.id} style={{ background: isLast ? 'rgba(56,189,248,0.05)' : 'rgba(255,255,255,0.02)', border: isLast ? '1px solid rgba(56,189,248,0.25)' : '1px solid var(--border-color)', padding: '14px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ background: isAbn ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)', color: isAbn ? '#f43f5e' : '#34d399', padding: '8px', borderRadius: '10px', flexShrink: 0 }}>
                      {isAbn ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {obs.value} {obs.unit}
                        {isLast && <span style={{ fontSize: '10px', fontWeight: 700, color: '#38bdf8', background: 'rgba(56,189,248,0.15)', padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase' }}>Latest</span>}
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>(Ref: {obs.refRangeText || `${obs.refRangeMin}–${obs.refRangeMax} ${obs.unit}`})</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>Source: {obs.sourceDocName}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#38bdf8' }}>{obs.timestamp.substring(0, 10)}</div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: isAbn ? '#f43f5e' : '#34d399', textTransform: 'uppercase' }}>{obs.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
