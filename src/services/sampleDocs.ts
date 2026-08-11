import { ProcessedDocument } from '../core/types';

export const SAMPLE_MEDICAL_DOCUMENTS: ProcessedDocument[] = [
  {
    id: 'sample-lab-2026-jan',
    filename: 'LabResult_CBC_Metabolic_Jan2026.pdf',
    fileSize: 142850,
    mimeType: 'application/pdf',
    uploadTimestamp: '2026-01-15T09:30:00Z',
    rawOcrText: `DIAGNOSTIC METABOLIC & CBC LABORATORY REPORT
Patient: Alex Morgan | DOB: 1985-04-12 | Sex: M
Ordering Physician: Dr. Sarah Jenkins, MD
Collection Date: 2026-01-15 08:00 AM

COMPREHENSIVE METABOLIC PANEL (CMP):
Test Name              Result     Reference Range      Units    Status
Glucose                118.0      70.0 - 99.0          mg/dL    HIGH
Hemoglobin A1c         6.2        4.0 - 5.6            %        HIGH
Total Cholesterol      215.0      125.0 - 200.0        mg/dL    HIGH
HDL Cholesterol        42.0       40.0 - 60.0          mg/dL    NORMAL
LDL Cholesterol        138.0      0.0 - 100.0          mg/dL    HIGH

COMPLETE BLOOD COUNT (CBC):
Hemoglobin             14.2       12.0 - 17.5          g/dL     NORMAL
White Blood Cell       6.8        4.5 - 11.0           K/uL     NORMAL
Platelets              240.0      150.0 - 450.0        K/uL     NORMAL

Physician Notes: Fasting blood glucose elevated. Mild HbA1c elevation consistent with prediabetes. Recommend dietary modifications and follow-up panel in 3 months.`,
    ocrEngineUsed: 'pdfjs-native',
    classification: {
      classId: 'lab-result',
      categoryName: 'Lab Result',
      confidence: 0.98,
      matchingSignals: ['Matches lab biomarker keyword: "glucose"', 'Matches lab biomarker keyword: "hba1c"', 'Matches lab biomarker keyword: "reference range"'],
      registeredByAgent: 'Lab Data Extractor Agent'
    },
    extractedPayload: {
      patientName: 'Alex Morgan',
      dob: '1985-04-12',
      providerName: 'Dr. Sarah Jenkins, MD',
      facilityName: 'Metro Diagnostic Laboratories',
      documentDate: '2026-01-15',
      summary: 'Metabolic & CBC bloodwork showing elevated Glucose (118.0 mg/dL), HbA1c (6.2%), and Total Cholesterol (215.0 mg/dL).',
      biomarkers: [
        { id: 'sb-1', canonicalName: 'Glucose', loincCode: '2345-7', value: 118.0, unit: 'mg/dL', refRangeMin: 70, refRangeMax: 99, refRangeText: '70-99 mg/dL', status: 'HIGH', timestamp: '2026-01-15T09:30:00Z', sourceDocId: 'sample-lab-2026-jan', sourceDocName: 'LabResult_CBC_Metabolic_Jan2026.pdf', category: 'Blood Chemistry' },
        { id: 'sb-2', canonicalName: 'Hemoglobin A1c', loincCode: '4548-4', value: 6.2, unit: '%', refRangeMin: 4.0, refRangeMax: 5.6, refRangeText: '4.0-5.6 %', status: 'HIGH', timestamp: '2026-01-15T09:30:00Z', sourceDocId: 'sample-lab-2026-jan', sourceDocName: 'LabResult_CBC_Metabolic_Jan2026.pdf', category: 'Blood Chemistry' },
        { id: 'sb-3', canonicalName: 'Total Cholesterol', loincCode: '2093-3', value: 215.0, unit: 'mg/dL', refRangeMin: 125, refRangeMax: 200, refRangeText: '125-200 mg/dL', status: 'HIGH', timestamp: '2026-01-15T09:30:00Z', sourceDocId: 'sample-lab-2026-jan', sourceDocName: 'LabResult_CBC_Metabolic_Jan2026.pdf', category: 'Lipid Panel' },
        { id: 'sb-4', canonicalName: 'Hemoglobin', loincCode: '718-7', value: 14.2, unit: 'g/dL', refRangeMin: 12.0, refRangeMax: 17.5, refRangeText: '12.0-17.5 g/dL', status: 'NORMAL', timestamp: '2026-01-15T09:30:00Z', sourceDocId: 'sample-lab-2026-jan', sourceDocName: 'LabResult_CBC_Metabolic_Jan2026.pdf', category: 'CBC' }
      ],
      medications: [],
      findings: [{ id: 'f-1', heading: 'Physician Note', text: 'Elevated glucose and HbA1c. Dietary consultation advised.', severity: 'warning' }],
      rawEntities: { labCount: '4' },
      confidenceScore: 0.98
    }
  },
  {
    id: 'sample-lab-2026-jun',
    filename: 'Followup_LabResult_Jun2026.pdf',
    fileSize: 135400,
    mimeType: 'application/pdf',
    uploadTimestamp: '2026-06-20T10:15:00Z',
    rawOcrText: `FOLLOW-UP LABORATORY RESULTS
Patient: Alex Morgan | DOB: 1985-04-12
Ordering Provider: Dr. Sarah Jenkins, MD
Date: 2026-06-20

RE-EVALUATION METABOLIC PANEL:
Glucose: 94.0 mg/dL (Reference: 70.0 - 99.0) -> NORMAL
Hemoglobin A1c: 5.5 % (Reference: 4.0 - 5.6) -> NORMAL
Total Cholesterol: 188.0 mg/dL (Reference: 125.0 - 200.0) -> NORMAL
Hemoglobin: 14.5 g/dL (Reference: 12.0 - 17.5) -> NORMAL

Clinical Note: Outstanding progress following lifestyle modifications and Metformin therapy. Biomarkers normalized to reference ranges.`,
    ocrEngineUsed: 'pdfjs-native',
    classification: {
      classId: 'lab-result',
      categoryName: 'Lab Result',
      confidence: 0.96,
      matchingSignals: ['Matches lab biomarker keyword: "glucose"', 'Matches lab biomarker keyword: "hba1c"'],
      registeredByAgent: 'Lab Data Extractor Agent'
    },
    extractedPayload: {
      patientName: 'Alex Morgan',
      dob: '1985-04-12',
      providerName: 'Dr. Sarah Jenkins, MD',
      facilityName: 'Metro Diagnostic Laboratories',
      documentDate: '2026-06-20',
      summary: 'Follow-up lab result showing complete normalization of Glucose (94.0 mg/dL), HbA1c (5.5%), and Cholesterol (188.0 mg/dL).',
      biomarkers: [
        { id: 'sb-5', canonicalName: 'Glucose', loincCode: '2345-7', value: 94.0, unit: 'mg/dL', refRangeMin: 70, refRangeMax: 99, refRangeText: '70-99 mg/dL', status: 'NORMAL', timestamp: '2026-06-20T10:15:00Z', sourceDocId: 'sample-lab-2026-jun', sourceDocName: 'Followup_LabResult_Jun2026.pdf', category: 'Blood Chemistry' },
        { id: 'sb-6', canonicalName: 'Hemoglobin A1c', loincCode: '4548-4', value: 5.5, unit: '%', refRangeMin: 4.0, refRangeMax: 5.6, refRangeText: '4.0-5.6 %', status: 'NORMAL', timestamp: '2026-06-20T10:15:00Z', sourceDocId: 'sample-lab-2026-jun', sourceDocName: 'Followup_LabResult_Jun2026.pdf', category: 'Blood Chemistry' },
        { id: 'sb-7', canonicalName: 'Total Cholesterol', loincCode: '2093-3', value: 188.0, unit: 'mg/dL', refRangeMin: 125, refRangeMax: 200, refRangeText: '125-200 mg/dL', status: 'NORMAL', timestamp: '2026-06-20T10:15:00Z', sourceDocId: 'sample-lab-2026-jun', sourceDocName: 'Followup_LabResult_Jun2026.pdf', category: 'Lipid Panel' },
        { id: 'sb-8', canonicalName: 'Hemoglobin', loincCode: '718-7', value: 14.5, unit: 'g/dL', refRangeMin: 12.0, refRangeMax: 17.5, refRangeText: '12.0-17.5 g/dL', status: 'NORMAL', timestamp: '2026-06-20T10:15:00Z', sourceDocId: 'sample-lab-2026-jun', sourceDocName: 'Followup_LabResult_Jun2026.pdf', category: 'CBC' }
      ],
      medications: [],
      findings: [{ id: 'f-2', heading: 'Followup Progress', text: 'Biomarkers normalized to reference ranges.', severity: 'normal' }],
      rawEntities: { labCount: '4' },
      confidenceScore: 0.96
    }
  },
  {
    id: 'sample-rx-1',
    filename: 'Prescription_Metformin_Feb2026.png',
    fileSize: 98200,
    mimeType: 'image/png',
    uploadTimestamp: '2026-02-01T14:00:00Z',
    rawOcrText: `METRO HEALTH PHARMACY REQUISITION
Rx #: 9841204
Patient: Alex Morgan | DOB: 1985-04-12
Prescriber: Dr. Sarah Jenkins, MD (NPI: 1982347102)

Rx: Metformin HCl 500 mg oral tablet
Sig: Take 1 tablet orally twice daily with meals
Qty: 60 tablets | Refills: 3
Date Prescribed: 2026-02-01`,
    ocrEngineUsed: 'tesseract-wasm',
    classification: {
      classId: 'prescription',
      categoryName: 'Prescription',
      confidence: 0.95,
      matchingSignals: ['Matches prescription indicator: "rx"', 'Matches prescription indicator: "sig:"', 'Matches prescription indicator: "refill"'],
      registeredByAgent: 'Pharmacy Subagent'
    },
    extractedPayload: {
      patientName: 'Alex Morgan',
      dob: '1985-04-12',
      providerName: 'Dr. Sarah Jenkins, MD',
      facilityName: 'Metro Health Pharmacy',
      documentDate: '2026-02-01',
      summary: 'Prescription order for Metformin HCl 500 mg oral tablet (twice daily with meals).',
      biomarkers: [],
      medications: [
        { id: 'm-1', drugName: 'Metformin HCl', dosage: '500 mg', frequency: 'Twice daily with meals', route: 'Oral', refills: 3, prescriber: 'Dr. Sarah Jenkins, MD', startDate: '2026-02-01', sourceDocId: 'sample-rx-1', sourceDocName: 'Prescription_Metformin_Feb2026.png' }
      ],
      findings: [],
      rawEntities: { rxCount: '1' },
      confidenceScore: 0.95
    }
  },
  {
    id: 'sample-imaging-1',
    filename: 'Chest_XRay_Radiology_Result.pdf',
    fileSize: 210400,
    mimeType: 'application/pdf',
    uploadTimestamp: '2026-03-10T11:20:00Z',
    rawOcrText: `DEPARTMENT OF RADIOLOGY - CHEST X-RAY (CXR)
Patient Name: Alex Morgan | DOB: 1985-04-12
Radiologist: Dr. Robert Vance, MD
Date of Exam: 2026-03-10

TECHNIQUE: PA and lateral views of the chest.
INDICATION: Persistent mild cough following upper respiratory tract infection.

FINDINGS:
Lungs are clear bilaterally without focal consolidation, pleural effusion, or pneumothorax. Cardiomediastinal silhouette is within normal limits. Osseous structures are intact.

IMPRESSION:
Normal two-view chest radiograph. No acute cardiopulmonary process identified.`,
    ocrEngineUsed: 'pdfjs-native',
    classification: {
      classId: 'imaging-result',
      categoryName: 'Imaging Result',
      confidence: 0.97,
      matchingSignals: ['Matches radiology keyword: "x-ray"', 'Matches radiology keyword: "radiology report"', 'Matches radiology keyword: "impression:"'],
      registeredByAgent: 'Core Medical Agent'
    },
    extractedPayload: {
      patientName: 'Alex Morgan',
      dob: '1985-04-12',
      providerName: 'Dr. Robert Vance, MD',
      facilityName: 'Metro Radiology Imaging Center',
      documentDate: '2026-03-10',
      summary: 'Chest X-Ray radiology report showing clear lungs bilaterally and normal cardiac silhouette.',
      biomarkers: [],
      medications: [],
      findings: [
        { id: 'f-3', heading: 'Impression', text: 'Normal two-view chest radiograph. No acute cardiopulmonary process.', severity: 'normal' },
        { id: 'f-4', heading: 'Findings', text: 'Lungs clear bilaterally without focal consolidation or effusion.', severity: 'info' }
      ],
      rawEntities: { modality: 'Chest X-Ray' },
      confidenceScore: 0.97
    }
  },
  {
    id: 'sample-referral-1',
    filename: 'Endocrinology_Referral_Letter.pdf',
    fileSize: 115200,
    mimeType: 'application/pdf',
    uploadTimestamp: '2026-04-05T15:45:00Z',
    rawOcrText: `OUTBOUND SPECIALIST REFERRAL LETTER
Referring Physician: Dr. Sarah Jenkins, MD (Family Medicine)
Referred Specialty: Endocrinology & Metabolic Health Clinic
Patient: Alex Morgan | DOB: 1985-04-12

REASON FOR REFERRAL:
Specialist consultation requested for metabolic risk stratification and long-term glycemic management optimization. Patient has demonstrated positive initial response to lifestyle and Metformin. Please evaluate for continuous glucose monitor monitoring strategy.`,
    ocrEngineUsed: 'pdfjs-native',
    classification: {
      classId: 'referral',
      categoryName: 'Referral',
      confidence: 0.93,
      matchingSignals: ['Matches referral term: "referral"', 'Matches referral term: "reason for referral"'],
      registeredByAgent: 'Care Coordination Subagent'
    },
    extractedPayload: {
      patientName: 'Alex Morgan',
      dob: '1985-04-12',
      providerName: 'Dr. Sarah Jenkins, MD',
      facilityName: 'Endocrinology & Metabolic Health Clinic',
      documentDate: '2026-04-05',
      summary: 'Outbound specialist referral to Endocrinology for metabolic risk optimization.',
      biomarkers: [],
      medications: [],
      findings: [
        { id: 'f-5', heading: 'Reason for Referral', text: 'Specialist consultation for continuous glucose monitoring strategy.', severity: 'info' }
      ],
      rawEntities: { specialty: 'Endocrinology' },
      confidenceScore: 0.93
    }
  }
];
