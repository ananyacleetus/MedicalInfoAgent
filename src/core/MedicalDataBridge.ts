import { BiomarkerObservation, MedicationEntry, ProcessedDocument, MedicationAgentAnalysis, TimelineEvent, PatientTimelineSummary, TimelineFilterOptions, LabAgentAnalysis, DiagnosisAgentAnalysis, DiagnosisEntry, SymptomEntry, EHRIntegrationAnalysis, EHRSyncResult, EHRConnectionConfig, EHRProviderSystem, EmailAgentAnalysis, SourceTrustWeightConfig } from './types';
import { MedicationAgent } from './MedicationAgent';
import { TimelineAgent } from './TimelineAgent';
import { LabAgent } from './LabAgent';
import { DiagnosisAgent } from './DiagnosisAgent';
import { EHRAgent } from './EHRAgent';
import { EmailAgent } from './EmailAgent';

export type BridgeEventListener = (event: {
  type: 'DOCUMENT_INGESTED' | 'BIOMARKERS_UPDATED' | 'INSIGHTS_REQUESTED';
  document?: ProcessedDocument;
  biomarkers?: BiomarkerObservation[];
}) => void;

const DEFAULT_SOURCE_TRUST_WEIGHTS: SourceTrustWeightConfig[] = [
  { provenanceType: 'EHR_SMART_FHIR', displayName: 'Direct EHR Integration (Epic, Cerner, Athena)', defaultScore: 0.99, userScore: 0.99, rankOrder: 1 },
  { provenanceType: 'EMAIL_HEALTH_NOTIFICATION', displayName: 'Lab Portal Email Attachment (Quest, LabCorp)', defaultScore: 0.98, userScore: 0.98, rankOrder: 2 },
  { provenanceType: 'EMAIL_INSURANCE_CLAIM', displayName: 'Insurance Claim / EOB Statement (Anthem, Aetna)', defaultScore: 0.95, userScore: 0.95, rankOrder: 3 },
  { provenanceType: 'PERSONAL_HEALTH_APP', displayName: 'Personal Health App Stream (Apple Health, Health Connect)', defaultScore: 0.93, userScore: 0.93, rankOrder: 4 },
  { provenanceType: 'MANUAL_OCR_UPLOAD', displayName: 'Manual File OCR Upload (PDF / Image)', defaultScore: 0.90, userScore: 0.90, rankOrder: 5 }
];

export class MedicalDataBridge {
  private static instance: MedicalDataBridge;
  private documents: ProcessedDocument[] = [];
  private listeners: Set<BridgeEventListener> = new Set();
  private sourceTrustWeights: SourceTrustWeightConfig[] = [...DEFAULT_SOURCE_TRUST_WEIGHTS];

  private constructor() {}

  public static getInstance(): MedicalDataBridge {
    if (!MedicalDataBridge.instance) {
      MedicalDataBridge.instance = new MedicalDataBridge();
    }
    return MedicalDataBridge.instance;
  }

  /**
   * Returns current user-customized source trust weight configurations
   */
  public getSourceTrustWeights(): SourceTrustWeightConfig[] {
    return [...this.sourceTrustWeights];
  }

  /**
   * Updates user-customized source trust weights and triggers re-collated deduplication
   */
  public updateSourceTrustWeights(newWeights: SourceTrustWeightConfig[]): void {
    this.sourceTrustWeights = [...newWeights];
    this.notifyListeners({ type: 'BIOMARKERS_UPDATED' });
  }

  /**
   * Resets source trust weights to system defaults
   */
  public resetSourceTrustWeights(): void {
    this.sourceTrustWeights = [...DEFAULT_SOURCE_TRUST_WEIGHTS];
    this.notifyListeners({ type: 'BIOMARKERS_UPDATED' });
  }

