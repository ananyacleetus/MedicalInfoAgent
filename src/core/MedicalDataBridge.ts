import { BiomarkerObservation, MedicationEntry, ProcessedDocument, MedicationAgentAnalysis, TimelineEvent, PatientTimelineSummary, TimelineFilterOptions, LabAgentAnalysis, DiagnosisAgentAnalysis, DiagnosisEntry, SymptomEntry, EHRIntegrationAnalysis, EHRSyncResult, EHRConnectionConfig, EHRProviderSystem } from './types';
import { MedicationAgent } from './MedicationAgent';
import { TimelineAgent } from './TimelineAgent';
import { LabAgent } from './LabAgent';
import { DiagnosisAgent } from './DiagnosisAgent';
import { EHRAgent } from './EHRAgent';

export type BridgeEventListener = (event: {
  type: 'DOCUMENT_INGESTED' | 'BIOMARKERS_UPDATED' | 'INSIGHTS_REQUESTED';
  document?: ProcessedDocument;
  biomarkers?: BiomarkerObservation[];
}) => void;

export class MedicalDataBridge {
  private static instance: MedicalDataBridge;
  private documents: ProcessedDocument[] = [];
  private listeners: Set<BridgeEventListener> = new Set();

  private constructor() {}

  public static getInstance(): MedicalDataBridge {
    if (!MedicalDataBridge.instance) {
      MedicalDataBridge.instance = new MedicalDataBridge();
    }
    return MedicalDataBridge.instance;
  }

  /**
   * Ingests a newly processed document into the shared data bridge
   */
  public ingestDocument(doc: ProcessedDocument): void {
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
        observations.push(...doc.extractedPayload.biomarkers);
      }
    });
    return observations.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Query biomarker time-series data specifically grouped by canonical biomarker name (e.g. "Glucose", "HbA1c")
   * Ideal for Insights/Analytics agents creating trend visualizations or predictive models.
   */
  public getBiomarkerTimeSeries(canonicalName?: string): Record<string, BiomarkerObservation[]> {
    const all = this.getAllBiomarkerObservations();
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
        meds.push(...doc.extractedPayload.medications);
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
        diagnoses.push(...doc.extractedPayload.diagnoses);
      }
      doc.extractedPayload?.medications?.forEach(med => {
        if (med.diagnoses) diagnoses.push(...med.diagnoses);
      });
    });
    return diagnoses;
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
    const meds = this.getAllMedications();
    const agent = MedicationAgent.getInstance();
    return agent.analyzeMedications(meds);
  }

  /**
   * Run the Lab Intelligence Agent to analyze trends, normalize units, and calculate percentage deltas
   */
  public getLabAgentAnalysis(): LabAgentAnalysis {
    const observations = this.getAllBiomarkerObservations();
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
    }>;
  } {
    const allDocs = this.getAllDocuments();
    const allBiomarkers = this.getAllBiomarkerObservations();
    const allMeds = this.getAllMedications();
    const allDiagnoses = this.getAllDiagnoses();
    const allSymptoms = this.getAllSymptoms();
    const medicationAnalysis = this.getMedicationAgentAnalysis();
    const labAnalysis = this.getLabAgentAnalysis();
    const diagnosisAnalysis = this.getDiagnosisAgentAnalysis();
    const ehrIntegrationAnalysis = this.getEHRAgentAnalysis();
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
        symptomsCount: d.extractedPayload.symptoms?.length || 0
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
