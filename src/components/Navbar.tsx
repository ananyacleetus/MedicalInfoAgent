import React from 'react';
import { useMedicalData, ActiveTab } from '../context/MedicalDataContext';
import { MedicalDataBridge } from '../core/MedicalDataBridge';
import { 
  FolderKanban, 
  Eye, 
  Blocks, 
  Network, 
  TrendingUp, 
  UploadCloud,
  Stethoscope,
  RotateCcw,
  Pill,
  CalendarClock
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, documents, loadSampleDataset } = useMedicalData();
  const bridge = MedicalDataBridge.getInstance();
  const medAnalysis = bridge.getMedicationAgentAnalysis();
  const medAlertCount = medAnalysis.interactionAlerts.length + medAnalysis.duplicateAlerts.length;
  const timelineEvents = bridge.getPatientTimeline();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'uploader', label: 'Document Ingestion', icon: <UploadCloud size={18} /> },
    { id: 'vault', label: 'Document Vault', icon: <FolderKanban size={18} />, badge: documents.length },
    { id: 'viewer', label: 'Document Inspector', icon: <Eye size={18} /> },
    { id: 'timeline', label: 'Patient Timeline', icon: <CalendarClock size={18} />, badge: timelineEvents.length },
    { id: 'medications', label: 'Medication Safety', icon: <Pill size={18} />, badge: medAlertCount },
    { id: 'trends', label: 'Biomarker Trends', icon: <TrendingUp size={18} /> },
    { id: 'bridge', label: 'Insights Data Bridge', icon: <Network size={18} /> },
    { id: 'registry', label: 'Class Registry', icon: <Blocks size={18} /> },
  ];

  return (
    <header className="glass-card" style={{ borderRadius: '0 0 16px 16px', padding: '16px 32px', marginBottom: '24px', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('uploader')}>
          <div style={{
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
          }}>
            <Stethoscope size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>
              Medical<span className="gradient-text">InfoAgent</span>
            </h1>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
              Document Agent & OCR Classifier
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav style={{ display: 'flex', gap: '8px', background: 'rgba(0, 0, 0, 0.3)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))' : 'transparent',
                  color: isActive ? '#38bdf8' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.15s ease',
                  borderBottom: isActive ? '2px solid #38bdf8' : '2px solid transparent'
                }}
              >
                {item.icon}
                {item.label}
                {item.badge !== undefined && item.badge > 0 && (
                  <span style={{
                    background: isActive ? '#0284c7' : 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontWeight: 700
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick action buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={loadSampleDataset} title="Reload realistic sample medical dataset">
            <RotateCcw size={15} />
            <span>Demo Data</span>
          </button>
        </div>
      </div>
    </header>
  );
};
