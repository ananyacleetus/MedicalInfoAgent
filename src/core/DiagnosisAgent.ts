import {
  ProcessedDocument,
  DiagnosisEntry,
  SymptomEntry,
  LinkedClinicalRecord,
  ClinicalEpisode,
  DiagnosisAgentAnalysis
} from './types';

export class DiagnosisAgent {
  private static instance: DiagnosisAgent;

  private constructor() {}

  public static getInstance(): DiagnosisAgent {
    if (!DiagnosisAgent.instance) {
      DiagnosisAgent.instance = new DiagnosisAgent();
    }
    return DiagnosisAgent.instance;
  }

  /**
   * Primary pipeline: collects diagnoses and symptoms across all documents,
   * performs temporal sliding-window clustering (default 60 days) to separate distinct bouts,
   * and links all documents, medications, biomarkers, and symptoms per episode.
   */
  public analyzeDiagnoses(
    documents: ProcessedDocument[],
    windowDays: number = 60
  ): DiagnosisAgentAnalysis {
    const allDiagnoses: DiagnosisEntry[] = [];
    const allSymptoms: SymptomEntry[] = [];

    // Extract all diagnoses and symptoms across all ingested documents
    documents.forEach(doc => {
      if (doc.extractedPayload) {
        if (doc.extractedPayload.diagnoses) {
          allDiagnoses.push(...doc.extractedPayload.diagnoses);
        }
        if (doc.extractedPayload.symptoms) {
          allSymptoms.push(...doc.extractedPayload.symptoms);
        }
        // Check medications inside payload for embedded diagnoses
        doc.extractedPayload.medications?.forEach(med => {
          if (med.diagnoses) {
            allDiagnoses.push(...med.diagnoses);
          }
          if (med.symptoms) {
            allSymptoms.push(...med.symptoms);
          }
        });
      }
    });

    // Deduplicate flat lists by ID
    const uniqueDiagnoses = this.deduplicateDiagnoses(allDiagnoses);
    const uniqueSymptoms = this.deduplicateSymptoms(allSymptoms);

    // Group diagnosis entries by diagnosisId
    const groupedByCondition: Record<string, DiagnosisEntry[]> = {};
    uniqueDiagnoses.forEach(dx => {
      if (!groupedByCondition[dx.id]) {
        groupedByCondition[dx.id] = [];
      }
      groupedByCondition[dx.id].push(dx);
    });

    // Build episodes using temporal sliding window
    const clinicalEpisodes: ClinicalEpisode[] = [];

    Object.entries(groupedByCondition).forEach(([diagnosisId, dxEntries]) => {
      // Sort entries chronologically by diagnosedDate or document date
      const sortedDx = [...dxEntries].sort((a, b) => {
        const dateA = a.diagnosedDate || '2026-01-01';
        const dateB = b.diagnosedDate || '2026-01-01';
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });

      // Cluster by time window
      const clusters: DiagnosisEntry[][] = [];
      let currentCluster: DiagnosisEntry[] = [];

      sortedDx.forEach(dx => {
        if (currentCluster.length === 0) {
          currentCluster.push(dx);
        } else {
          const clusterStart = new Date(currentCluster[0].diagnosedDate || '2026-01-01').getTime();
          const currentEntryDate = new Date(dx.diagnosedDate || '2026-01-01').getTime();
          const diffDays = Math.abs(currentEntryDate - clusterStart) / (1000 * 60 * 60 * 24);

          if (diffDays <= windowDays) {
            currentCluster.push(dx);
          } else {
            clusters.push(currentCluster);
            currentCluster = [dx];
          }
        }
      });
      if (currentCluster.length > 0) {
        clusters.push(currentCluster);
      }

      // Convert clusters into ClinicalEpisode objects
      clusters.forEach((cluster, idx) => {
        const primary = cluster[0];
        const dates = cluster
          .map(d => d.diagnosedDate)
          .filter((d): d is string => !!d)
          .sort();

        const startDate = dates[0] || '2026-01-01';
        const endDate = dates[dates.length - 1] || startDate;

        // Find all documents falling in this date range + linked to this diagnosisId
        const episodeDocs = documents.filter(doc => {
          const docDate = doc.extractedPayload?.documentDate || doc.uploadTimestamp.substring(0, 10);
          const hasDx = doc.extractedPayload?.diagnoses?.some(d => d.id === diagnosisId);
          const diffDays = Math.abs(new Date(docDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24);
          return hasDx || diffDays <= windowDays / 2;
        });

        // Collect linked records
        const linkedRecords: LinkedClinicalRecord[] = [];
        const linkedMedicationsSet = new Set<string>();
        const linkedBiomarkersSet = new Set<string>();
        const episodeSymptoms: SymptomEntry[] = [];

        episodeDocs.forEach(doc => {
          // Document record
          linkedRecords.push({
            recordType: 'DOCUMENT',
            recordId: doc.id,
            recordLabel: doc.filename,
            documentCategory: String(doc.classification.categoryName),
            date: doc.extractedPayload?.documentDate || doc.uploadTimestamp.substring(0, 10),
            sourceDocId: doc.id,
            sourceDocName: doc.filename
          });

          // Medications in this doc
          doc.extractedPayload?.medications?.forEach(med => {
            linkedMedicationsSet.add(med.drugName);
            linkedRecords.push({
              recordType: 'MEDICATION',
              recordId: med.id,
              recordLabel: `${med.drugName} (${med.dosage})`,
              date: med.startDate || doc.extractedPayload?.documentDate,
              sourceDocId: doc.id,
              sourceDocName: doc.filename
            });
          });

          // Biomarkers in this doc
          doc.extractedPayload?.biomarkers?.forEach(bio => {
            linkedBiomarkersSet.add(bio.canonicalName);
            linkedRecords.push({
              recordType: 'BIOMARKER',
              recordId: bio.id,
              recordLabel: `${bio.canonicalName}: ${bio.value} ${bio.unit}`,
              date: bio.timestamp?.substring(0, 10),
              sourceDocId: doc.id,
              sourceDocName: doc.filename,
              severity: bio.status
            });
          });

          // Symptoms in this doc
          if (doc.extractedPayload?.symptoms) {
            episodeSymptoms.push(...doc.extractedPayload.symptoms);
          }
        });

        const episodeId = `ep-${diagnosisId}-${startDate.substring(0, 7)}-${idx + 1}`;

        clinicalEpisodes.push({
          episodeId,
          diagnosisId,
          displayName: primary.displayName,
          icdCode: primary.icdCode,
          diagnosisType: primary.diagnosisType,
          episodeStartDate: startDate,
          episodeEndDate: endDate,
          windowDays,
          linkedSymptoms: this.deduplicateSymptoms(episodeSymptoms),
          linkedRecords: this.deduplicateRecords(linkedRecords),
          linkedMedications: Array.from(linkedMedicationsSet),
          linkedBiomarkers: Array.from(linkedBiomarkersSet),
          documentCount: episodeDocs.length
        });
      });
    });

    // Sort episodes by date descending
    clinicalEpisodes.sort(
      (a, b) => new Date(b.episodeStartDate).getTime() - new Date(a.episodeStartDate).getTime()
    );

    const confirmedDiagnoses = uniqueDiagnoses.filter(d => d.diagnosisType === 'CONFIRMED');
    const suspectedDiagnoses = uniqueDiagnoses.filter(d => d.diagnosisType === 'SUSPECTED');

    const symptomClusters = this.buildSymptomClusters(uniqueSymptoms, uniqueDiagnoses);

    return {
      analyzedAt: new Date().toISOString(),
      episodeWindowDays: windowDays,
      totalUniqueConditions: Object.keys(groupedByCondition).length,
      totalEpisodes: clinicalEpisodes.length,
      totalSymptoms: uniqueSymptoms.length,
      clinicalEpisodes,
      allDiagnoses: uniqueDiagnoses,
      allSymptoms: uniqueSymptoms,
      confirmedDiagnoses,
      suspectedDiagnoses,
      symptomClusters
    };
  }

  private buildSymptomClusters(
    symptoms: SymptomEntry[],
    diagnoses: DiagnosisEntry[]
  ): DiagnosisAgentAnalysis['symptomClusters'] {
    const renalSymptoms = symptoms.filter(s =>
      /flank|urinary|hematuria|dysuria|kidney|stones/i.test(s.displayName)
    );
    const metabolicSymptoms = symptoms.filter(s =>
      /fatigue|thirst|weight|polyuria|glucose/i.test(s.displayName)
    );
    const cardiacSymptoms = symptoms.filter(s =>
      /chest|edema|shortness of breath|swelling|pressure/i.test(s.displayName)
    );
    const GI_Symptoms = symptoms.filter(s =>
      /indigestion|abdominal|nausea|heartburn|reflux/i.test(s.displayName)
    );

    const clusters: DiagnosisAgentAnalysis['symptomClusters'] = [];

    if (renalSymptoms.length > 0) {
      clusters.push({
        clusterName: 'Renal & Urinary Symptom Cluster',
        symptoms: renalSymptoms,
        linkedDiagnosisIds: diagnoses.filter(d => d.id.includes('stone') || d.id.includes('renal')).map(d => d.id)
      });
    }

    if (metabolicSymptoms.length > 0) {
      clusters.push({
        clusterName: 'Metabolic & Glycemic Symptom Cluster',
        symptoms: metabolicSymptoms,
        linkedDiagnosisIds: diagnoses.filter(d => d.id.includes('diabetes') || d.id.includes('prediabetes')).map(d => d.id)
      });
    }

    if (cardiacSymptoms.length > 0) {
      clusters.push({
        clusterName: 'Cardiovascular & Fluid Symptom Cluster',
        symptoms: cardiacSymptoms,
        linkedDiagnosisIds: diagnoses.filter(d => d.id.includes('hypertension') || d.id.includes('cardio')).map(d => d.id)
      });
    }

    if (GI_Symptoms.length > 0) {
      clusters.push({
        clusterName: 'Gastrointestinal Symptom Cluster',
        symptoms: GI_Symptoms,
        linkedDiagnosisIds: diagnoses.filter(d => d.id.includes('gerd') || d.id.includes('gi')).map(d => d.id)
      });
    }

    return clusters;
  }

  private deduplicateDiagnoses(items: DiagnosisEntry[]): DiagnosisEntry[] {
    const seen = new Set<string>();
    return items.filter(item => {
      const key = `${item.id}-${item.sourceDocId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private deduplicateSymptoms(items: SymptomEntry[]): SymptomEntry[] {
    const seen = new Set<string>();
    return items.filter(item => {
      const key = `${item.displayName.toLowerCase()}-${item.sourceDocId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private deduplicateRecords(items: LinkedClinicalRecord[]): LinkedClinicalRecord[] {
    const seen = new Set<string>();
    return items.filter(item => {
      const key = `${item.recordType}-${item.recordId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
