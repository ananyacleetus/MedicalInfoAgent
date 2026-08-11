import React, { useState } from 'react';
import { useMedicalData } from '../context/MedicalDataContext';
import { 
  FileText, 
  Cpu, 
  CheckCircle2, 
  Activity, 
  Pill, 
  User, 
  Calendar, 
  Sparkles,
  Search,
  Code,
  Tag
} from 'lucide-react';

export const DocumentViewer: React.FC = () => {
  const { selectedDocument, documents, setSelectedDocument } = useMedicalData();
  const [activeTabSub, setActiveTabSub] = useState<'parsed' | 'ocr' | 'json'>('parsed');
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!selectedDocument && documents.length > 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Select a document from the vault to inspect.</p>
        <button className="btn-primary" onClick={() => setSelectedDocument(documents[0])} style={{ marginTop: '12px' }}>
          Select First Document
        </button>
      </div>
    );
  }

  if (!selectedDocument) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>No medical documents ingested yet.</p>
      </div>
    );
  }

  const payload = selectedDocument.extractedPayload;
  const classification = selectedDocument.classification;

  return (
    <div style={{ padding: '0 24px 40px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header bar */}
      <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'rgba(6, 182, 212, 0.15)',
            padding: '12px',
            borderRadius: '12px',
            color: '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileText size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700 }}>{selectedDocument.filename}</h3>
              <span style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2))',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Tag size={12} />
                {classification.categoryName}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <span>Engine: <strong style={{ color: '#fff' }}>{selectedDocument.ocrEngineUsed}</strong></span>
              <span>Classification Confidence: <strong style={{ color: '#34d399' }}>{(classification.confidence * 100).toFixed(0)}%</strong></span>
              <span>Registered Agent: <strong style={{ color: '#c084fc' }}>{classification.registeredByAgent || 'Core Agent'}</strong></span>
            </div>
          </div>
        </div>

        {/* Subtab toggle */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveTabSub('parsed')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTabSub === 'parsed' ? '#0284c7' : 'transparent',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={14} /> Clinical Payload
          </button>

          <button
            onClick={() => setActiveTabSub('ocr')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTabSub === 'ocr' ? '#0284c7' : 'transparent',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Cpu size={14} /> Raw OCR Text
          </button>

          <button
            onClick={() => setActiveTabSub('json')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeTabSub === 'json' ? '#0284c7' : 'transparent',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Code size={14} /> JSON Schema
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left Column: Classification Signals & OCR Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Classification Reasoning Box */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
              <Cpu size={16} />
              Classifier Decision Signals & Matching Vocabulary
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {classification.matchingSignals.map((signal, idx) => (
                <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '3px solid #06b6d4' }}>
                  <CheckCircle2 size={14} color="#06b6d4" />
                  <span>{signal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Raw OCR Text Viewer */}
          <div className="glass-card" style={{ padding: '20px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color="#a855f7" />
                Raw OCR Text Stream
              </h4>
              <div style={{ position: 'relative', width: '180px' }}>
                <input
                  type="text"
                  placeholder="Highlight term..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-color)',
                    padding: '4px 8px 4px 28px',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Search size={12} style={{ position: 'absolute', left: '8px', top: '8px', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <pre style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              lineHeight: '1.6',
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '16px',
              borderRadius: '10px',
              maxHeight: '480px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              border: '1px solid var(--border-color)',
              color: '#d1d5db'
            }}>
              {selectedDocument.rawOcrText}
            </pre>
          </div>
        </div>

        {/* Right Column: Clinical Structured Payload */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activeTabSub === 'parsed' && (
            <>
              {/* Demographics & Clinical Summary */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} />
                  Extracted Demographics & Summary
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>PATIENT</span>
                    <strong style={{ fontSize: '14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={14} color="#06b6d4" />
                      {payload.patientName || 'Alex Morgan'}
                    </strong>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>DOCUMENT DATE</span>
                    <strong style={{ fontSize: '14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="#8b5cf6" />
                      {payload.documentDate || selectedDocument.uploadTimestamp.substring(0, 10)}
                    </strong>
                  </div>
                </div>

                <div style={{ background: 'rgba(6, 182, 212, 0.06)', borderLeft: '4px solid #06b6d4', padding: '12px', borderRadius: '6px', fontSize: '13.5px', lineHeight: '1.5' }}>
                  <strong>Clinical Overview:</strong> {payload.summary}
                </div>
              </div>

              {/* Extracted Biomarker Observations */}
              {payload.biomarkers.length > 0 && (
                <div className="glass-card" style={{ padding: '20px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={16} />
                    Extracted Biomarker Observations ({payload.biomarkers.length})
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {payload.biomarkers.map((bio) => {
                      const isHigh = bio.status === 'HIGH' || bio.status === 'CRITICAL';
                      const isLow = bio.status === 'LOW';
                      return (
                        <div
                          key={bio.id}
                          style={{
                            background: isHigh ? 'rgba(244, 63, 94, 0.08)' : isLow ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                            border: `1px solid ${isHigh ? 'rgba(244, 63, 94, 0.3)' : isLow ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                            padding: '12px 16px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '14px', color: '#fff' }}>
                              {bio.canonicalName}
                              {bio.loincCode && <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>LOINC: {bio.loincCode}</span>}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              Reference Range: {bio.refRangeText || `${bio.refRangeMin}-${bio.refRangeMax} ${bio.unit}`}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '18px', fontWeight: 700, color: isHigh ? '#f43f5e' : isLow ? '#fbbf24' : '#34d399' }}>
                              {bio.value} <span style={{ fontSize: '12px', fontWeight: 500 }}>{bio.unit}</span>
                            </div>
                            <span style={{
                              background: isHigh ? '#f43f5e' : isLow ? '#f59e0b' : '#10b981',
                              color: '#fff',
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '10px',
                              textTransform: 'uppercase'
                            }}>
                              {bio.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Extracted Medications */}
              {payload.medications.length > 0 && (
                <div className="glass-card" style={{ padding: '20px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Pill size={16} />
                    Extracted Medications ({payload.medications.length})
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {payload.medications.map((med) => (
                      <div key={med.id} style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '12px', borderRadius: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <strong style={{ color: '#34d399', fontSize: '14px' }}>{med.drugName} ({med.dosage})</strong>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{med.startDate ? `Started: ${med.startDate}` : ''}</span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>SIG: {med.frequency}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTabSub === 'json' && (
            <div className="glass-card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
                <Code size={16} />
                Extracted Medical Payload JSON
              </h4>
              <pre style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                background: 'rgba(0,0,0,0.5)',
                padding: '16px',
                borderRadius: '10px',
                overflowX: 'auto',
                border: '1px solid var(--border-color)',
                color: '#34d399'
              }}>
                {JSON.stringify(selectedDocument.extractedPayload, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
