import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProcessedDocument } from '../core/types';
import { MedicalDataBridge } from '../core/MedicalDataBridge';
import { SAMPLE_MEDICAL_DOCUMENTS } from '../services/sampleDocs';
import { processMedicalDocument } from '../services/documentProcessor';

export type ActiveTab = 'uploader' | 'vault' | 'viewer' | 'registry' | 'bridge' | 'trends' | 'medications' | 'timeline' | 'diagnoses' | 'ehr' | 'email' | 'ai-intelligence';

interface MedicalDataContextType {
  documents: ProcessedDocument[];
  selectedDocument: ProcessedDocument | null;
  setSelectedDocument: (doc: ProcessedDocument | null) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isProcessing: boolean;
  processingProgress: string;
  uploadFiles: (files: File[]) => Promise<void>;
  loadSampleDataset: () => void;
  clearDataset: () => void;
}

const MedicalDataContext = createContext<MedicalDataContextType | undefined>(undefined);

export const MedicalDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<ProcessedDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<ProcessedDocument | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('uploader');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<string>('');

  const bridge = MedicalDataBridge.getInstance();

  // Initialize with Sample dataset on first load
  useEffect(() => {
    loadSampleDataset();
  }, []);

  const loadSampleDataset = () => {
    SAMPLE_MEDICAL_DOCUMENTS.forEach(doc => bridge.ingestDocument(doc));
    const all = bridge.getAllDocuments();
    setDocuments(all);
    if (all.length > 0) {
      setSelectedDocument(all[0]);
    }
  };

  const clearDataset = () => {
    // Reset data
    setDocuments([]);
    setSelectedDocument(null);
  };

  const uploadFiles = async (files: File[]) => {
    setIsProcessing(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProcessingProgress(`Processing file ${i + 1} of ${files.length}: ${file.name}...`);
      try {
        const processed = await processMedicalDocument(file);
        setSelectedDocument(processed);
      } catch (err) {
        console.error('Error processing document:', err);
      }
    }
    const updated = bridge.getAllDocuments();
    setDocuments(updated);
    setIsProcessing(false);
    setProcessingProgress('');
    setActiveTab('viewer');
  };

  return (
    <MedicalDataContext.Provider
      value={{
        documents,
        selectedDocument,
        setSelectedDocument,
        activeTab,
        setActiveTab,
        isProcessing,
        processingProgress,
        uploadFiles,
        loadSampleDataset,
        clearDataset
      }}
    >
      {children}
    </MedicalDataContext.Provider>
  );
};

export const useMedicalData = () => {
  const context = useContext(MedicalDataContext);
  if (!context) {
    throw new Error('useMedicalData must be used within a MedicalDataProvider');
  }
  return context;
};
