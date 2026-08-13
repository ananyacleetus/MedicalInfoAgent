import { BaseMedicalDocumentClass, DiagnosisEntry, ExtractedMedicalPayload, StandardMedicalCategory, SymptomEntry } from '../types';

export class ImagingOrderClass extends BaseMedicalDocumentClass {
  readonly classId = 'imaging-order';
  readonly displayName: StandardMedicalCategory = 'Imaging Order';
  readonly description = 'Radiology requisitions and physician orders for CT, MRI, X-Ray, or Ultrasound scans.';
  readonly iconName = 'FileSpreadsheet';
  readonly colorAccent = '#0284c7';
  readonly categoryGroup = 'Order' as const;
  readonly defaultRegisteredAgent = 'Radiology Ordering Subagent';

  evaluateMatch(ocrText: string): { confidence: number; matchingSignals: string[] } {
    const textLower = ocrText.toLowerCase();
    const signals: string[] = [];

    const keywords = ['imaging order', 'radiology requisition', 'order for ct', 'order for mri', 'order for x-ray', 'reason for study:'];

    keywords.forEach(kw => {
      if (textLower.includes(kw)) {
        signals.push(`Matches imaging order signal: "${kw}"`);
      }
    });

    let confidence = 0;
    if (signals.length >= 2) confidence = 0.90;
    else if (signals.length === 1) confidence = 0.55;
    else confidence = 0.05;

    return { confidence, matchingSignals: signals };
  }

  parsePayload(ocrText: string, docId: string, docName: string): ExtractedMedicalPayload {
    const todayIso = new Date().toISOString().substring(0, 10);
    const textLower = ocrText.toLowerCase();
    const diagnoses: DiagnosisEntry[] = [];
    const symptoms: SymptomEntry[] = [];

    if (textLower.includes('flank') || textLower.includes('stone') || textLower.includes('kidney')) {
      diagnoses.push({
        id: 'dx-kidney-stones',
        displayName: 'Nephrolithiasis (Kidney Stones)',
        icdCode: 'N20.0',
        diagnosisType: 'SUSPECTED',
        primaryDiagnosis: true,
        sourceDocId: docId,
        sourceDocName: docName,
        diagnosedDate: todayIso
      });
      symptoms.push({
        id: `${docId}-sym-flank`,
        displayName: 'Acute Right Flank Pain',
        severity: 'SEVERE',
        sourceDocId: docId,
        sourceDocName: docName
      });
    } else {
      diagnoses.push({
        id: 'dx-imaging-order',
        displayName: 'Radiology Requisition Indication',
        diagnosisType: 'CONFIRMED',
        primaryDiagnosis: true,
        sourceDocId: docId,
        sourceDocName: docName,
        diagnosedDate: todayIso
      });
    }

    return {
      summary: 'Radiology imaging order parsed.',
      biomarkers: [],
      medications: [],
      findings: [],
      diagnoses,
      symptoms,
      rawEntities: {},
      confidenceScore: 0.88
    };
  }
}

