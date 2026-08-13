import { BaseMedicalDocumentClass, DiagnosisEntry, ExtractedMedicalPayload, StandardMedicalCategory, SymptomEntry } from '../types';

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

  parsePayload(ocrText: string, docId: string, docName: string): ExtractedMedicalPayload {
    const todayIso = new Date().toISOString().substring(0, 10);
    const textLower = ocrText.toLowerCase();
    const diagnoses: DiagnosisEntry[] = [];
    const symptoms: SymptomEntry[] = [];

    if (textLower.includes('endocrin') || textLower.includes('glycemic')) {
      diagnoses.push({
        id: 'dx-prediabetes',
        displayName: 'Prediabetes & Metabolic Risk',
        icdCode: 'R73.09',
        diagnosisType: 'SUSPECTED',
        primaryDiagnosis: true,
        sourceDocId: docId,
        sourceDocName: docName,
        diagnosedDate: todayIso
      });
    } else {
      diagnoses.push({
        id: 'dx-specialist-consult',
        displayName: 'Specialist Referral Evaluation',
        diagnosisType: 'CONFIRMED',
        primaryDiagnosis: true,
        sourceDocId: docId,
        sourceDocName: docName,
        diagnosedDate: todayIso
      });
    }

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
      diagnoses,
      symptoms,
      rawEntities: {},
      confidenceScore: 0.88
    };
  }
}

