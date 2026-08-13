export type StandardMedicalCategory =
  | 'Imaging Result'
  | 'Prescription'
  | 'Lab Result'
  | 'Referral'
  | 'Visit Summary'
  | 'Lab Order'
  | 'Imaging Order'
  | string; // Extensible for custom document classes registered by future agents

/* ─────────────────────────────────────────────────────────────
   Provenance & Multi-Source Veracity Types
   ───────────────────────────────────────────────────────────── */

export type ProvenanceType =
  | 'EMAIL_HEALTH_NOTIFICATION'
  | 'EMAIL_INSURANCE_CLAIM'
  | 'EHR_SMART_FHIR'
  | 'PERSONAL_HEALTH_APP'
  | 'MANUAL_OCR_UPLOAD';

export interface ProvenanceMetadata {
  provenanceSource: string;         // e.g. "Email Integration - Quest Diagnostics", "Email Integration - Anthem Blue Cross", "Email Integration"
  provenanceType: ProvenanceType;
  sourceTrustScore: number;         // 0.0 to 1.0
  sourcesList?: string[];           // List of all confirming sources after multi-source deduplication
  emailSender?: string;
  emailSubject?: string;
  emailReceivedDate?: string;
  portalMagicLink?: string;
}

export interface SourceTrustWeightConfig {
  provenanceType: ProvenanceType;
  displayName: string;
  defaultScore: number;             // System default
  userScore: number;                // User customized weight (0.50 - 1.00)
  rankOrder: number;                // Priority rank (1 = highest)
}

export interface InsuranceClaimEntry {
  claimId: string;
  insuranceCarrier: string;         // e.g. "Anthem Blue Cross", "UnitedHealth", "Aetna"
  claimNumber: string;
  serviceDate: string;
  renderingProvider: string;
  facilityName?: string;
  diagnosesICD: Array<{ code: string; display: string }>;
  proceduresCPT: Array<{ code: string; display: string; amountBilled: number }>;
  medicationsClaimed: Array<{ drugName: string; dosage?: string; dateFilled: string }>;
  totalBilled: number;
  planPaid: number;
  patientResponsibility: number;
  claimStatus: 'PAID' | 'PENDING' | 'DENIED';
  sourceDocId: string;
  sourceDocName: string;
  provenance?: ProvenanceMetadata;
}

export interface EmailScanMessage {
  id: string;
  providerName: string;             // e.g. "LabCorp", "Quest Diagnostics", "Anthem Blue Cross", "MyChart", "Email Integration"
  senderEmail: string;
  subject: string;
  receivedDate: string;
  category: 'LAB_RESULT_ALERT' | 'INSURANCE_CLAIM_EOB' | 'APPOINTMENT_SUMMARY' | 'PRESCRIPTION_NOTICE' | 'PORTAL_NOTIFICATION';
  hasAttachment: boolean;
  attachmentName?: string;
  portalLinkUrl?: string;
  snippet: string;
  parsedRecordCount: number;
  provenanceTag: string;
}

export interface EmailAgentAnalysis {
  analyzedAt: string;
  connectedAccounts: Array<{
    emailAddress: string;
    providerType: 'GMAIL_OAUTH' | 'OUTLOOK_OAUTH' | 'YAHOO_OAUTH' | 'IMAP_CUSTOM';
    status: 'CONNECTED' | 'DISCONNECTED';
    lastScannedAt: string;
  }>;
  totalEmailsScanned: number;
  healthEmailsIdentified: number;
  insuranceClaimsParsed: number;
  scannedMessages: EmailScanMessage[];
  claims: InsuranceClaimEntry[];
  deduplicatedRecordsCount: number;
}

export interface SymptomEntry {
  id: string;
  displayName: string;          // e.g. "Abdominal Pain", "Flank Pain", "Indigestion"
  snomedCode?: string;          // SNOMED CT code (optional)
  severity?: 'MILD' | 'MODERATE' | 'SEVERE';
  onset?: string;               // ISO date or free text
  sourceDocId: string;
  sourceDocName: string;
  provenance?: ProvenanceMetadata;
}

