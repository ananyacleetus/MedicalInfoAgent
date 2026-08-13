import { BaseMedicalDocumentClass, BiomarkerObservation, DiagnosisEntry, ExtractedMedicalPayload, StandardMedicalCategory, SymptomEntry } from '../types';

export class LabResultClass extends BaseMedicalDocumentClass {
  readonly classId = 'lab-result';
  readonly displayName: StandardMedicalCategory = 'Lab Result';
  readonly description = 'Diagnostic bloodwork, metabolic panels, CBCs, urinalysis, and pathology lab measurements.';
  readonly iconName = 'TestTube';
  readonly colorAccent = '#8b5cf6';
  readonly categoryGroup = 'Diagnostic' as const;
  readonly defaultRegisteredAgent = 'Lab Data Extractor Agent';

  evaluateMatch(ocrText: string): { confidence: number; matchingSignals: string[] } {
    const textLower = ocrText.toLowerCase();
    const signals: string[] = [];

    const keywords = [
      'lab report', 'laboratory result', 'reference range', 'flag', 'cbc',
      'metabolic panel', 'glucose', 'hba1c', 'cholesterol', 'triglycerides',
      'hemoglobin', 'wbc', 'platelets', 'specimen', 'collected:'
    ];

    keywords.forEach(kw => {
      if (textLower.includes(kw)) {
        signals.push(`Matches lab biomarker keyword: "${kw}"`);
      }
    });

    let confidence = 0;
    if (signals.length >= 4) confidence = 0.98;
    else if (signals.length >= 2) confidence = 0.80;
    else if (signals.length === 1) confidence = 0.40;
    else confidence = 0.05;

    return { confidence, matchingSignals: signals };
  }

  parsePayload(ocrText: string, docId: string, docName: string): ExtractedMedicalPayload {
    const biomarkers: BiomarkerObservation[] = [];
    const diagnoses: DiagnosisEntry[] = [];
    const symptoms: SymptomEntry[] = [];

    const labDefinitions = [
      { name: 'Glucose', loinc: '2345-7', unit: 'mg/dL', min: 70, max: 99, regex: /glucose\s+([0-9.]+)/i },
      { name: 'Hemoglobin A1c', loinc: '4548-4', unit: '%', min: 4.0, max: 5.6, regex: /(?:hba1c|hemoglobin a1c|a1c)\s+([0-9.]+)/i },
      { name: 'Total Cholesterol', loinc: '2093-3', unit: 'mg/dL', min: 125, max: 200, regex: /(?:total cholesterol|cholesterol)\s+([0-9.]+)/i },
      { name: 'LDL Cholesterol', loinc: '13457-7', unit: 'mg/dL', min: 0, max: 100, regex: /ldl\s*(?:cholesterol)?\s+([0-9.]+)/i },
      { name: 'HDL Cholesterol', loinc: '2085-9', unit: 'mg/dL', min: 40, max: 60, regex: /hdl\s*(?:cholesterol)?\s+([0-9.]+)/i },
      { name: 'Hemoglobin', loinc: '718-7', unit: 'g/dL', min: 12.0, max: 17.5, regex: /hemoglobin\s+([0-9.]+)/i },
      { name: 'White Blood Cell Count (WBC)', loinc: '6690-2', unit: 'K/uL', min: 4.5, max: 11.0, regex: /(?:wbc|white blood cell)\s+([0-9.]+)/i },
      { name: 'Platelets', loinc: '777-3', unit: 'K/uL', min: 150, max: 450, regex: /platelets\s+([0-9.]+)/i }
    ];

    const todayIso = new Date().toISOString();

    labDefinitions.forEach((def, index) => {
      const match = ocrText.match(def.regex);
      if (match && match[1]) {
        const val = parseFloat(match[1]);
        if (!isNaN(val)) {
          let status: BiomarkerObservation['status'] = 'NORMAL';
          if (val > def.max) status = val > def.max * 1.3 ? 'CRITICAL' : 'HIGH';
          else if (val < def.min) status = val < def.min * 0.7 ? 'CRITICAL' : 'LOW';

          biomarkers.push({
            id: `${docId}-bio-${index}`,
            canonicalName: def.name,
            loincCode: def.loinc,
            value: val,
            unit: def.unit,
            refRangeMin: def.min,
            refRangeMax: def.max,
            refRangeText: `${def.min}-${def.max} ${def.unit}`,
            status,
            timestamp: todayIso,
            sourceDocId: docId,
            sourceDocName: docName,
            category: 'Blood Chemistry'
          });
        }
      }
    });

    // Check for metabolic/prediabetes signals
    if (ocrText.toLowerCase().includes('prediabetes') || ocrText.toLowerCase().includes('glucose elevated')) {
      diagnoses.push({
        id: 'dx-prediabetes',
        displayName: 'Prediabetes (Impaired Fasting Glucose)',
        icdCode: 'R73.09',
        diagnosisType: 'SUSPECTED',
        primaryDiagnosis: true,
        sourceDocId: docId,
        sourceDocName: docName,
        diagnosedDate: todayIso.substring(0, 10)
      });
    } else {
      diagnoses.push({
        id: 'dx-routine-lab',
        displayName: 'Routine Diagnostic Bloodwork Evaluation',
        diagnosisType: 'CONFIRMED',
        primaryDiagnosis: true,
        sourceDocId: docId,
        sourceDocName: docName,
        diagnosedDate: todayIso.substring(0, 10)
      });
    }

    return {
      summary: `Parsed lab result containing ${biomarkers.length} biomarker observations.`,
      biomarkers,
      medications: [],
      findings: [],
      diagnoses,
      symptoms,
      rawEntities: { labCount: String(biomarkers.length) },
      confidenceScore: 0.95
    };
  }
}

