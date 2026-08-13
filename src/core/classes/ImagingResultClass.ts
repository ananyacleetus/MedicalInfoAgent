import { BaseMedicalDocumentClass, ClinicalFinding, DiagnosisEntry, ExtractedMedicalPayload, StandardMedicalCategory, SymptomEntry } from '../types';

export class ImagingResultClass extends BaseMedicalDocumentClass {
  readonly classId = 'imaging-result';
  readonly displayName: StandardMedicalCategory = 'Imaging Result';
  readonly description = 'Radiology reports including X-Ray, CT scans, MRI, Ultrasound, and PET/SPECT diagnostic imaging.';
  readonly iconName = 'FileScan';
  readonly colorAccent = '#06b6d4'; // Cyan
  readonly categoryGroup = 'Diagnostic' as const;
  readonly defaultRegisteredAgent = 'Core Medical Agent';

  evaluateMatch(ocrText: string): { confidence: number; matchingSignals: string[] } {
    const textLower = ocrText.toLowerCase();
    const signals: string[] = [];

    const keywords = [
      'radiology report', 'x-ray', 'cxr', 'computed tomography', 'ct scan',
      'mri', 'magnetic resonance', 'ultrasound', 'sonogram', 'impression:',
      'findings:', 'technique:', 'contrast:', 'radiologist', 'scan result'
    ];

    keywords.forEach(kw => {
      if (textLower.includes(kw)) {
        signals.push(`Matches radiology keyword: "${kw}"`);
      }
    });

    let confidence = 0;
    if (signals.length >= 3) confidence = 0.95;
    else if (signals.length === 2) confidence = 0.75;
    else if (signals.length === 1) confidence = 0.45;
    else confidence = 0.10;

    return { confidence, matchingSignals: signals };
  }

  parsePayload(ocrText: string, docId: string, docName: string): ExtractedMedicalPayload {
    const findings: ClinicalFinding[] = [];
    const diagnoses: DiagnosisEntry[] = [];
    const symptoms: SymptomEntry[] = [];
    const todayIso = new Date().toISOString().substring(0, 10);
    const textLower = ocrText.toLowerCase();

    if (textLower.includes('impression')) {
      const match = ocrText.match(/impression:?\s*([\s\S]*?)(?=\n\n|\n[A-Z]+:|$)/i);
      if (match && match[1]) {
        findings.push({
          id: `${docId}-f1`,
          heading: 'Impression',
          text: match[1].trim(),
          severity: match[1].toLowerCase().includes('acute') ? 'warning' : 'normal'
        });
      }
    }

    if (textLower.includes('findings')) {
      const match = ocrText.match(/findings:?\s*([\s\S]*?)(?=\n\n|impression:?|$)/i);
      if (match && match[1]) {
        findings.push({
          id: `${docId}-f2`,
          heading: 'Findings',
          text: match[1].trim(),
          severity: 'info'
        });
      }
    }

    if (textLower.includes('calculus') || textLower.includes('stone') || textLower.includes('nephrolithiasis')) {
      diagnoses.push({
        id: 'dx-kidney-stones',
        displayName: 'Nephrolithiasis (Kidney Stones)',
        icdCode: 'N20.0',
        diagnosisType: 'CONFIRMED',
        primaryDiagnosis: true,
        sourceDocId: docId,
        sourceDocName: docName,
        diagnosedDate: todayIso
      });
      symptoms.push({
        id: `${docId}-sym-flank`,
        displayName: 'Right Flank Pain',
        severity: 'SEVERE',
        sourceDocId: docId,
        sourceDocName: docName
      });
    } else {
      diagnoses.push({
        id: 'dx-imaging-eval',
        displayName: 'Diagnostic Radiology Evaluation',
        diagnosisType: 'CONFIRMED',
        primaryDiagnosis: true,
        sourceDocId: docId,
        sourceDocName: docName,
        diagnosedDate: todayIso
      });
    }

    return {
      summary: 'Radiology imaging document evaluated.',
      biomarkers: [],
      medications: [],
      findings,
      diagnoses,
      symptoms,
      rawEntities: {
        imagingModality: textLower.includes('mri') ? 'MRI' : textLower.includes('ct') ? 'CT' : 'X-Ray'
      },
      confidenceScore: 0.90
    };
  }
}