export interface DiagnosisEntry {
  id: string;                   // Stable canonical condition ID, e.g. "dx-kidney-stones", "dx-prediabetes"
  displayName: string;          // e.g. "Nephrolithiasis (Kidney Stones)"
  icdCode?: string;             // ICD-10 code, e.g. "N20.0"
  diagnosisType: 'CONFIRMED' | 'SUSPECTED' | 'RULE_OUT' | 'HISTORICAL';
  primaryDiagnosis: boolean;
  relevantUse?: string;         // Specific on/off-label indication for medications
  sourceDocId: string;
  sourceDocName: string;
  diagnosedDate?: string;       // ISO date — CRITICAL for episode clustering
  provider?: string;
  provenance?: ProvenanceMetadata;
}

export interface LinkedClinicalRecord {
  recordType: 'DOCUMENT' | 'MEDICATION' | 'BIOMARKER' | 'LAB_INSIGHT';
  recordId: string;
  recordLabel: string;
  documentCategory?: string;
  date?: string;                // ISO date — used for episode window matching
  sourceDocId: string;
  sourceDocName: string;
  severity?: string;
  provenance?: ProvenanceMetadata;
}

export interface ClinicalEpisode {
  episodeId: string;            // e.g. "ep-dx-kidney-stones-2026-01"
  diagnosisId: string;          // e.g. "dx-kidney-stones"
  displayName: string;          // e.g. "Nephrolithiasis (Kidney Stones)"
  icdCode?: string;
  diagnosisType: DiagnosisEntry['diagnosisType'];
  episodeStartDate: string;     // Earliest record date in cluster
  episodeEndDate: string;       // Latest record date in cluster
  windowDays: number;           // Clustering window used (default 60)
  linkedSymptoms: SymptomEntry[];
  linkedRecords: LinkedClinicalRecord[];
  linkedMedications: string[];  // drug names
  linkedBiomarkers: string[];   // canonical names
  documentCount: number;
}

export interface DiagnosisAgentAnalysis {
  analyzedAt: string;
  episodeWindowDays: number;
  totalUniqueConditions: number;
  totalEpisodes: number;
  totalSymptoms: number;
  clinicalEpisodes: ClinicalEpisode[];
  allDiagnoses: DiagnosisEntry[];    // Flat list of all diagnosis entries
  allSymptoms: SymptomEntry[];       // Flat list of all symptom entries
  confirmedDiagnoses: DiagnosisEntry[];
  suspectedDiagnoses: DiagnosisEntry[];
  symptomClusters: Array<{
    clusterName: string;        // e.g. "Renal / Urinary Symptoms"
    symptoms: SymptomEntry[];
    linkedDiagnosisIds: string[];
  }>;
}

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
  relatedDiagnoses?: string[];   // diagnosisIds this lab value relates to
  provenance?: ProvenanceMetadata;
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
  diagnoses?: DiagnosisEntry[];  // Specific relevant diagnoses for THIS prescription
  symptoms?: SymptomEntry[];     // Symptoms this medication addresses
  provenance?: ProvenanceMetadata;
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

export interface UnitConversionRule {
  canonicalName: string;
  fromUnit: string;
  toUnit: string;
  convert: (value: number) => number;
}

export interface BiomarkerTrendMetric {
  biomarkerName: string;        // canonical display name
  loincCode?: string;
  normalizedUnit: string;        // unit after conversion (e.g. mg/dL)
  baselineValue: number;
  latestValue: number;
  baselineDate: string;
  latestDate: string;
  absoluteChange: number;
  deltaPercent: number;          // e.g. -20.3 (percentage)
  trendDirection: 'IMPROVING' | 'WORSENING' | 'STABLE' | 'ELEVATED';
  currentStatus: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';
  unitNormalized: boolean;       // true if source unit was converted
  thresholdCrossed?: boolean;
  statusShift?: string;          // e.g. "HIGH → NORMAL"
  observationsCount: number;
  refRangeText?: string;
}