  /**
   * Ingests a newly processed document into the shared data bridge
   */
  public ingestDocument(doc: ProcessedDocument): void {
    // Fill default provenance if missing
    if (!doc.provenance) {
      doc.provenance = {
        provenanceSource: doc.filename.includes('LabCorp') ? 'Email Integration - LabCorp' :
                          doc.filename.includes('Quest') ? 'Email Integration - Quest Diagnostics' :
                          doc.filename.includes('Anthem') ? 'Email Integration - Anthem Blue Cross' :
                          doc.filename.includes('FHIR') ? 'EHR Sync - Epic MyChart' :
                          doc.filename.includes('Apple') ? 'Apple Health' : 'File OCR Upload',
        provenanceType: doc.filename.includes('FHIR') ? 'EHR_SMART_FHIR' :
                        doc.filename.includes('Anthem') ? 'EMAIL_INSURANCE_CLAIM' :
                        doc.filename.includes('Apple') ? 'PERSONAL_HEALTH_APP' :
                        doc.filename.includes('Lab') || doc.filename.includes('Quest') ? 'EMAIL_HEALTH_NOTIFICATION' : 'MANUAL_OCR_UPLOAD',
        sourceTrustScore: 0.95,
        sourcesList: [doc.filename.includes('FHIR') ? 'EHR Sync - Epic MyChart' : 'File OCR Upload']
      };
    }

    // Replace if exists, else add
    const index = this.documents.findIndex(d => d.id === doc.id);
    if (index >= 0) {
      this.documents[index] = doc;
    } else {
      this.documents.push(doc);
    }

    this.notifyListeners({
      type: 'DOCUMENT_INGESTED',
      document: doc,
      biomarkers: doc.extractedPayload.biomarkers
    });
  }

  /**
   * Returns all ingested documents in the data bridge
   */
  public getAllDocuments(): ProcessedDocument[] {
    return [...this.documents];
  }

