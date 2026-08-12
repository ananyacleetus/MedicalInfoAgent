import React, { useState } from 'react';
import { MedicalDataBridge } from '../core/MedicalDataBridge';
import { MedicationAgent } from '../core/MedicationAgent';
import { 
  Pill, 
  ShieldAlert, 
  Clock, 
  FileText, 
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  CopyCheck
} from 'lucide-react';

export const MedicationDashboard: React.FC = () => {
  const bridge = MedicalDataBridge.getInstance();
  const agent = MedicationAgent.getInstance();
  
  const [analysis, setAnalysis] = useState(() => bridge.getMedicationAgentAnalysis());

  // Interactive Simulator state
  const [simName, setSimName] = useState<string>('Warfarin');
  const [simDosage, setSimDosage] = useState<string>('5 mg');
  const [simFreq, setSimFreq] = useState<string>('Once daily');
  const [simResult, setSimResult] = useState<ReturnType<typeof agent.simulateCandidateMedication> | null>(null);

  const refreshAnalysis = () => {
    setAnalysis(bridge.getMedicationAgentAnalysis());
  };

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName.trim()) return;
    const allMeds = bridge.getAllMedications();
    const result = agent.simulateCandidateMedication(allMeds, simName, simDosage, simFreq);
    setSimResult(result);
  };

  const {
    activeMedications,
    changesTracked,
    duplicateAlerts,
    interactionAlerts,
    overallSafetyScore
  } = analysis;

  const scoreColor = overallSafetyScore >= 85 ? '#34d399' : overallSafetyScore >= 65 ? '#fbbf24' : '#f43f5e';

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 40px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(168, 85, 247, 0.2))',
              border: '1px solid rgba(236, 72, 153, 0.4)',
              padding: '10px',
              borderRadius: '12px',
              color: '#ec4899',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Pill size={26} />
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 700 }}>
              Medication Intelligence <span className="gradient-text">& Safety Agent</span>
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Continuous tracking of active medications, dosage change history, duplicate detection, and clinical drug interaction risks across all patient records.
          </p>
        </div>

        <button className="btn-primary" onClick={refreshAnalysis} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RotateCcw size={16} /> Re-run Medication Audit
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {/* Safety Score Card */}
        <div className="glass-card" style={{ padding: '20px', borderLeft: `4px solid ${scoreColor}` }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>MEDICATION SAFETY SCORE</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: scoreColor, marginTop: '4px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            {overallSafetyScore} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/ 100</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {overallSafetyScore >= 85 ? 'Optimal safety profile' : overallSafetyScore >= 65 ? 'Moderate interaction alerts' : 'Critical drug conflicts flagged'}
          </div>
        </div>

        {/* Active Meds Count */}
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE MEDICATIONS</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
            {activeMedications.length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Deduplicated active regimen</div>
        </div>

        {/* Changes Tracked */}
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #38bdf8' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>DOSAGE CHANGES AUDITED</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
            {changesTracked.length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Modifications across documents</div>
        </div>

        {/* Interactions & Duplicates */}
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #f43f5e' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>CLINICAL ALERTS</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#f43f5e', marginTop: '4px' }}>
            {interactionAlerts.length + duplicateAlerts.length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {interactionAlerts.length} interactions | {duplicateAlerts.length} duplicates
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Cabinet & Timeline) | Right Column (Interactions & Simulator) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Active Medication Cabinet */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399' }}>
              <Pill size={20} />
              Active Medication Cabinet ({activeMedications.length})
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {activeMedications.map((med) => (
                <div
                  key={med.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0 }}>
                        {med.drugName}
                      </h4>
                      <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 600 }}>
                        {agent.normalizeDrugName(med.drugName).toUpperCase()}
                      </span>
                    </div>

                    <span style={{
                      background: med.status === 'MODIFIED' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: med.status === 'MODIFIED' ? '#38bdf8' : '#34d399',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      textTransform: 'uppercase'
                    }}>
                      {med.status || 'ACTIVE'}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-secondary)' }}>
                    <div>Dosage: <strong style={{ color: '#fff' }}>{med.dosage}</strong></div>
                    <div>Frequency: <strong style={{ color: '#fff' }}>{med.frequency}</strong></div>
                    {med.prescriber && <div>Prescriber: <span style={{ color: '#c084fc' }}>{med.prescriber}</span></div>}
                    {med.startDate && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Started: {med.startDate}</div>}
                  </div>

                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.1)', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FileText size={12} /> Source: {med.sourceDocName}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dosage & Frequency Change Audit Trail */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
              <Clock size={20} />
              Dosage & Schedule Change Audit Trail ({changesTracked.length})
            </h3>

            {changesTracked.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No dosage changes detected across uploaded document records.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {changesTracked.map((rec) => (
                  <div
                    key={rec.id}
                    style={{
                      background: 'rgba(56, 189, 248, 0.05)',
                      borderLeft: '4px solid #38bdf8',
                      padding: '14px 16px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '14px', color: '#fff' }}>{rec.drugName}</strong>
                        <span style={{
                          background: 'rgba(56, 189, 248, 0.2)',
                          color: '#38bdf8',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '10px'
                        }}>
                          {rec.changeType.replace('_', ' ')}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                        {rec.description}
                      </p>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Previous: <span style={{ textDecoration: 'line-through' }}>{rec.previousValue}</span> → New: <strong style={{ color: '#34d399' }}>{rec.newValue}</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '110px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>{rec.date}</span>
                      <span style={{ fontSize: '11px', color: '#a855f7' }}>{rec.sourceDocName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Drug-Drug Interaction Alerts */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e' }}>
              <ShieldAlert size={20} />
              Drug-Drug Interaction Risk Engine ({interactionAlerts.length})
            </h3>

            {interactionAlerts.length === 0 ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', color: '#34d399' }}>
                <CheckCircle2 size={18} />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>No major clinical drug interactions identified.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {interactionAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    style={{
                      background: alert.severity === 'CRITICAL' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      border: `1px solid ${alert.severity === 'CRITICAL' ? 'rgba(244, 63, 94, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                      padding: '16px',
                      borderRadius: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle size={16} color={alert.severity === 'CRITICAL' ? '#f43f5e' : '#fbbf24'} />
                        <strong style={{ color: '#fff', fontSize: '14px' }}>
                          {alert.drugA} + {alert.drugB}
                        </strong>
                      </div>
                      <span style={{
                        background: alert.severity === 'CRITICAL' ? '#f43f5e' : '#f59e0b',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '10px'
                      }}>
                        {alert.severity}
                      </span>
                    </div>

                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: '1.4' }}>
                      <strong>Impact:</strong> {alert.clinicalImpact}
                    </p>
                    
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', fontSize: '12px', color: '#38bdf8' }}>
                      <strong>Recommendation:</strong> {alert.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Duplicate Active Rx Warnings */}
          {duplicateAlerts.length > 0 && (
            <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid #f59e0b' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24' }}>
                <AlertTriangle size={18} />
                Duplicate Prescription Warnings ({duplicateAlerts.length})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {duplicateAlerts.map((dup) => (
                  <div key={dup.id} style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                    <div style={{ fontWeight: 700, color: '#fbbf24', marginBottom: '2px' }}>
                      {dup.drugName} ({dup.matchType.replace('_', ' ')})
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>{dup.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Rx Simulator */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc' }}>
              <Sparkles size={20} />
              Interactive Rx Safety Simulator
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Simulate introducing a candidate drug to test for real-time interaction safety against the patient's active regimen.
            </p>

            <form onSubmit={handleSimulate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Candidate Drug Name</label>
                <input
                  type="text"
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  placeholder="e.g. Warfarin, Aspirin, Ibuprofen, Lisinopril..."
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid var(--border-color)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Dosage</label>
                  <input
                    type="text"
                    value={simDosage}
                    onChange={(e) => setSimDosage(e.target.value)}
                    placeholder="e.g. 5 mg"
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid var(--border-color)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Frequency</label>
                  <input
                    type="text"
                    value={simFreq}
                    onChange={(e) => setSimFreq(e.target.value)}
                    placeholder="e.g. Once daily"
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid var(--border-color)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              <button className="btn-primary" type="submit" style={{ marginTop: '6px', justifyContent: 'center' }}>
                <Stethoscope size={16} /> Run Pre-Prescribe Safety Check
              </button>
            </form>

            {/* Simulator Output */}
            {simResult && (
              <div style={{ marginTop: '16px', background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CopyCheck size={16} color="#34d399" />
                  Simulation Result for {simResult.candidate.drugName} ({simResult.candidate.dosage})
                </h4>

                {simResult.isDuplicate && (
                  <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '8px' }}>
                    <strong>Duplicate Warning:</strong> {simResult.duplicateDescription}
                  </div>
                )}

                {simResult.interactionAlerts.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {simResult.interactionAlerts.map(alert => (
                      <div key={alert.id} style={{ background: 'rgba(244, 63, 94, 0.15)', borderLeft: '3px solid #f43f5e', padding: '10px', borderRadius: '6px', fontSize: '12px' }}>
                        <div style={{ fontWeight: 700, color: '#f43f5e' }}>{alert.severity} INTERACTION: {alert.drugA} + {alert.drugB}</div>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{alert.clinicalImpact}</div>
                      </div>
                    ))}
                  </div>
                ) : !simResult.isDuplicate ? (
                  <div style={{ color: '#34d399', fontSize: '13px', fontWeight: 600 }}>
                    Clean Safety Profile: No direct interactions found with current regimen.
                  </div>
                ) : null}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
