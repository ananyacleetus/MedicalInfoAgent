import React, { useState } from 'react';
import { MedicalDataBridge } from '../core/MedicalDataBridge';
import {
  Mail,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  ExternalLink,
  Paperclip,
  Check,
  RotateCcw,
  Sparkles,
  Key,
  X
} from 'lucide-react';
import { SourceTrustWeightConfig } from '../core/types';

export const EmailDashboard: React.FC = () => {
  const bridge = MedicalDataBridge.getInstance();
  const [analysis, setAnalysis] = useState(() => bridge.getEmailAgentAnalysis());
  const [trustWeights, setTrustWeights] = useState<SourceTrustWeightConfig[]>(() => bridge.getSourceTrustWeights());

  const [connectingAccount, setConnectingAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<'STREAM' | 'CLAIMS' | 'SETTINGS' | 'DEDUPLICATION'>('STREAM');

  const refreshState = () => {
    setAnalysis(bridge.getEmailAgentAnalysis());
    setTrustWeights(bridge.getSourceTrustWeights());
  };

  const handleConnectOAuth = async () => {
    if (!connectingAccount) return;
    setIsConnecting(true);
    await bridge.connectEmailAccount(connectingAccount, 'GMAIL_OAUTH');
    setIsConnecting(false);
    setConnectingAccount(null);
    refreshState();
  };

  const handleScanInbox = async () => {
    setIsScanning(true);
    await bridge.scanEmailInbox();
    setIsScanning(false);
    refreshState();
  };

  const handleTrustWeightChange = (provenanceType: string, newScore: number) => {
    const updated = trustWeights.map(w => {
      if (w.provenanceType === provenanceType) {
        return { ...w, userScore: newScore };
      }
      return w;
    });
    setTrustWeights(updated);
    bridge.updateSourceTrustWeights(updated);
  };

  const handleResetDefaults = () => {
    bridge.resetSourceTrustWeights();
    setTrustWeights(bridge.getSourceTrustWeights());
  };

  const deduplicatedMeds = bridge.getAllMedicationsDeduplicated();
  const deduplicatedLabs = bridge.getAllBiomarkersDeduplicated();

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', padding: '0 24px 48px 24px' }}>
      
      {/* ── Header ── */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Mail size={28} color="#10b981" />
            Email & Insurance Claim <span className="gradient-text">Intelligence Agent</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Automated inbox scanner for 3rd party lab reports, insurance claims (EOBs), clinical portal alerts, and multi-source veracity deduplication.
          </p>
        </div>

        <button
          onClick={handleScanInbox}
          disabled={isScanning}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, #10b981, #0284c7)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <RefreshCw size={16} className={isScanning ? 'spin' : ''} />
          {isScanning ? 'Scanning Connected Inboxes...' : 'Scan Inbox Now'}
        </button>
      </div>

      {/* ── Metric Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', padding: '12px', borderRadius: '12px' }}>
            <Mail size={22} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981', lineHeight: 1 }}>
              {analysis.healthEmailsIdentified}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Identified Health Emails
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.12)', padding: '12px', borderRadius: '12px' }}>
            <ShieldAlert size={22} color="#38bdf8" />
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#38bdf8', lineHeight: 1 }}>
              {analysis.insuranceClaimsParsed}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Insurance Claims (EOBs) Parsed
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(167, 139, 250, 0.12)', padding: '12px', borderRadius: '12px' }}>
            <Sparkles size={22} color="#a78bfa" />
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#a78bfa', lineHeight: 1 }}>
              {analysis.deduplicatedRecordsCount}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Multi-Source Deduplicated Records
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(251, 146, 60, 0.12)', padding: '12px', borderRadius: '12px' }}>
            <SlidersHorizontal size={22} color="#fb923c" />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#fb923c', lineHeight: 1 }}>
              Customizable
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Source Veracity Ranking Manager
            </div>
          </div>
        </div>
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('STREAM')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'STREAM' ? '#10b981' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Mail size={16} /> Health Emails Stream ({analysis.scannedMessages.length})
        </button>

        <button
          onClick={() => setActiveTab('CLAIMS')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'CLAIMS' ? '#10b981' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ShieldAlert size={16} /> Insurance Claims EOB ({analysis.claims.length})
        </button>

        <button
          onClick={() => setActiveTab('DEDUPLICATION')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'DEDUPLICATION' ? '#10b981' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Sparkles size={16} /> Multi-Source Collation & Deduplication
        </button>

        <button
          onClick={() => setActiveTab('SETTINGS')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'SETTINGS' ? '#10b981' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Sliders size={16} /> Source Veracity Ranking Manager
        </button>
      </div>

      {/* ── Tab 1: Health Emails Stream ── */}
      {activeTab === 'STREAM' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Connected Email Provider Bar */}
          <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(16,185,129,0.15)', padding: '8px', borderRadius: '8px' }}>
                <CheckCircle2 size={20} color="#10b981" />
              </div>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                  Connected Email: alex.morgan.patient@gmail.com
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>
                  Provider: Gmail OAuth2 API | Status: Active & Synced
                </span>
              </div>
            </div>

            <button
              onClick={() => setConnectingAccount('alex.morgan.work@outlook.com')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              + Connect Another Mailbox
            </button>
          </div>

          {/* Email Cards Stream */}
          {analysis.scannedMessages.map(msg => (
            <div key={msg.id} className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '12px'
                    }}>
                      {msg.provenanceTag}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      From: <strong>{msg.senderEmail}</strong>
                    </span>
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0 }}>
                    {msg.subject}
                  </h4>
                </div>

                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {msg.receivedDate.substring(0, 10)}
                </span>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
                {msg.snippet}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {msg.hasAttachment && (
                    <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Paperclip size={14} /> Attachment: {msg.attachmentName}
                    </span>
                  )}
                  {msg.portalLinkUrl && (
                    <a href={msg.portalLinkUrl} target="_blank" rel="noreferrer" style={{ color: '#a78bfa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ExternalLink size={14} /> Access Patient Portal
                    </a>
                  )}
                </div>

                <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 600 }}>
                  ✓ Extracted {msg.parsedRecordCount} Clinical Entities into Data Bridge
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tab 2: Insurance Claims (EOBs) ── */}
      {activeTab === 'CLAIMS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {analysis.claims.map(claim => (
            <div key={claim.claimId} className="glass-card" style={{ padding: '24px', borderLeft: '4px solid #38bdf8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
                      {claim.insuranceCarrier} — Explanation of Benefits (EOB)
                    </h3>
                    <span style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
                      Claim #{claim.claimNumber}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Service Date: <strong>{claim.serviceDate}</strong> | Rendering Provider: <strong>{claim.renderingProvider}</strong> ({claim.facilityName})
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#34d399' }}>
                    ${claim.planPaid.toFixed(2)} <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>Paid by Plan</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#fb923c' }}>
                    Patient Responsibility: ${claim.patientResponsibility.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Claims Data Grid: Diagnoses, CPT Procedures, Prescriptions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
                
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#a78bfa', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Covered ICD-10 Diagnoses
                  </h4>
                  <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {claim.diagnosesICD.map(dx => (
                      <li key={dx.code} style={{ marginBottom: '4px' }}>
                        <strong style={{ color: '#fff' }}>[{dx.code}]</strong> {dx.display}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Procedures & CPT Codes
                  </h4>
                  <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {claim.proceduresCPT.map(cpt => (
                      <li key={cpt.code} style={{ marginBottom: '4px' }}>
                        <strong style={{ color: '#fff' }}>[{cpt.code}]</strong> {cpt.display} (${cpt.amountBilled.toFixed(2)})
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#34d399', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Medication Claims Filled
                  </h4>
                  <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {claim.medicationsClaimed.map((med, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>
                        <strong style={{ color: '#fff' }}>{med.drugName} {med.dosage}</strong> (Filled: {med.dateFilled})
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tab 3: Multi-Source Collation & Deduplication Inspector ── */}
      {activeTab === 'DEDUPLICATION' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} />
            Multi-Source Deduplicated Clinical Entities
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Clinical items merged across MyChart EHR, Quest/LabCorp Emails, Anthem Insurance Claims, and Apple Health into single canonical records with multi-source attribution.
          </p>

          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
            Deduplicated Medication Records ({deduplicatedMeds.length})
          </h4>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '28px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Medication Name</th>
                <th style={{ padding: '10px' }}>Dosage & Route</th>
                <th style={{ padding: '10px' }}>Combined Confirming Sources (`sourcesList`)</th>
                <th style={{ padding: '10px' }}>Veracity Score</th>
              </tr>
            </thead>
            <tbody>
              {deduplicatedMeds.map(med => (
                <tr key={med.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 700, color: '#fff' }}>{med.drugName}</td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>{med.dosage} ({med.frequency})</td>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {med.provenance?.sourcesList?.map((src, i) => (
                        <span key={i} style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
                          {src}
                        </span>
                      )) || <span style={{ color: 'var(--text-muted)' }}>File OCR Upload</span>}
                    </div>
                  </td>
                  <td style={{ padding: '12px 10px', color: '#34d399', fontWeight: 700 }}>
                    {((med.provenance?.sourceTrustScore || 0.95) * 100).toFixed(0)}% Trust Rating
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
            Deduplicated Lab Biomarker Observations ({deduplicatedLabs.length})
          </h4>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Biomarker</th>
                <th style={{ padding: '10px' }}>Result Value</th>
                <th style={{ padding: '10px' }}>Date</th>
                <th style={{ padding: '10px' }}>Confirming Sources (`sourcesList`)</th>
              </tr>
            </thead>
            <tbody>
              {deduplicatedLabs.map(bio => (
                <tr key={bio.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 700, color: '#fff' }}>{bio.canonicalName}</td>
                  <td style={{ padding: '12px 10px', color: '#38bdf8', fontWeight: 700 }}>{bio.value} {bio.unit}</td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>{bio.timestamp.substring(0, 10)}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {bio.provenance?.sourcesList?.map((src, i) => (
                        <span key={i} style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
                          {src}
                        </span>
                      )) || <span style={{ color: 'var(--text-muted)' }}>File OCR Upload</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tab 4: User-Customizable Source Veracity Ranking Manager ── */}
      {activeTab === 'SETTINGS' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#fb923c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={20} /> User-Customizable Source Veracity Ranking Manager
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Adjust trust weight sliders (0.50 to 1.00) or re-rank source channels to customize how veracity and deduplication primary entries are determined.
              </p>
            </div>

            <button
              onClick={handleResetDefaults}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RotateCcw size={14} /> Reset System Defaults
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {trustWeights.map(cfg => (
              <div key={cfg.provenanceType} style={{ background: 'rgba(0,0,0,0.2)', padding: '16px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ flex: 1, paddingRight: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                      {cfg.displayName}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      ({cfg.provenanceType})
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    System Default Trust Score: <strong>{(cfg.defaultScore * 100).toFixed(0)}%</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '280px' }}>
                  <input
                    type="range"
                    min="0.50"
                    max="1.00"
                    step="0.01"
                    value={cfg.userScore}
                    onChange={(e) => handleTrustWeightChange(cfg.provenanceType, parseFloat(e.target.value))}
                    style={{ flex: 1, accentColor: '#10b981', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#10b981', width: '48px', textAlign: 'right' }}>
                    {(cfg.userScore * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Simulated OAuth Modal ── */}
      {connectingAccount && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '28px', position: 'relative' }}>
            
            <button
              onClick={() => setConnectingAccount(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(16,185,129,0.15)', padding: '10px', borderRadius: '12px' }}>
                <Key size={24} color="#10b981" />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                  OAuth2 Mailbox Authorization
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Secure Read-Only Health Email Scanning
                </span>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Authorize MedicalInfoAgent read-only access to scan health notices and insurance claims from <strong>{connectingAccount}</strong>.
            </div>

            <button
              onClick={handleConnectOAuth}
              disabled={isConnecting}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981, #0284c7)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Check size={18} />
              {isConnecting ? 'Authenticating & Scanning...' : 'Authorize OAuth2 Account Access'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
