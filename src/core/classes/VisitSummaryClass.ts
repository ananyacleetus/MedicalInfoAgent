import { BaseMedicalDocumentClass, ExtractedMedicalPayload, StandardMedicalCategory } from '../types';

export class VisitSummaryClass extends BaseMedicalDocumentClass {
  readonly classId = 'visit-summary';
  readonly displayName: StandardMedicalCategory = 'Visit Summary';
  readonly description = 'Outpatient clinic progress notes, SOAP notes, inpatient discharge summaries, and encounter logs.';
  readonly iconName = 'FileText';
  readonly colorAccent = '#3b82f6';
  readonly categoryGroup = 'Clinical Notes' as const;
  readonly defaultRegisteredAgent = 'Clinical Summarization Subagent';

  evaluateMatch(ocrText: string): { confidence: number; matchingSignals: string[] } {
    const textLower = ocrText.toLowerCase();
    const signals: string[] = [];

    const keywords = ['visit summary', 'office visit', 'progress note', 'soap note', 'discharge summary', 'chief complaint', 'assessment & plan', 'encounter date'];

    keywords.forEach(kw => {
      if (textLower.includes(kw)) {
        signals.push(`Matches visit summary keyword: "${kw}"`);
      }
    });

    let confidence = 0;
    if (signals.length >= 3) confidence = 0.95;
    else if (signals.length >= 1) confidence = 0.60;
    else confidence = 0.10;

    return { confidence, matchingSignals: signals };
  }

  parsePayload(_ocrText: string, docId: string, _docName: string): ExtractedMedicalPayload {
    return {
      summary: 'Clinical encounter progress note parsed.',
      biomarkers: [],
      medications: [],
      findings: [{
        id: `${docId}-vs-1`,
        heading: 'Clinical Impression',
        text: 'Patient presented for routine clinical evaluation. Vital signs reviewed.',
        severity: 'normal'
      }],
      rawEntities: {},
      confidenceScore: 0.90
    };
  }
}