  /**
   * Returns a clean, normalized array of all Biomarker Observations across all documents
   */
  public getAllBiomarkerObservations(): BiomarkerObservation[] {
    const observations: BiomarkerObservation[] = [];
    this.documents.forEach(doc => {
      if (doc.extractedPayload && doc.extractedPayload.biomarkers) {
        doc.extractedPayload.biomarkers.forEach(bio => {
          if (!bio.provenance) {
            bio.provenance = doc.provenance || {
              provenanceSource: 'File OCR Upload',
              provenanceType: 'MANUAL_OCR_UPLOAD',
              sourceTrustScore: 0.90,
              sourcesList: ['File OCR Upload']
            };
          }
          observations.push(bio);
        });
      }
    });
    return observations.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Query biomarker time-series data specifically grouped by canonical biomarker name (e.g. "Glucose", "HbA1c")
   */
  public getBiomarkerTimeSeries(canonicalName?: string): Record<string, BiomarkerObservation[]> {
    const all = this.getAllBiomarkersDeduplicated();
    const grouped: Record<string, BiomarkerObservation[]> = {};

    all.forEach(obs => {
      if (!canonicalName || obs.canonicalName.toLowerCase() === canonicalName.toLowerCase()) {
        if (!grouped[obs.canonicalName]) {
          grouped[obs.canonicalName] = [];
        }
        grouped[obs.canonicalName].push(obs);
      }
    });

    return grouped;
  }

  /**
   * Query all extracted medications across documents
   */
  public getAllMedications(): MedicationEntry[] {
    const meds: MedicationEntry[] = [];
    this.documents.forEach(doc => {
      if (doc.extractedPayload && doc.extractedPayload.medications) {
        doc.extractedPayload.medications.forEach(m => {
          if (!m.provenance) {
            m.provenance = doc.provenance || {
              provenanceSource: 'File OCR Upload',
              provenanceType: 'MANUAL_OCR_UPLOAD',
              sourceTrustScore: 0.90,
              sourcesList: ['File OCR Upload']
            };
          }
          meds.push(m);
        });
      }
    });
    return meds;
  }

  /**
   * Query all extracted diagnoses across all ingested documents
   */
  public getAllDiagnoses(): DiagnosisEntry[] {
    const diagnoses: DiagnosisEntry[] = [];
    this.documents.forEach(doc => {
      if (doc.extractedPayload && doc.extractedPayload.diagnoses) {
        doc.extractedPayload.diagnoses.forEach(dx => {
          if (!dx.provenance) {
            dx.provenance = doc.provenance || {
              provenanceSource: 'File OCR Upload',
              provenanceType: 'MANUAL_OCR_UPLOAD',
              sourceTrustScore: 0.90,
              sourcesList: ['File OCR Upload']
            };
          }
          diagnoses.push(dx);
        });
      }
    });
    return diagnoses;
  }

  /**
   * DEDUPLICATION & COLLATION ENGINE: Medications
   * Collates duplicate entries across EHR, Email, and Upload channels into single unified records with combined sourcesList.
   */
  public getAllMedicationsDeduplicated(): MedicationEntry[] {
    const allMeds = this.getAllMedications();
    const groupedMap = new Map<string, MedicationEntry[]>();

    allMeds.forEach(med => {
      const canonicalKey = `${med.drugName.toLowerCase().replace(/[\s\-_]/g, '')}-${(med.dosage || '').toLowerCase().replace(/\s/g, '')}`;
      if (!groupedMap.has(canonicalKey)) {
        groupedMap.set(canonicalKey, []);
      }
      groupedMap.get(canonicalKey)!.push(med);
    });

    const deduplicated: MedicationEntry[] = [];

    groupedMap.forEach((entries) => {
      // Sort by trust score descending
      entries.sort((a, b) => (b.provenance?.sourceTrustScore || 0.9) - (a.provenance?.sourceTrustScore || 0.9));

      const primary = { ...entries[0] };
      const sourcesSet = new Set<string>();

      entries.forEach(e => {
        if (e.provenance?.provenanceSource) sourcesSet.add(e.provenance.provenanceSource);
        if (e.provenance?.sourcesList) e.provenance.sourcesList.forEach(s => sourcesSet.add(s));
      });

      const combinedSources = Array.from(sourcesSet);

      primary.provenance = {
        ...primary.provenance!,
        provenanceSource: primary.provenance?.provenanceSource || combinedSources[0] || 'File OCR Upload',
        provenanceType: primary.provenance?.provenanceType || 'MANUAL_OCR_UPLOAD',
        sourceTrustScore: Math.min(1.0, (primary.provenance?.sourceTrustScore || 0.9) + (combinedSources.length - 1) * 0.03),
        sourcesList: combinedSources
      };

      deduplicated.push(primary);
    });

    return deduplicated;
  }

  /**
   * DEDUPLICATION & COLLATION ENGINE: Biomarker Observations
   */
  public getAllBiomarkersDeduplicated(): BiomarkerObservation[] {
    const allBio = this.getAllBiomarkerObservations();
    const groupedMap = new Map<string, BiomarkerObservation[]>();

    allBio.forEach(bio => {
      const dateStr = bio.timestamp ? bio.timestamp.substring(0, 10) : '2026-01-01';
      const canonicalKey = `${bio.canonicalName.toLowerCase()}-${dateStr}`;
      if (!groupedMap.has(canonicalKey)) {
        groupedMap.set(canonicalKey, []);
      }
      groupedMap.get(canonicalKey)!.push(bio);
    });

    const deduplicated: BiomarkerObservation[] = [];

    groupedMap.forEach((entries) => {
      entries.sort((a, b) => (b.provenance?.sourceTrustScore || 0.9) - (a.provenance?.sourceTrustScore || 0.9));

      const primary = { ...entries[0] };
      const sourcesSet = new Set<string>();

      entries.forEach(e => {
        if (e.provenance?.provenanceSource) sourcesSet.add(e.provenance.provenanceSource);
        if (e.provenance?.sourcesList) e.provenance.sourcesList.forEach(s => sourcesSet.add(s));
      });

      const combinedSources = Array.from(sourcesSet);

      primary.provenance = {
        ...primary.provenance!,
        provenanceSource: primary.provenance?.provenanceSource || combinedSources[0] || 'File OCR Upload',
        provenanceType: primary.provenance?.provenanceType || 'MANUAL_OCR_UPLOAD',
        sourceTrustScore: Math.min(1.0, (primary.provenance?.sourceTrustScore || 0.9) + (combinedSources.length - 1) * 0.03),
        sourcesList: combinedSources
      };

      deduplicated.push(primary);
    });

    return deduplicated;
  }

  /**
   * Query all extracted symptoms across all ingested documents
   */
  public getAllSymptoms(): SymptomEntry[] {
    const symptoms: SymptomEntry[] = [];
    this.documents.forEach(doc => {
      if (doc.extractedPayload && doc.extractedPayload.symptoms) {
        symptoms.push(...doc.extractedPayload.symptoms);
      }
      doc.extractedPayload?.medications?.forEach(med => {
        if (med.symptoms) symptoms.push(...med.symptoms);
      });
    });
    return symptoms;
  }

  /**
   * Run the Medication Agent to analyze changes, duplicates, and drug-drug interactions
   */
  public getMedicationAgentAnalysis(): MedicationAgentAnalysis {
    const meds = this.getAllMedicationsDeduplicated();
    const agent = MedicationAgent.getInstance();
    return agent.analyzeMedications(meds);
  }

  /**
   * Run the Lab Intelligence Agent to analyze trends, normalize units, and calculate percentage deltas
   */
  public getLabAgentAnalysis(): LabAgentAnalysis {
    const observations = this.getAllBiomarkersDeduplicated();
    const labAgent = LabAgent.getInstance();
    return labAgent.analyzeLabTrends(observations);
  }

  /**
   * Run the Diagnosis & Symptom Intelligence Agent for temporal episode clustering
   */
  public getDiagnosisAgentAnalysis(windowDays?: number): DiagnosisAgentAnalysis {
    const docs = this.getAllDocuments();
    return DiagnosisAgent.getInstance().analyzeDiagnoses(docs, windowDays);
  }

  /**
   * Run the EHR & Portal Integration Agent to get active connections & sync stats
   */
  public getEHRAgentAnalysis(): EHRIntegrationAnalysis {
    return EHRAgent.getInstance().getAnalysis();
  }

  public connectEHRProvider(providerType: EHRProviderSystem): Promise<EHRConnectionConfig> {
    return EHRAgent.getInstance().connectSystem(providerType);
  }

  public syncEHRProvider(connectionId: string): Promise<EHRSyncResult> {
    return EHRAgent.getInstance().syncSystem(connectionId);
  }

  /**
   * Run the Email Intelligence Agent to get scanned emails & insurance claims analysis
   */
  public getEmailAgentAnalysis(): EmailAgentAnalysis {
    return EmailAgent.getInstance().getAnalysis();
  }

  public connectEmailAccount(
    emailAddress: string,
    providerType: 'GMAIL_OAUTH' | 'OUTLOOK_OAUTH' | 'YAHOO_OAUTH' | 'IMAP_CUSTOM'
  ): Promise<void> {
    return EmailAgent.getInstance().connectEmailAccount(emailAddress, providerType);
  }

  public scanEmailInbox(): Promise<EmailAgentAnalysis> {
    return EmailAgent.getInstance().scanInbox();
  }

  /**
   * Retrieves the complete unified chronological timeline of all clinical events
   */
  public getPatientTimeline(filters?: TimelineFilterOptions): TimelineEvent[] {
    const docs = this.getAllDocuments();
    const timelineAgent = TimelineAgent.getInstance();
    const fullTimeline = timelineAgent.buildUnifiedTimeline(docs);
    return filters ? timelineAgent.filterTimeline(fullTimeline, filters) : fullTimeline;
  }

  /**
   * Retrieves high-level timeline metrics summary
   */
  public getTimelineSummary(): PatientTimelineSummary {
    const timeline = this.getPatientTimeline();
    return TimelineAgent.getInstance().getTimelineSummary(timeline);
  }

  /**
   * Exports a structured JSON payload engineered specifically for downstream Insights & Analytics AI agents
   */
  public exportAgentPayload(): {
    exportedAt: string;
    totalDocuments: number;
    patientOverview: {
      patientName?: string;
      dob?: string;
      latestDocumentDate?: string;
    };
    biomarkers: BiomarkerObservation[];
    medications: MedicationEntry[];
    allDiagnoses: DiagnosisEntry[];
    allSymptoms: SymptomEntry[];
    medicationAnalysis: MedicationAgentAnalysis;
    labAnalysis: LabAgentAnalysis;
    diagnosisAnalysis: DiagnosisAgentAnalysis;
    ehrIntegrationAnalysis: EHRIntegrationAnalysis;
    emailAgentAnalysis: EmailAgentAnalysis;
    sourceTrustWeights: SourceTrustWeightConfig[];
    patientTimeline: {
      summary: PatientTimelineSummary;
      events: TimelineEvent[];
    };
    documentSummaries: Array<{
      id: string;
      filename: string;
      category: string;
      summary: string;
      findingsCount: number;
      diagnosesCount: number;
      symptomsCount: number;
      provenanceSource: string;
    }>;
  } {
    const allDocs = this.getAllDocuments();
    const allBiomarkers = this.getAllBiomarkersDeduplicated();
    const allMeds = this.getAllMedicationsDeduplicated();
    const allDiagnoses = this.getAllDiagnoses();
    const allSymptoms = this.getAllSymptoms();
    const medicationAnalysis = this.getMedicationAgentAnalysis();
    const labAnalysis = this.getLabAgentAnalysis();
    const diagnosisAnalysis = this.getDiagnosisAgentAnalysis();
    const ehrIntegrationAnalysis = this.getEHRAgentAnalysis();
    const emailAgentAnalysis = this.getEmailAgentAnalysis();
    const timelineEvents = this.getPatientTimeline();
    const timelineSummary = this.getTimelineSummary();

    const latestDoc = allDocs[allDocs.length - 1];

    return {
      exportedAt: new Date().toISOString(),
      totalDocuments: allDocs.length,
      patientOverview: {
        patientName: latestDoc?.extractedPayload.patientName || 'Alex Morgan',
        dob: latestDoc?.extractedPayload.dob || '1985-04-12',
        latestDocumentDate: latestDoc?.uploadTimestamp || new Date().toISOString()
      },
      biomarkers: allBiomarkers,
      medications: allMeds,
      allDiagnoses,
      allSymptoms,
      medicationAnalysis,
      labAnalysis,
      diagnosisAnalysis,
      ehrIntegrationAnalysis,
      emailAgentAnalysis,
      sourceTrustWeights: this.getSourceTrustWeights(),
      patientTimeline: {
        summary: timelineSummary,
        events: timelineEvents
      },
      documentSummaries: allDocs.map(d => ({
        id: d.id,
        filename: d.filename,
        category: String(d.classification.categoryName),
        summary: d.extractedPayload.summary,
        findingsCount: d.extractedPayload.findings?.length || 0,
        diagnosesCount: d.extractedPayload.diagnoses?.length || 0,
        symptomsCount: d.extractedPayload.symptoms?.length || 0,
        provenanceSource: d.provenance?.provenanceSource || 'File OCR Upload'
      }))
    };
  }

  /**
   * Subscribe to live events when documents are ingested or updated
   */
  public subscribe(listener: BridgeEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(event: Parameters<BridgeEventListener>[0]): void {
    this.listeners.forEach(fn => fn(event));
  }
}
