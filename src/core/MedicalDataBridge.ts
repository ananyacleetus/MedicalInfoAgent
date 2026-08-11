import { BiomarkerObservation, MedicationEntry, ProcessedDocument } from './types';

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
    documentSummaries: Array<{
      id: string;
      filename: string;
      category: string;
      summary: string;
      findingsCount: number;
    }>;
  } {
    const allDocs = this.getAllDocuments();
    const allBiomarkers = this.getAllBiomarkerObservations();
    const allMeds = this.getAllMedications();

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
      documentSummaries: allDocs.map(d => ({
        id: d.id,
        filename: d.filename,
        category: String(d.classification.categoryName),
        summary: d.extractedPayload.summary,
        findingsCount: d.extractedPayload.findings.length
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
