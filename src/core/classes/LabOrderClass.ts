import { BaseMedicalDocumentClass, DiagnosisEntry, ExtractedMedicalPayload, StandardMedicalCategory, SymptomEntry } from '../types';

export class LabOrderClass extends BaseMedicalDocumentClass {
  readonly classId = 'lab-order';
  readonly displayName: StandardMedicalCategory = 'Lab Order';
  readonly description = 'Requisition forms and physician orders for diagnostic bloodwork and laboratory panels.';
  readonly iconName = 'ClipboardList';
  readonly colorAccent = '#a855f7';
  readonly categoryGroup = 'Order' as const;
  readonly defaultRegisteredAgent = 'Order Processing Subagent';

  evaluateMatch(ocrText: string): { confidence: number; matchingSignals: string[] } {
    const textLower = ocrText.toLowerCase();
    const signals: string[] = [];

    const keywords = ['lab order', 'laboratory requisition', 'order for lab', 'fasting required', 'test ordered:'];

    keywords.forEach(kw => {
      if (textLower.includes(kw)) {
        signals.push(`Matches lab order phrase: "${kw}"`);
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

    if (textLower.includes('urinalysis') || textLower.includes('hematuria') || textLower.includes('flank')) {
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
        id: `${docId}-sym-hem`,
        displayName: 'Microscopic Hematuria',
        severity: 'MODERATE',
        sourceDocId: docId,
        sourceDocName: docName
      });
    } else {
      diagnoses.push({
        id: 'dx-lab-order',
        displayName: 'Laboratory Requisition Indication',
        diagnosisType: 'CONFIRMED',
        primaryDiagnosis: true,
        sourceDocId: docId,
        sourceDocName: docName,
        diagnosedDate: todayIso
      });
    }

    return {
      summary: 'Diagnostic lab requisition order parsed.',
      biomarkers: [],
      medications: [],
      findings: [],
      diagnoses,
      symptoms,
      rawEntities: {},
      confidenceScore: 0.87
    };
  }
}

