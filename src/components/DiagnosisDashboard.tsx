import React, { useState, useMemo } from 'react';
import { MedicalDataBridge } from '../core/MedicalDataBridge';
import {
  Stethoscope,
  Activity,
  CheckCircle,
  FileText,
  Pill,
  TestTube,
  Sparkles,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Search,
  Clock
} from 'lucide-react';

export const DiagnosisDashboard: React.FC = () => {
  const bridge = MedicalDataBridge.getInstance();
  const diagnosisAnalysis = useMemo(() => bridge.getDiagnosisAgentAnalysis(), []);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeEpisodeId, setActiveEpisodeId] = useState<string>(
    diagnosisAnalysis.clinicalEpisodes[0]?.episodeId || ''
  );
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'ALL' | 'CONFIRMED' | 'SUSPECTED'>('ALL');

  const filteredEpisodes = useMemo(() => {
    return diagnosisAnalysis.clinicalEpisodes.filter(ep => {
      const matchesSearch =
        ep.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ep.icdCode && ep.icdCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ep.linkedSymptoms.some(s => s.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ep.linkedMedications.some(m => m.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType =
        selectedTypeFilter === 'ALL' || ep.diagnosisType === selectedTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [diagnosisAnalysis, searchTerm, selectedTypeFilter]);

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', padding: '0 24px 48px 24px' }}>
      
      {/* ── Page Header ── */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Stethoscope size={28} color="#38bdf8" />
          Diagnosis & Symptom <span className="gradient-text">Intelligence</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Cross-referenced condition mapping, temporal episode clustering, and symptom graph synthesis across clinical records.
        </p>
      </div>

      {/* ── Summary Stats Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.12)', padding: '12px', borderRadius: '12px' }}>
            <Stethoscope size={22} color="#38bdf8" />
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#38bdf8', lineHeight: 1 }}>
              {diagnosisAnalysis.totalUniqueConditions}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Unique Conditions
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(167, 139, 250, 0.12)', padding: '12px', borderRadius: '12px' }}>
            <Clock size={22} color="#a78bfa" />
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#a78bfa', lineHeight: 1 }}>
              {diagnosisAnalysis.totalEpisodes}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Temporal Episodes (60d Window)
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(52, 211, 153, 0.12)', padding: '12px', borderRadius: '12px' }}>
            <CheckCircle size={22} color="#34d399" />
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#34d399', lineHeight: 1 }}>
              {diagnosisAnalysis.confirmedDiagnoses.length}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Confirmed Diagnoses
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(251, 146, 60, 0.12)', padding: '12px', borderRadius: '12px' }}>
            <Activity size={22} color="#fb923c" />
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#fb923c', lineHeight: 1 }}>
              {diagnosisAnalysis.totalSymptoms}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Symptoms Mapped
            </div>
          </div>
        </div>
      </div>

      {/* ── Feature Highlight Banner: Temporal Episode Clustering Demo ── */}
      <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '28px', borderLeft: '4px solid #38bdf8', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.05), rgba(139, 92, 246, 0.05))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Sparkles size={20} color="#38bdf8" />
          <span style={{ fontWeight: 700, fontSize: '16px', color: '#fff' }}>
            Temporal Episode Clustering Engine Active
          </span>
          <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '20px' }}>
            60-Day Sliding Window
          </span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
          Diagnoses are automatically split into distinct clinical bouts based on date gaps. For example, <strong>Nephrolithiasis (Kidney Stones)</strong> appears as two separate episodes (<strong>Jan 2026 bout</strong> vs <strong>Sep 2026 bout</strong> 8 months later), keeping orders, scans, and medications isolated to their specific presentation window.
        </p>
      </div>

      {/* ── Filter Controls ── */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by diagnosis, ICD-10 code, symptom, or medication..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 40px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'rgba(255, 255, 255, 0.04)',
              color: '#fff',
              fontSize: '13px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {(['ALL', 'CONFIRMED', 'SUSPECTED'] as const).map(type => (
            <button
              key={type}
              onClick={() => setSelectedTypeFilter(type)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                background: selectedTypeFilter === type ? 'linear-gradient(135deg, #0284c7, #6366f1)' : 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontWeight: selectedTypeFilter === type ? 700 : 500,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {type === 'ALL' ? 'All Types' : type}
            </button>
          ))}
        </div>
      </div>

      {/* ── Clinical Episodes List ── */}
      <div style={{ marginBottom: '36px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={20} color="#a78bfa" />
          Clinical Episodes ({filteredEpisodes.length})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredEpisodes.map(ep => {
            const isExpanded = activeEpisodeId === ep.episodeId;
            const isConfirmed = ep.diagnosisType === 'CONFIRMED';
            return (
              <div
                key={ep.episodeId}
                className="glass-card"
                style={{
                  padding: '20px 24px',
                  border: isExpanded ? '1.5px solid #38bdf8' : '1px solid var(--border-color)',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Episode Header Bar */}
                <div
                  onClick={() => setActiveEpisodeId(isExpanded ? '' : ep.episodeId)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <span style={{
                      background: isConfirmed ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 146, 60, 0.15)',
                      color: isConfirmed ? '#34d399' : '#fb923c',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      {ep.diagnosisType}
                    </span>

                    <span style={{ fontWeight: 700, fontSize: '17px', color: '#fff' }}>
                      {ep.displayName}
                    </span>

                    {ep.icdCode && (
                      <span style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: 'var(--text-muted)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontFamily: 'monospace'
                      }}>
                        ICD-10: {ep.icdCode}
                      </span>
                    )}

                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} color="#38bdf8" />
                      {ep.episodeStartDate} {ep.episodeStartDate !== ep.episodeEndDate ? `→ ${ep.episodeEndDate}` : ''}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#a78bfa', background: 'rgba(167, 139, 250, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>
                      {ep.documentCount} Records Linked
                    </span>
                    {isExpanded ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                  </div>
                </div>

                {/* Expanded Episode Details */}
                {isExpanded && (
                  <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    
                    {/* Linked Symptoms & Meds Summary */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                      
                      {/* Symptoms */}
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#fb923c', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Activity size={14} /> Symptoms in Episode ({ep.linkedSymptoms.length})
                        </div>
                        {ep.linkedSymptoms.length === 0 ? (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No explicit symptoms documented</span>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {ep.linkedSymptoms.map(sym => (
                              <span
                                key={sym.id}
                                style={{
                                  background: 'rgba(251, 146, 60, 0.12)',
                                  color: '#fb923c',
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: 500
                                }}
                              >
                                {sym.displayName} {sym.severity ? `(${sym.severity})` : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Medications */}
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Pill size={14} /> Relevant Rx Therapies ({ep.linkedMedications.length})
                        </div>
                        {ep.linkedMedications.length === 0 ? (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No specific medications linked</span>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {ep.linkedMedications.map(med => (
                              <span
                                key={med}
                                style={{
                                  background: 'rgba(52, 211, 153, 0.12)',
                                  color: '#34d399',
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: 600
                                }}
                              >
                                {med}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Linked Clinical Records Timeline */}
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={15} /> Linked Clinical Records & Lab Panels ({ep.linkedRecords.length})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {ep.linkedRecords.map(rec => (
                          <div
                            key={`${rec.recordType}-${rec.recordId}`}
                            style={{
                              background: 'rgba(255,255,255,0.03)',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {rec.recordType === 'DOCUMENT' && <FileText size={16} color="#38bdf8" />}
                              {rec.recordType === 'MEDICATION' && <Pill size={16} color="#34d399" />}
                              {rec.recordType === 'BIOMARKER' && <TestTube size={16} color="#a78bfa" />}
                              
                              <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                                {rec.recordLabel}
                              </span>

                              {rec.documentCategory && (
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                                  {rec.documentCategory}
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                {rec.date}
                              </span>
                              <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>
                                Source: {rec.sourceDocName}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Symptom Clusters Section ── */}
      {diagnosisAnalysis.symptomClusters.length > 0 && (
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="#fb923c" />
            Synthesized Symptom Clusters ({diagnosisAnalysis.symptomClusters.length})
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {diagnosisAnalysis.symptomClusters.map(cluster => (
              <div key={cluster.clusterName} className="glass-card" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#fb923c', marginBottom: '12px' }}>
                  {cluster.clusterName}
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                  {cluster.symptoms.map(s => (
                    <span
                      key={s.id}
                      style={{
                        background: 'rgba(251, 146, 60, 0.12)',
                        color: '#fb923c',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 500
                      }}
                    >
                      {s.displayName}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Associated Condition IDs: {cluster.linkedDiagnosisIds.join(', ') || 'General Presentation'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
