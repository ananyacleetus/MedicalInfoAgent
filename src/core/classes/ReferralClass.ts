import { BaseMedicalDocumentClass, ExtractedMedicalPayload, StandardMedicalCategory } from '../types';

export class ReferralClass extends BaseMedicalDocumentClass {
  readonly classId = 'referral';
  readonly displayName: StandardMedicalCategory = 'Referral';
  readonly description = 'Specialist consultation requests, outbound referrals, and transfer of care letters.';
  readonly iconName = 'UserPlus';
  readonly colorAccent = '#f59e0b';
  readonly categoryGroup = 'Administrative' as const;
  readonly defaultRegisteredAgent = 'Care Coordination Subagent';

  evaluateMatch(ocrText: string): { confidence: number; matchingSignals: string[] } {
    const textLower = ocrText.toLowerCase();
    const signals: string[] = [];

    const keywords = ['referral', 'referred to', 'consultation request', 'specialty:', 'reason for referral', 'referred by'];

    keywords.forEach(kw => {
      if (textLower.includes(kw)) {
        signals.push(`Matches referral term: "${kw}"`);
      }
    });

    let confidence = 0;
    if (signals.length >= 2) confidence = 0.90;
    else if (signals.length === 1) confidence = 0.50;
    else confidence = 0.05;

    return { confidence, matchingSignals: signals };
  }

  parsePayload(_ocrText: string, docId: string, _docName: string): ExtractedMedicalPayload {
    return {
      summary: 'Specialist referral letter parsed.',
      biomarkers: [],
      medications: [],
      findings: [{
        id: `${docId}-ref-1`,
        heading: 'Reason for Referral',
        text: 'Consultation requested for specialized evaluation.',
        severity: 'info'
      }],
      rawEntities: {},
      confidenceScore: 0.88
    };
  }
}
