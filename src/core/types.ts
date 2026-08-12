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
  genericName?: string;
  brandName?: string;
  dosage: string;       // e.g. "500 mg"
  frequency: string;    // e.g. "Twice daily"
  route?: string;       // e.g. "Oral"
  refills?: number;
  prescriber?: string;
  startDate?: string;
  discontinuedDate?: string;
  status?: 'ACTIVE' | 'MODIFIED' | 'DISCONTINUED';
  sourceDocId: string;
  sourceDocName: string;
}

export interface MedicationChangeRecord {
  id: string;
  drugName: string;
  changeType: 'DOSAGE_INCREASE' | 'DOSAGE_DECREASE' | 'FREQUENCY_CHANGE' | 'NEW_MEDICATION' | 'DISCONTINUED';
  previousValue: string;
  newValue: string;
  date: string;
  sourceDocId: string;
  sourceDocName: string;
  description: string;
}

export interface DuplicateMedicationAlert {
  id: string;
  drugName: string;
  matchType: 'EXACT_DUPLICATE' | 'GENERIC_BRAND_DUPLICATE' | 'SAME_CLASS_DUPLICATE';
  entries: MedicationEntry[];
  riskSeverity: 'WARNING' | 'HIGH';
  description: string;
}

export interface DrugInteractionAlert {
  id: string;
  drugA: string;
  drugB: string;
  severity: 'CRITICAL' | 'WARNING' | 'MODERATE' | 'INFO';
  mechanism: string;
  clinicalImpact: string;
  recommendation: string;
  sourceEntries: MedicationEntry[];
}

export interface MedicationAgentAnalysis {
  analyzedAt: string;
  activeMedications: MedicationEntry[];
  totalMedicationsCount: number;
  changesTracked: MedicationChangeRecord[];
  duplicateAlerts: DuplicateMedicationAlert[];
  interactionAlerts: DrugInteractionAlert[];
  overallSafetyScore: number; // 0 to 100
}

export type TimelineCategory = 'Medications' | 'Lab Results' | 'Imaging Scans' | 'Referrals' | 'Clinical Visits' | 'Orders' | 'General';
export type TimelineSeverity = 'normal' | 'info' | 'warning' | 'critical';

export interface TimelineEvent {
  id: string;
  timestamp: string; // ISO string YYYY-MM-DD
  eventType: 'MEDICATION_STARTED' | 'MEDICATION_MODIFIED' | 'LAB_RESULT' | 'IMAGING_RESULT' | 'REFERRAL' | 'VISIT_SUMMARY' | 'ORDER_PLACED' | 'DOCUMENT_UPLOAD';
  category: TimelineCategory;
  title: string;
  subtitle: string;
  details?: string;
  severity: TimelineSeverity;
  sourceDocId: string;
  sourceDocName: string;
  providerName?: string;
  facilityName?: string;
  tags?: string[];
  colorAccent: string;
  iconName: string;
}

export interface PatientTimelineSummary {
  patientName: string;
  earliestDate: string;
  latestDate: string;
  totalEventsCount: number;
  categoryBreakdown: Record<TimelineCategory, number>;
  activeSafetyAlertsCount: number;
}

export interface TimelineFilterOptions {
  category?: TimelineCategory | 'ALL';
  severity?: TimelineSeverity | 'ALL';
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
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
  abstract evaluateMatch(ocrText: string, metadata?: Record<string, unknown>): {
    confidence: number;
    matchingSignals: string[];
  };

  /**
   * Extracts structured clinical entities (biomarkers, meds, findings) specific to this document type
   */
  abstract parsePayload(ocrText: string, docId: string, docName: string): ExtractedMedicalPayload;
}
