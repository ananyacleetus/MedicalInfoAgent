import { BaseMedicalDocumentClass, ExtractedMedicalPayload, StandardMedicalCategory } from '../types';

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

  parsePayload(_ocrText: string, _docId: string, _docName: string): ExtractedMedicalPayload {
    return {
      summary: 'Radiology imaging order parsed.',
      biomarkers: [],
      medications: [],
      findings: [],
      rawEntities: {},
      confidenceScore: 0.88
    };
  }
}