export interface LabClinicalInsight {
  id: string;
  biomarkerName: string;         // primary biomarker this insight relates to
  insightType: 'ABNORMAL_VALUE' | 'RAPID_CHANGE' | 'CONSISTENT_WORSENING' | 'NORMALIZATION' | 'REFERENCE_EXCEEDED';
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  description: string;
  recommendation?: string;
  affectedBiomarkers: string[];
}

export interface LabAgentAnalysis {
  analyzedAt: string;
  normalizedObservationsCount: number;
  conversionsAppliedCount: number;
  trendMetrics: BiomarkerTrendMetric[];
  clinicalInsights: LabClinicalInsight[];
  overallLabStatus: 'NORMAL' | 'ATTENTION_NEEDED' | 'CRITICAL';
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
  diagnoses: DiagnosisEntry[];   // ≥ 1 required for clinical documents
  symptoms: SymptomEntry[];      // 0+ patient-reported symptoms
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
  provenance?: ProvenanceMetadata;
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

/* ─────────────────────────────────────────────────────────────
   EHR & Personal Health System Integration Types
   ───────────────────────────────────────────────────────────── */

export type EHRProviderSystem =
  | 'EPIC_MYCHART'
  | 'ORACLE_CERNER'
  | 'ATHENA_HEALTH'
  | 'ECLINICAL_WORKS'
  | 'GENERIC_FHIR_R4'
  | 'FOLLOW_MY_HEALTH'
  | 'APPLE_HEALTH'
  | 'ANDROID_HEALTH_CONNECT'
  | 'CUSTOM_OAUTH';

export type EHRAuthProtocol =
  | 'SMART_ON_FHIR_PKCE'
  | 'OAUTH2_AUTHORIZATION_CODE'
  | 'HEALTHKIT_EXPORT_XML'
  | 'HEALTH_CONNECT_JSON'
  | 'API_KEY';

export interface EHRConnectionConfig {
  id: string;
  systemName: string;
  providerType: EHRProviderSystem;
  authProtocol: EHRAuthProtocol;
  fhirBaseUrl?: string;
  clientId?: string;
  scopes?: string[];
  status: 'DISCONNECTED' | 'AUTHENTICATING' | 'CONNECTED' | 'SYNC_ERROR';
  lastSyncedAt?: string;
  recordsSyncedCount?: number;
  accessToken?: string;
  patientId?: string;
}

export interface FHIRResourceWrapper {
  resourceType: 'Patient' | 'Condition' | 'MedicationRequest' | 'MedicationStatement' | 'Observation' | 'DiagnosticReport' | 'Encounter' | 'DocumentReference';
  id: string;
  code?: { coding?: Array<{ code?: string; display?: string; system?: string }>; text?: string };
  subject?: { reference?: string; display?: string };
  effectiveDateTime?: string;
  authoredOn?: string;
  status?: string;
  valueQuantity?: { value: number; unit: string };
  referenceRange?: Array<{ low?: { value: number }; high?: { value: number }; text?: string }>;
  dosageInstruction?: Array<{ text?: string }>;
  clinicalStatus?: { coding?: Array<{ code?: string }> };
  category?: Array<{ coding?: Array<{ display?: string }> }>;
}

export interface EHRSyncResult {
  connectionId: string;
  providerType: EHRProviderSystem;
  syncTimestamp: string;
  importedDocumentsCount: number;
  importedMedicationsCount: number;
  importedBiomarkersCount: number;
  importedDiagnosesCount: number;
  rawPayloadSize: number;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
}

export interface EHRIntegrationAnalysis {
  analyzedAt: string;
  activeConnectionsCount: number;
  totalSyncedRecords: number;
  connections: EHRConnectionConfig[];
  recentSyncResults: EHRSyncResult[];
  availableProviders: Array<{
    system: EHRProviderSystem;
    name: string;
    description: string;
    authProtocol: EHRAuthProtocol;
    iconName: string;
    logoColor: string;
  }>;
}

