import React, { useState } from 'react';
import { MedicalDataBridge } from '../core/MedicalDataBridge';
import { 
  Copy, 
  Check, 
  Activity, 
  Code2,
  Share2
} from 'lucide-react';

export const AgentBridgeView: React.FC = () => {
  const bridge = MedicalDataBridge.getInstance();
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedBiomarkerFilter, setSelectedBiomarkerFilter] = useState<string>('ALL');

  const payload = bridge.exportAgentPayload();
  const allObservations = bridge.getAllBiomarkerObservations();

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredObservations = selectedBiomarkerFilter === 'ALL'
    ? allObservations
    : allObservations.filter(o => o.canonicalName === selectedBiomarkerFilter);

  const uniqueBiomarkerNames = Array.from(new Set(allObservations.map(o => o.canonicalName)));

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', padding: '0 24px 40px 24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>
          Insights & Analytics <span className="gradient-text">Agent Data Bridge</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Standardized access layer making extracted lab values, LOINC codes, reference ranges, and medications accessible for downstream Insights AI agents.
        </p>
      </div>

      {/* Metrics Header Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #06b6d4' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL INGESTED DOCUMENTS</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>{payload.totalDocuments}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Queryable via Data Bridge API</div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>NORMALIZED BIOMARKER OBSERVATIONS</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#c084fc', marginTop: '4px' }}>{allObservations.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Standardized LOINC / Canonical schema</div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE MEDICATIONS</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>{payload.medications.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Prescription & dosage history</div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>INTER-AGENT PROTOCOL</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#fbbf24', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Share2 size={16} /> JSON / Event Bus API
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Reactive event stream ready</div>
        </div>
      </div>

      {/* Split view: Normalized Biomarkers Table vs JSON Agent Payload */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
        {/* Normalized Biomarkers Table */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc' }}>
              <Activity size={20} />
              Normalized Biomarkers ({filteredObservations.length})
            </h3>

            {/* Filter */}
            <select
              value={selectedBiomarkerFilter}
              onChange={(e) => setSelectedBiomarkerFilter(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '13px'
              }}
            >
              <option value="ALL">All Biomarkers</option>
              {uniqueBiomarkerNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Biomarker / LOINC</th>
                  <th style={{ padding: '10px' }}>Value</th>
                  <th style={{ padding: '10px' }}>Ref Range</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredObservations.map((obs) => (
                  <tr key={obs.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 10px' }}>
                      <strong style={{ color: '#fff' }}>{obs.canonicalName}</strong>
                      {obs.loincCode && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>LOINC: {obs.loincCode}</div>}
                    </td>
                    <td style={{ padding: '12px 10px', fontWeight: 700, color: '#38bdf8' }}>
                      {obs.value} {obs.unit}
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                      {obs.refRangeText || `${obs.refRangeMin}-${obs.refRangeMax}`}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{
                        background: obs.status === 'HIGH' ? 'rgba(244,63,94,0.2)' : obs.status === 'LOW' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)',
                        color: obs.status === 'HIGH' ? '#f43f5e' : obs.status === 'LOW' ? '#fbbf24' : '#34d399',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        {obs.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {obs.timestamp.substring(0, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* JSON Payload for Insights Agent */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
              <Code2 size={20} />
              Insights Agent Payload JSON
            </h3>
            <button className="btn-primary" onClick={handleCopyJson} style={{ padding: '6px 12px', fontSize: '12px' }}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Payload'}
            </button>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            This exact structured object is fed directly into prompt context or REST endpoints for your downstream Insights & Analytics Agent.
          </p>

          <pre style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11.5px',
            background: 'rgba(0,0,0,0.5)',
            padding: '16px',
            borderRadius: '10px',
            maxHeight: '440px',
            overflowY: 'auto',
            border: '1px solid var(--border-color)',
            color: '#34d399'
          }}>
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
