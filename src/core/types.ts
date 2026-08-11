export type StandardMedicalCategory =
  | 'Imaging Result'
  | 'Prescription'
  | 'Lab Result'
  | 'Referral'
  | 'Visit Summary'
  | 'Lab Order'
  | 'Imaging Order'
  | string; // Extensible for custom document classes registered by future agents

export interface BiomarkerObservation {
  id: string;
  canonicalName: string; // e.g. "Glucose", "HbA1c", "Total Cholesterol", "Hemoglobin", "WBC"
  loincCode?: string;     // e.g. "2345-7" for Glucose
  value: number;
  unit: string;          // e.g. "mg/dL", "%", "g/dL"
  refRangeMin?: number;
  refRangeMax?: number;
  refRangeText?: string; // e.g. "70-99 mg/dL"
  status: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';
  timestamp: string;     // ISO Date string
  sourceDocId: string;
  sourceDocName: string;
  category: string;
}

export interface MedicationEntry {
  id: string;
  drugName: string;     // e.g. "Amoxicillin", "Lisinopril"
  dosage: string;       // e.g. "500 mg"
  frequency: string;    // e.g. "Twice daily"
  route?: string;       // e.g. "Oral"
  refills?: number;
  prescriber?: string;
  startDate?: string;
  sourceDocId: string;
  sourceDocName: string;
}

export interface ClinicalFinding {
  id: string;
  heading: string;      // e.g. "Impression", "Diagnosis", "Recommendation"
  text: string;
  severity?: 'normal' | 'info' | 'warning' | 'urgent';
}

export interface ExtractedMedicalPayload {
  patientName?: string;
  dob?: string;
  providerName?: string;
  facilityName?: string;
  documentDate?: string;
  summary: string;
  biomarkers: BiomarkerObservation[];
  medications: MedicationEntry[];
  findings: ClinicalFinding[];
  rawEntities: Record<string, string>;
  confidenceScore: number; // 0.0 to 1.0
}

export interface ClassificationResult {
  classId: string;
  categoryName: StandardMedicalCategory;
  confidence: number;
  matchingSignals: string[];
  registeredByAgent?: string;
}

export interface ProcessedDocument {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  uploadTimestamp: string;
  rawOcrText: string;
  ocrEngineUsed: 'pdfjs-native' | 'tesseract-wasm' | 'simulated-ocr';
  classification: ClassificationResult;
  extractedPayload: ExtractedMedicalPayload;
  documentUrl?: string;
}

export abstract class BaseMedicalDocumentClass {
  abstract readonly classId: string;
  abstract readonly displayName: StandardMedicalCategory;
  abstract readonly description: string;
  abstract readonly iconName: string;
  abstract readonly colorAccent: string; // CSS color string or tailwind/hex
  abstract readonly categoryGroup: 'Diagnostic' | 'Therapeutic' | 'Administrative' | 'Order' | 'Clinical Notes' | 'Custom';
  abstract readonly defaultRegisteredAgent: string;

  /**
   * Evaluates document text and returns match confidence between 0.0 and 1.0
   */
  abstract evaluateMatch(ocrText: string, metadata?: Record<string, any>): {
    confidence: number;
    matchingSignals: string[];
  };

  /**
   * Extracts structured clinical entities (biomarkers, meds, findings) specific to this document type
   */
  abstract parsePayload(ocrText: string, docId: string, docName: string): ExtractedMedicalPayload;
}
