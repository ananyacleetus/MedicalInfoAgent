import {
  BaseMedicalDocumentClass,
  ClinicalFinding,
  DiagnosisEntry,
  ExtractedMedicalPayload,
  MedicationEntry,
  StandardMedicalCategory,
  SymptomEntry
} from '../types';

export class InsuranceClaimClass extends BaseMedicalDocumentClass {
  readonly classId = 'insurance-claim';
  readonly displayName: StandardMedicalCategory = 'Insurance Claim / EOB';
  readonly description = 'Explanation of Benefits (EOB), health insurance claims, covered CPT procedures, ICD-10 diagnoses, and provider billing statements.';
  readonly iconName = 'ShieldAlert';
  readonly colorAccent = '#10b981'; // Emerald
  readonly categoryGroup = 'Administrative' as const;
  readonly defaultRegisteredAgent = 'Email & Claims Subagent';

  evaluateMatch(ocrText: string): { confidence: number; matchingSignals: string[] } {
    const textLower = ocrText.toLowerCase();
    const signals: string[] = [];

    const keywords = [
      'explanation of benefits', 'eob', 'claim number', 'claim #',
      'amount billed', 'plan paid', 'patient responsibility', 'cpt',
      'service date', 'rendering provider', 'insurance claim', 'carrier'
    ];

    keywords.forEach(kw => {
      if (textLower.includes(kw)) {
        signals.push(`Matches insurance claim signal: "${kw}"`);
      }
    });

    let confidence = 0;
    if (signals.length >= 4) confidence = 0.98;
    else if (signals.length >= 2) confidence = 0.80;
    else if (signals.length === 1) confidence = 0.45;
    else confidence = 0.05;

    return { confidence, matchingSignals: signals };
  }

  parsePayload(ocrText: string, docId: string, docName: string): ExtractedMedicalPayload {
    const todayIso = new Date().toISOString().substring(0, 10);
    const textLower = ocrText.toLowerCase();
    const findings: ClinicalFinding[] = [];
    const diagnoses: DiagnosisEntry[] = [];
    const medications: MedicationEntry[] = [];
    const symptoms: SymptomEntry[] = [];

    if (textLower.includes('e11.9') || textLower.includes('diabetes')) {
      diagnoses.push({
        id: 'dx-diabetes-t2',
        displayName: 'Type 2 Diabetes Mellitus',
        icdCode: 'E11.9',
        diagnosisType: 'CONFIRMED',
        primaryDiagnosis: true,
        sourceDocId: docId,
        sourceDocName: docName,
        diagnosedDate: todayIso,
        provenance: {
          provenanceSource: 'Email Integration - Anthem Blue Cross',
          provenanceType: 'EMAIL_INSURANCE_CLAIM',
          sourceTrustScore: 0.95
        }
      });
    }

    if (textLower.includes('i10') || textLower.includes('hypertension')) {
      diagnoses.push({
        id: 'dx-hypertension',
        displayName: 'Essential Primary Hypertension',
        icdCode: 'I10',
        diagnosisType: 'CONFIRMED',
        primaryDiagnosis: false,
        sourceDocId: docId,
        sourceDocName: docName,
        diagnosedDate: todayIso,
        provenance: {
          provenanceSource: 'Email Integration - Anthem Blue Cross',
          provenanceType: 'EMAIL_INSURANCE_CLAIM',
          sourceTrustScore: 0.95
        }
      });
    }

    if (diagnoses.length === 0) {
      diagnoses.push({
        id: 'dx-claim-evaluation',
        displayName: 'Health Insurance Claim Evaluation',
        diagnosisType: 'CONFIRMED',
        primaryDiagnosis: true,
        sourceDocId: docId,
        sourceDocName: docName,
        diagnosedDate: todayIso,
        provenance: {
          provenanceSource: 'Email Integration',
          provenanceType: 'EMAIL_INSURANCE_CLAIM',
          sourceTrustScore: 0.95
        }
      });
    }

    findings.push({
      id: `${docId}-f-claim-1`,
      heading: 'Claim Processing Summary',
      text: 'Parsed Explanation of Benefits (EOB) insurance claim details.',
      severity: 'normal'
    });

    return {
      summary: 'Insurance claim & Explanation of Benefits (EOB) statement evaluated.',
      biomarkers: [],
      medications,
      findings,
      diagnoses,
      symptoms,
      rawEntities: { claimType: 'EOB Statement' },
      confidenceScore: 0.96
    };
  }
}
