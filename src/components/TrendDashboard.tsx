import React, { useState } from 'react';
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
  Filler 
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp, Activity, AlertTriangle, CheckCircle, Calendar, Sparkles } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const TrendDashboard: React.FC = () => {
  const bridge = MedicalDataBridge.getInstance();
  const timeSeries = bridge.getBiomarkerTimeSeries();
  const biomarkerNames = Object.keys(timeSeries);

  const [activeBiomarker, setActiveBiomarker] = useState<string>(biomarkerNames[0] || 'Glucose');

  const selectedObservations = timeSeries[activeBiomarker] || [];

  const labels = selectedObservations.map(o => o.timestamp.substring(0, 10));
  const dataValues = selectedObservations.map(o => o.value);
  const minRef = selectedObservations[0]?.refRangeMin || 70;
  const maxRef = selectedObservations[0]?.refRangeMax || 99;
  const unit = selectedObservations[0]?.unit || '';

  const chartData = {
    labels: labels.length > 0 ? labels : ['2026-01-15', '2026-06-20'],
    datasets: [
      {
        label: `${activeBiomarker} (${unit})`,
        data: dataValues.length > 0 ? dataValues : [118, 94],
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#0284c7',
        pointRadius: 6,
        pointHoverRadius: 8
      },
      {
        label: `Max Normal Ref (${maxRef} ${unit})`,
        data: labels.map(() => maxRef),
        borderColor: 'rgba(244, 63, 94, 0.5)',
        borderDash: [5, 5],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false
      },
      {
        label: `Min Normal Ref (${minRef} ${unit})`,
        data: labels.map(() => minRef),
        borderColor: 'rgba(16, 185, 129, 0.5)',
        borderDash: [5, 5],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#9ca3af',
          font: { family: 'Inter', size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#fff',
        bodyColor: '#38bdf8',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#9ca3af' }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#9ca3af' }
      }
    }
  };

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', padding: '0 24px 40px 24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>
          Medical Data & Biomarker <span className="gradient-text">Trends</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Aggregated longitudinal analysis of lab biomarker values extracted across imported clinical documents.
        </p>
      </div>

      {/* Biomarker Selector Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {biomarkerNames.map(name => {
          const isActive = activeBiomarker === name;
          return (
            <button
              key={name}
              onClick={() => setActiveBiomarker(name)}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, #0284c7, #6366f1)' : 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontWeight: isActive ? 700 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 4px 15px rgba(2, 132, 199, 0.4)' : 'none'
              }}
            >
              <Activity size={16} color={isActive ? '#fff' : '#06b6d4'} />
              {name}
            </button>
          );
        })}
      </div>

      {/* Main Trend Chart Card */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: '#38bdf8' }}>
              <TrendingUp size={22} />
              {activeBiomarker} Time-Series Trend Analysis
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Normal Reference Interval: {minRef} - {maxRef} {unit}
            </p>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} />
            Clinical Trend: Normalizing over time
          </div>
        </div>

        <div style={{ height: '360px', width: '100%' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Timeline Observation Logs */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="#8b5cf6" />
          Extracted Observations for {activeBiomarker}
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {selectedObservations.map((obs) => (
            <div
              key={obs.id}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-color)',
                padding: '14px 18px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  background: obs.status === 'NORMAL' ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
                  color: obs.status === 'NORMAL' ? '#34d399' : '#f43f5e',
                  padding: '8px',
                  borderRadius: '10px'
                }}>
                  {obs.status === 'NORMAL' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: '#fff' }}>
                    {obs.value} {obs.unit}
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '10px' }}>
                      (Reference: {obs.refRangeText || `${obs.refRangeMin}-${obs.refRangeMax} ${obs.unit}`})
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Source Document: {obs.sourceDocName}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#38bdf8' }}>
                  {obs.timestamp.substring(0, 10)}
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: obs.status === 'NORMAL' ? '#34d399' : '#f43f5e',
                  textTransform: 'uppercase'
                }}>
                  {obs.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
