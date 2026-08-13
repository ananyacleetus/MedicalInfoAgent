import React, { useState, useMemo } from 'react';
import { MedicalDataBridge } from '../core/MedicalDataBridge';
import {
  Network,
  Building2,
  Server,
  Activity,
  Layers,
  Smartphone,
  Cpu,
  Globe,
  CheckCircle,
  RefreshCw,
  Key,
  ShieldCheck,
  Zap,
  ArrowRight,
  Database,
  Code2,
  Lock,
  FileCode,
  X
} from 'lucide-react';
import { EHRProviderSystem, EHRConnectionConfig } from '../core/types';
import {
  MOCK_EPIC_FHIR_R4_BUNDLE,
  MOCK_APPLE_HEALTHKIT_JSON
} from '../services/sampleEHRData';

export const EHRIntegrationDashboard: React.FC = () => {
  const bridge = MedicalDataBridge.getInstance();
  const [analysis, setAnalysis] = useState(() => bridge.getEHRAgentAnalysis());

  const [connectingProvider, setConnectingProvider] = useState<EHRProviderSystem | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStep, setAuthStep] = useState<'INIT' | 'PKCE' | 'TOKEN' | 'COMPLETE'>('INIT');
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const [selectedRawView, setSelectedRawView] = useState<'EPIC_FHIR' | 'APPLE_HEALTH'>('EPIC_FHIR');

  const refreshState = () => {
    setAnalysis(bridge.getEHRAgentAnalysis());
  };

  const handleConnectClick = (system: EHRProviderSystem) => {
    setConnectingProvider(system);
    setAuthStep('INIT');
  };

  const handleStartOAuthHandshake = async () => {
    if (!connectingProvider) return;
    setIsAuthenticating(true);

    // Step 1: PKCE Challenge
    setAuthStep('PKCE');
    await new Promise(r => setTimeout(r, 600));

    // Step 2: Token Exchange
    setAuthStep('TOKEN');
    await new Promise(r => setTimeout(r, 700));

    // Step 3: Complete & Sync
    await bridge.connectEHRProvider(connectingProvider);
    setAuthStep('COMPLETE');
    await new Promise(r => setTimeout(r, 500));

    setIsAuthenticating(false);
    setConnectingProvider(null);
    refreshState();
  };

  const handleSyncClick = async (connId: string) => {
    setSyncingId(connId);
    await bridge.syncEHRProvider(connId);
    setSyncingId(null);
    refreshState();
  };

  const activeConnMap = useMemo(() => {
    const map = new Map<string, EHRConnectionConfig>();
    analysis.connections.forEach(c => map.set(c.providerType, c));
    return map;
  }, [analysis]);

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', padding: '0 24px 48px 24px' }}>
      
      {/* ── Header ── */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Network size={28} color="#38bdf8" />
          EHR & Health System <span className="gradient-text">Integration Agent</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          SMART on FHIR R4 connector, patient portal OAuth2 bridge, and mobile HealthKit / Health Connect data mapper.
        </p>
      </div>

      {/* ── Summary Stats Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.12)', padding: '12px', borderRadius: '12px' }}>
            <Building2 size={22} color="#38bdf8" />
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#38bdf8', lineHeight: 1 }}>
              {analysis.activeConnectionsCount}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Active EHR Connections
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(52, 211, 153, 0.12)', padding: '12px', borderRadius: '12px' }}>
            <Database size={22} color="#34d399" />
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#34d399', lineHeight: 1 }}>
              {analysis.totalSyncedRecords}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Total Synced EHR Records
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(167, 139, 250, 0.12)', padding: '12px', borderRadius: '12px' }}>
            <ShieldCheck size={22} color="#a78bfa" />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#a78bfa', lineHeight: 1 }}>
              SMART / OAuth2
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              PKCE Security Architecture
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(251, 146, 60, 0.12)', padding: '12px', borderRadius: '12px' }}>
            <FileCode size={22} color="#fb923c" />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#fb923c', lineHeight: 1 }}>
              FHIR R4 Standard
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Resource Normalizer
            </div>
          </div>
        </div>
      </div>

      {/* ── Active Connections Section ── */}
      <div style={{ marginBottom: '36px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={20} color="#34d399" />
          Active Health System Integrations ({analysis.connections.length})
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {analysis.connections.map(conn => (
            <div key={conn.id} className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #34d399' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '16px', color: '#fff' }}>
                      {conn.systemName}
                    </span>
                    <span style={{
                      background: 'rgba(52, 211, 153, 0.15)',
                      color: '#34d399',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
                      {conn.status}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Protocol: {conn.authProtocol.replace(/_/g, ' ')}
                  </span>
                </div>

                <button
                  onClick={() => handleSyncClick(conn.id)}
                  disabled={syncingId === conn.id}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0284c7, #6366f1)',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={13} className={syncingId === conn.id ? 'spin' : ''} />
                  {syncingId === conn.id ? 'Syncing...' : 'Sync Now'}
                </button>
              </div>

              {conn.fhirBaseUrl && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '6px', marginBottom: '10px' }}>
                  {conn.fhirBaseUrl}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span>Last Synced: <strong>{conn.lastSyncedAt?.substring(0, 16).replace('T', ' ')}</strong></span>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>{conn.recordsSyncedCount} Records Synced</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── EHR & Personal Health Provider Catalog Grid ── */}
      <div style={{ marginBottom: '36px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={20} color="#38bdf8" />
          Connect EHR Portal or Mobile Health Source
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {analysis.availableProviders.map(provider => {
            const activeConn = activeConnMap.get(provider.system);
            const isConnected = activeConn?.status === 'CONNECTED';

            return (
              <div
                key={provider.system}
                className="glass-card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isConnected ? '1.5px solid #34d399' : '1px solid var(--border-color)',
                  position: 'relative'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ background: `${provider.logoColor}18`, padding: '10px', borderRadius: '10px' }}>
                      {provider.system.includes('EPIC') && <Building2 size={20} color={provider.logoColor} />}
                      {provider.system.includes('CERNER') && <Server size={20} color={provider.logoColor} />}
                      {provider.system.includes('ATHENA') && <Activity size={20} color={provider.logoColor} />}
                      {provider.system.includes('ECLINICAL') && <Layers size={20} color={provider.logoColor} />}
                      {provider.system.includes('APPLE') && <Smartphone size={20} color={provider.logoColor} />}
                      {provider.system.includes('ANDROID') && <Cpu size={20} color={provider.logoColor} />}
                      {provider.system.includes('FOLLOW') && <Globe size={20} color={provider.logoColor} />}
                      {provider.system.includes('GENERIC') && <Network size={20} color={provider.logoColor} />}
                    </div>

                    {isConnected && (
                      <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={13} /> Active
                      </span>
                    )}
                  </div>

                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                    {provider.name}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '14px' }}>
                    {provider.description}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
                    Auth: {provider.authProtocol.replace(/_/g, ' ')}
                  </span>
                  <button
                    onClick={() => handleConnectClick(provider.system)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isConnected ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #0284c7, #6366f1)',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    {isConnected ? 'Reconnect / Re-auth' : 'Connect System'}
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Interactive Raw Payload Mapper & Inspection ── */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
              <Code2 size={20} />
              Live FHIR R4 & HealthKit Transformation Engine Inspector
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Compare raw incoming health system schemas side-by-side with MedicalInfoAgent normalized internal models.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setSelectedRawView('EPIC_FHIR')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: selectedRawView === 'EPIC_FHIR' ? '#0284c7' : 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Epic FHIR R4 Bundle
            </button>
            <button
              onClick={() => setSelectedRawView('APPLE_HEALTH')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: selectedRawView === 'APPLE_HEALTH' ? '#0284c7' : 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Apple HealthKit JSON
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Raw Payload Column */}
          <div style={{ background: '#090d16', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#a78bfa', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileCode size={14} /> Incoming Raw EHR Stream ({selectedRawView === 'EPIC_FHIR' ? 'FHIR R4 JSON' : 'HealthKit JSON'})
            </div>
            <pre style={{ fontSize: '11px', color: '#38bdf8', overflowX: 'auto', maxHeight: '300px', margin: 0, fontFamily: 'monospace' }}>
              {JSON.stringify(selectedRawView === 'EPIC_FHIR' ? MOCK_EPIC_FHIR_R4_BUNDLE : MOCK_APPLE_HEALTHKIT_JSON, null, 2)}
            </pre>
          </div>

          {/* Standardized Output Column */}
          <div style={{ background: '#090d16', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#34d399', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} /> Normalized MedicalInfoAgent Output Model
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
              {selectedRawView === 'EPIC_FHIR' ? (
                <>
                  <div style={{ background: 'rgba(52,211,153,0.08)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #34d399' }}>
                    <strong style={{ color: '#fff' }}>DiagnosisEntry Extracted:</strong> Type 2 Diabetes Mellitus (ICD-10: E11.9)
                  </div>
                  <div style={{ background: 'rgba(56,189,248,0.08)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #38bdf8' }}>
                    <strong style={{ color: '#fff' }}>MedicationEntry Extracted:</strong> Metformin HCl 1000 mg Oral Tablet (Twice Daily)
                  </div>
                  <div style={{ background: 'rgba(167,139,250,0.08)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #a78bfa' }}>
                    <strong style={{ color: '#fff' }}>BiomarkerObservations Extracted:</strong> Fasting Glucose: 94 mg/dL | HbA1c: 5.5%
                  </div>
                </>
              ) : (
                <>
                  <div style={{ background: 'rgba(56,189,248,0.08)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #38bdf8' }}>
                    <strong style={{ color: '#fff' }}>BiomarkerObservation Extracted:</strong> Glucose: 95 mg/dL (Source: Dexcom G7 CGM)
                  </div>
                  <div style={{ background: 'rgba(251,146,60,0.08)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #fb923c' }}>
                    <strong style={{ color: '#fff' }}>BiomarkerObservation Extracted:</strong> Heart Rate: 68 count/min (Source: Apple Watch)
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Simulated SMART on FHIR OAuth 2.0 PKCE Modal ── */}
      {connectingProvider && (
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
          <div className="glass-card" style={{ maxWidth: '520px', width: '100%', padding: '28px', position: 'relative' }}>
            
            <button
              onClick={() => setConnectingProvider(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(56,189,248,0.15)', padding: '10px', borderRadius: '12px' }}>
                <Lock size={24} color="#38bdf8" />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                  SMART on FHIR OAuth 2.0 Handshake
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  PKCE Security Authorization Protocol
                </span>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>Target Provider: <strong style={{ color: '#fff' }}>{connectingProvider}</strong></div>
                <div>Grant Type: <span style={{ color: '#a78bfa', fontFamily: 'monospace' }}>authorization_code (PKCE)</span></div>
                <div>Scopes Granted: <span style={{ color: '#34d399', fontFamily: 'monospace' }}>patient/*.read launch/patient openid fhirUser</span></div>
                <div>Code Challenge Method: <span style={{ color: '#fb923c', fontFamily: 'monospace' }}>S256</span></div>
              </div>
            </div>

            {/* Handshake Progress Indicator */}
            {isAuthenticating && (
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 600, marginBottom: '8px' }}>
                  {authStep === 'PKCE' && 'Generating S256 PKCE Code Challenge...'}
                  {authStep === 'TOKEN' && 'Exchanging Auth Code for SMART Access Token...'}
                  {authStep === 'COMPLETE' && 'Access Token Verified! Syncing Health Records...'}
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #38bdf8, #34d399)',
                    width: authStep === 'PKCE' ? '35%' : authStep === 'TOKEN' ? '75%' : '100%',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>
            )}

            <button
              onClick={handleStartOAuthHandshake}
              disabled={isAuthenticating}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #0284c7, #6366f1)',
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
              <Key size={18} />
              {isAuthenticating ? 'Authenticating & Verifying...' : 'Authorize & Complete OAuth Handshake'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
