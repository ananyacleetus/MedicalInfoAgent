import React, { useRef } from 'react';
import { useMedicalData } from '../context/MedicalDataContext';
import { 
  UploadCloud, 
  FileText, 
  Zap, 
  ShieldCheck, 
  Sparkles,
  FileScan,
  Pill,
  TestTube,
  UserPlus
} from 'lucide-react';

export const DocumentUploader: React.FC = () => {
  const { uploadFiles, isProcessing, processingProgress, loadSampleDataset, setActiveTab } = useMedicalData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      uploadFiles(filesArray);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      uploadFiles(filesArray);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px 40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
          Ingest & Classify <span className="gradient-text">Medical Documents</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '640px', margin: '0 auto' }}>
          Upload PDFs, medical imaging scans, or clinical notes. Our Agent runs in-browser OCR, extracts clinical entities, and classifies into medical document categories.
        </p>
      </div>

      {/* Drag & Drop Card */}
      <div
        className="glass-card glow-cyan"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed var(--accent-cyan)',
          padding: '48px 32px',
          textAlign: 'center',
          cursor: 'pointer',
          borderRadius: '20px',
          background: 'rgba(6, 182, 212, 0.03)',
          marginBottom: '32px',
          transition: 'all 0.2s ease'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.txt,.md"
          style={{ display: 'none' }}
        />

        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(6, 182, 212, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          color: 'var(--accent-cyan)'
        }}>
          <UploadCloud size={36} />
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
          Drop Medical Documents Here or Click to Browse
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
          Supports PDF (digital & scan), PNG, JPG, JPEG, TXT medical files up to 25MB
        </p>

        <div style={{ display: 'inline-flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', background: 'rgba(255, 255, 255, 0.05)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <FileText size={14} color="#06b6d4" /> Vector & Scanned PDFs
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', background: 'rgba(255, 255, 255, 0.05)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <Zap size={14} color="#8b5cf6" /> Tesseract WASM OCR
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', background: 'rgba(255, 255, 255, 0.05)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <ShieldCheck size={14} color="#10b981" /> 100% In-Browser Privacy
          </span>
        </div>

        {isProcessing && (
          <div style={{ marginTop: '24px', background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '12px', border: '1px solid #06b6d4' }}>
            <div className="pulse-glow" style={{ color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Sparkles size={18} />
              {processingProgress || 'Running OCR & Classification Agent...'}
            </div>
          </div>
        )}
      </div>

      {/* Quick Demo Pre-loaded Samples */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#f59e0b" />
            Quick Demo Samples (Pre-configured for Instant Testing)
          </h4>
          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={loadSampleDataset}>
            Reload All Samples
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div
            onClick={() => { loadSampleDataset(); setActiveTab('viewer'); }}
            style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '14px', borderRadius: '12px', cursor: 'pointer', transition: 'transform 0.15s ease' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#c084fc', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
              <TestTube size={18} />
              Lab Result (CBC / CMP)
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Extracts Glucose, HbA1c, Cholesterol observations</p>
          </div>

          <div
            onClick={() => { loadSampleDataset(); setActiveTab('viewer'); }}
            style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '14px', borderRadius: '12px', cursor: 'pointer', transition: 'transform 0.15s ease' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#34d399', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
              <Pill size={18} />
              Prescription Order
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Extracts Metformin 500mg, Rx dosage & SIG instructions</p>
          </div>

          <div
            onClick={() => { loadSampleDataset(); setActiveTab('viewer'); }}
            style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '14px', borderRadius: '12px', cursor: 'pointer', transition: 'transform 0.15s ease' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#38bdf8', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
              <FileScan size={18} />
              Radiology X-Ray
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Classifies Imaging Result and parses Impression notes</p>
          </div>

          <div
            onClick={() => { loadSampleDataset(); setActiveTab('viewer'); }}
            style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '14px', borderRadius: '12px', cursor: 'pointer', transition: 'transform 0.15s ease' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fbbf24', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
              <UserPlus size={18} />
              Specialist Referral
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Outbound referral to Endocrinology clinic</p>
          </div>
        </div>
      </div>
    </div>
  );
};
