import { BaseMedicalDocumentClass, ExtractedMedicalPayload, StandardMedicalCategory } from '../types';

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

  parsePayload(_ocrText: string, _docId: string, _docName: string): ExtractedMedicalPayload {
    return {
      summary: 'Diagnostic lab requisition order parsed.',
      biomarkers: [],
      medications: [],
      findings: [],
      rawEntities: {},
      confidenceScore: 0.87
    };
  }
}
