import React, { useState } from 'react';
import { useMedicalData } from '../context/MedicalDataContext';
import { 
  FolderKanban, 
  Search, 
  Tag, 
  Calendar, 
  Cpu, 
  ChevronRight, 
  Trash2
} from 'lucide-react';

export const DocumentVault: React.FC = () => {
  const { documents, selectedDocument, setSelectedDocument, setActiveTab, clearDataset } = useMedicalData();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Imaging Result', 'Prescription', 'Lab Result', 'Referral', 'Visit Summary', 'Lab Order', 'Imaging Order'];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.rawOcrText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.extractedPayload.summary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || String(doc.classification.categoryName) === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', padding: '0 24px 40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>
            Medical Document <span className="gradient-text">Vault</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Organized medical records classified into diagnostic categories with extracted structured metadata.
          </p>
        </div>

        {documents.length > 0 && (
          <button className="btn-secondary" onClick={clearDataset} style={{ fontSize: '13px', color: '#f43f5e' }}>
            <Trash2 size={14} /> Clear Vault
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
          <input
            type="text"
            placeholder="Search documents by OCR text, filename, or summary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid var(--border-color)',
              padding: '10px 14px 10px 38px',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '14px'
            }}
          />
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {categories.map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  background: isActive ? 'linear-gradient(135deg, #0284c7, #6366f1)' : 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Document Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <FolderKanban size={48} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>No documents found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Try adjusting your search filter or upload new files.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredDocuments.map(doc => {
            const isSelected = selectedDocument?.id === doc.id;
            return (
              <div
                key={doc.id}
                className="glass-card"
                onClick={() => { setSelectedDocument(doc); setActiveTab('viewer'); }}
                style={{
                  padding: '20px',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid #38bdf8' : '1px solid var(--border-color)',
                  background: isSelected ? 'rgba(6, 182, 212, 0.08)' : 'var(--bg-card)',
                  transition: 'transform 0.15s ease, border-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{
                      background: 'rgba(6, 182, 212, 0.15)',
                      color: '#38bdf8',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Tag size={12} />
                      {doc.classification.categoryName}
                    </span>
                    <span style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}>
                      {doc.provenance?.provenanceSource || 'File OCR Upload'}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    {doc.uploadTimestamp.substring(0, 10)}
                  </span>
                </div>

                <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>
                  {doc.filename}
                </h4>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {doc.extractedPayload.summary}
                </p>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Cpu size={12} /> {(doc.classification.confidence * 100).toFixed(0)}% Match
                  </span>
                  <span style={{ color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                    Inspect <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
