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
        { id: 'sb-1', canonicalName: 'Glucose', loincCode: '2345-7', value: 118.0, unit: 'mg/dL', refRangeMin: 70, refRangeMax: 99, refRangeText: '70-99 mg/dL', status: 'HIGH', timestamp: '2026-01-15T09:30:00Z', sourceDocId: 'sample-lab-2026-jan', sourceDocName: 'LabResult_CBC_Metabolic_Jan2026.pdf', category: 'Blood Chemistry', relatedDiagnoses: ['dx-prediabetes'] },
        { id: 'sb-2', canonicalName: 'Hemoglobin A1c', loincCode: '4548-4', value: 6.2, unit: '%', refRangeMin: 4.0, refRangeMax: 5.6, refRangeText: '4.0-5.6 %', status: 'HIGH', timestamp: '2026-01-15T09:30:00Z', sourceDocId: 'sample-lab-2026-jan', sourceDocName: 'LabResult_CBC_Metabolic_Jan2026.pdf', category: 'Blood Chemistry', relatedDiagnoses: ['dx-prediabetes'] },
        { id: 'sb-3', canonicalName: 'Total Cholesterol', loincCode: '2093-3', value: 215.0, unit: 'mg/dL', refRangeMin: 125, refRangeMax: 200, refRangeText: '125-200 mg/dL', status: 'HIGH', timestamp: '2026-01-15T09:30:00Z', sourceDocId: 'sample-lab-2026-jan', sourceDocName: 'LabResult_CBC_Metabolic_Jan2026.pdf', category: 'Lipid Panel', relatedDiagnoses: ['dx-hyperlipidemia'] },
        { id: 'sb-4', canonicalName: 'Hemoglobin', loincCode: '718-7', value: 14.2, unit: 'g/dL', refRangeMin: 12.0, refRangeMax: 17.5, refRangeText: '12.0-17.5 g/dL', status: 'NORMAL', timestamp: '2026-01-15T09:30:00Z', sourceDocId: 'sample-lab-2026-jan', sourceDocName: 'LabResult_CBC_Metabolic_Jan2026.pdf', category: 'CBC' }
      ],
      medications: [],
      findings: [{ id: 'f-1', heading: 'Physician Note', text: 'Elevated glucose and HbA1c. Dietary consultation advised.', severity: 'warning' }],
      diagnoses: [
        { id: 'dx-prediabetes', displayName: 'Prediabetes (Impaired Fasting Glucose)', icdCode: 'R73.09', diagnosisType: 'SUSPECTED', primaryDiagnosis: true, sourceDocId: 'sample-lab-2026-jan', sourceDocName: 'LabResult_CBC_Metabolic_Jan2026.pdf', diagnosedDate: '2026-01-15', provider: 'Dr. Sarah Jenkins, MD' },
        { id: 'dx-hyperlipidemia', displayName: 'Hyperlipidemia', icdCode: 'E78.5', diagnosisType: 'CONFIRMED', primaryDiagnosis: false, sourceDocId: 'sample-lab-2026-jan', sourceDocName: 'LabResult_CBC_Metabolic_Jan2026.pdf', diagnosedDate: '2026-01-15', provider: 'Dr. Sarah Jenkins, MD' }
      ],
      symptoms: [
        { id: 'sym-jan-1', displayName: 'Mild Fatigue', severity: 'MILD', sourceDocId: 'sample-lab-2026-jan', sourceDocName: 'LabResult_CBC_Metabolic_Jan2026.pdf' }
      ],
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
        { id: 'sb-5', canonicalName: 'Glucose', loincCode: '2345-7', value: 94.0, unit: 'mg/dL', refRangeMin: 70, refRangeMax: 99, refRangeText: '70-99 mg/dL', status: 'NORMAL', timestamp: '2026-06-20T10:15:00Z', sourceDocId: 'sample-lab-2026-jun', sourceDocName: 'Followup_LabResult_Jun2026.pdf', category: 'Blood Chemistry', relatedDiagnoses: ['dx-prediabetes'] },
        { id: 'sb-6', canonicalName: 'Hemoglobin A1c', loincCode: '4548-4', value: 5.5, unit: '%', refRangeMin: 4.0, refRangeMax: 5.6, refRangeText: '4.0-5.6 %', status: 'NORMAL', timestamp: '2026-06-20T10:15:00Z', sourceDocId: 'sample-lab-2026-jun', sourceDocName: 'Followup_LabResult_Jun2026.pdf', category: 'Blood Chemistry', relatedDiagnoses: ['dx-prediabetes'] },
        { id: 'sb-7', canonicalName: 'Total Cholesterol', loincCode: '2093-3', value: 188.0, unit: 'mg/dL', refRangeMin: 125, refRangeMax: 200, refRangeText: '125-200 mg/dL', status: 'NORMAL', timestamp: '2026-06-20T10:15:00Z', sourceDocId: 'sample-lab-2026-jun', sourceDocName: 'Followup_LabResult_Jun2026.pdf', category: 'Lipid Panel', relatedDiagnoses: ['dx-hyperlipidemia'] },
        { id: 'sb-8', canonicalName: 'Hemoglobin', loincCode: '718-7', value: 14.5, unit: 'g/dL', refRangeMin: 12.0, refRangeMax: 17.5, refRangeText: '12.0-17.5 g/dL', status: 'NORMAL', timestamp: '2026-06-20T10:15:00Z', sourceDocId: 'sample-lab-2026-jun', sourceDocName: 'Followup_LabResult_Jun2026.pdf', category: 'CBC' }
      ],
      medications: [],
      findings: [{ id: 'f-2', heading: 'Followup Progress', text: 'Biomarkers normalized to reference ranges.', severity: 'normal' }],
      diagnoses: [
        { id: 'dx-prediabetes', displayName: 'Prediabetes (Impaired Fasting Glucose)', icdCode: 'R73.09', diagnosisType: 'HISTORICAL', primaryDiagnosis: true, sourceDocId: 'sample-lab-2026-jun', sourceDocName: 'Followup_LabResult_Jun2026.pdf', diagnosedDate: '2026-06-20', provider: 'Dr. Sarah Jenkins, MD' }
      ],
      symptoms: [],
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
        {
          id: 'm-1',
          drugName: 'Metformin HCl',
          dosage: '500 mg',
          frequency: 'Twice daily with meals',
          route: 'Oral',
          refills: 3,
          prescriber: 'Dr. Sarah Jenkins, MD',
          startDate: '2026-02-01',
          sourceDocId: 'sample-rx-1',
          sourceDocName: 'Prescription_Metformin_Feb2026.png',
          diagnoses: [
            { id: 'dx-prediabetes', displayName: 'Prediabetes (Off-label insulin sensitization)', icdCode: 'R73.09', diagnosisType: 'CONFIRMED', primaryDiagnosis: true, relevantUse: 'Off-label prediabetes prevention & glycemic control', sourceDocId: 'sample-rx-1', sourceDocName: 'Prescription_Metformin_Feb2026.png', diagnosedDate: '2026-02-01' }
          ]
        }
      ],
      findings: [],
      diagnoses: [
        { id: 'dx-prediabetes', displayName: 'Prediabetes (Impaired Fasting Glucose)', icdCode: 'R73.09', diagnosisType: 'CONFIRMED', primaryDiagnosis: true, sourceDocId: 'sample-rx-1', sourceDocName: 'Prescription_Metformin_Feb2026.png', diagnosedDate: '2026-02-01' }
      ],
      symptoms: [],
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
      diagnoses: [
        { id: 'dx-uri-post', displayName: 'Post-Viral Acute Upper Respiratory Tract Infection', icdCode: 'J06.9', diagnosisType: 'HISTORICAL', primaryDiagnosis: true, sourceDocId: 'sample-imaging-1', sourceDocName: 'Chest_XRay_Radiology_Result.pdf', diagnosedDate: '2026-03-10' }
      ],
      symptoms: [
        { id: 'sym-cough-1', displayName: 'Persistent Mild Cough', severity: 'MILD', sourceDocId: 'sample-imaging-1', sourceDocName: 'Chest_XRay_Radiology_Result.pdf' }
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
      diagnoses: [
        { id: 'dx-prediabetes', displayName: 'Prediabetes & Metabolic Risk', icdCode: 'R73.09', diagnosisType: 'CONFIRMED', primaryDiagnosis: true, sourceDocId: 'sample-referral-1', sourceDocName: 'Endocrinology_Referral_Letter.pdf', diagnosedDate: '2026-04-05' }
      ],
      symptoms: [],
      rawEntities: { specialty: 'Endocrinology' },
      confidenceScore: 0.93
    }
  },
  {
    id: 'sample-rx-2-escalation',
    filename: 'Prescription_Metformin_Lisinopril_May2026.pdf',
    fileSize: 104500,
    mimeType: 'application/pdf',
    uploadTimestamp: '2026-05-10T11:00:00Z',
    rawOcrText: `METRO HEALTH PHARMACY - REVISED PRESCRIPTION
Patient: Alex Morgan | DOB: 1985-04-12
Prescriber: Dr. Sarah Jenkins, MD

Rx 1: Metformin HCl 1000 mg Oral Tablet (DOSAGE ADJUSTMENT)
Sig: Take 1 tablet orally twice daily with morning and evening meals
Qty: 60 tablets | Refills: 5 | Date: 2026-05-10

Rx 2: Lisinopril 10 mg Oral Tablet
Sig: Take 1 tablet orally once daily in the morning for blood pressure regulation
Qty: 30 tablets | Refills: 5 | Date: 2026-05-10`,
    ocrEngineUsed: 'pdfjs-native',
    classification: {
      classId: 'prescription',
      categoryName: 'Prescription',
      confidence: 0.97,
      matchingSignals: ['Matches prescription indicator: "rx"', 'Matches prescription indicator: "sig:"'],
      registeredByAgent: 'Pharmacy Subagent'
    },
    extractedPayload: {
      patientName: 'Alex Morgan',
      dob: '1985-04-12',
      providerName: 'Dr. Sarah Jenkins, MD',
      facilityName: 'Metro Health Pharmacy',
      documentDate: '2026-05-10',
      summary: 'Revised prescription increasing Metformin to 1000 mg twice daily and adding Lisinopril 10 mg daily.',
      biomarkers: [],
      medications: [
        {
          id: 'm-2',
          drugName: 'Metformin HCl',
          dosage: '1000 mg',
          frequency: 'Twice daily with meals',
          route: 'Oral',
          refills: 5,
          prescriber: 'Dr. Sarah Jenkins, MD',
          startDate: '2026-05-10',
          status: 'MODIFIED',
          sourceDocId: 'sample-rx-2-escalation',
          sourceDocName: 'Prescription_Metformin_Lisinopril_May2026.pdf',
          diagnoses: [
            { id: 'dx-diabetes-t2', displayName: 'Type 2 Diabetes Mellitus', icdCode: 'E11.9', diagnosisType: 'CONFIRMED', primaryDiagnosis: true, relevantUse: 'Glycemic control & insulin sensitization', sourceDocId: 'sample-rx-2-escalation', sourceDocName: 'Prescription_Metformin_Lisinopril_May2026.pdf', diagnosedDate: '2026-05-10' }
          ]
        },
        {
          id: 'm-3',
          drugName: 'Lisinopril',
          dosage: '10 mg',
          frequency: 'Once daily',
          route: 'Oral',
          refills: 5,
          prescriber: 'Dr. Sarah Jenkins, MD',
          startDate: '2026-05-10',
          status: 'ACTIVE',
          sourceDocId: 'sample-rx-2-escalation',
          sourceDocName: 'Prescription_Metformin_Lisinopril_May2026.pdf',
          diagnoses: [
            { id: 'dx-hypertension', displayName: 'Essential Primary Hypertension', icdCode: 'I10', diagnosisType: 'CONFIRMED', primaryDiagnosis: true, relevantUse: 'Renal protection & blood pressure control', sourceDocId: 'sample-rx-2-escalation', sourceDocName: 'Prescription_Metformin_Lisinopril_May2026.pdf', diagnosedDate: '2026-05-10' }
          ]
        }
      ],
      findings: [],
      diagnoses: [
        { id: 'dx-diabetes-t2', displayName: 'Type 2 Diabetes Mellitus', icdCode: 'E11.9', diagnosisType: 'CONFIRMED', primaryDiagnosis: true, sourceDocId: 'sample-rx-2-escalation', sourceDocName: 'Prescription_Metformin_Lisinopril_May2026.pdf', diagnosedDate: '2026-05-10' },
        { id: 'dx-hypertension', displayName: 'Essential Primary Hypertension', icdCode: 'I10', diagnosisType: 'CONFIRMED', primaryDiagnosis: false, sourceDocId: 'sample-rx-2-escalation', sourceDocName: 'Prescription_Metformin_Lisinopril_May2026.pdf', diagnosedDate: '2026-05-10' }
      ],
      symptoms: [],
      rawEntities: { rxCount: '2' },
      confidenceScore: 0.97
    }
  },
  {
    id: 'sample-visit-cardiology',
    filename: 'Cardiology_Consultation_VisitSummary.pdf',
    fileSize: 184200,
    mimeType: 'application/pdf',
    uploadTimestamp: '2026-06-12T14:30:00Z',
    rawOcrText: `METRO CARDIOLOGY SPECIALIST CLINIC - VISIT SUMMARY
Patient: Alex Morgan | DOB: 1985-04-12
Attending Physician: Dr. Marcus Vance, MD (Cardiology)
Date of Visit: 2026-06-12

CHIEF COMPLAINT & IMPRESSION:
Follow-up for mild blood pressure elevation. Patient is currently on Lisinopril 10 mg daily and Metformin 1000 mg BID.

MEDICATION ORDERS & RECONCILIATION:
1. Spironolactone 25 mg oral tablet - Take 1 tablet daily in the morning (Added for fluid & BP management).
2. Ibuprofen 400 mg oral tablet - Take PRN as needed for joint pain.
3. Glucophage (Metformin) 1000 mg - Re-confirmed daily regimen.

CLINICAL RECOMMENDATIONS:
Routine serum potassium and renal panel ordered in 2 weeks given concurrent Lisinopril and Spironolactone therapy.`,
    ocrEngineUsed: 'pdfjs-native',
    classification: {
      classId: 'visit-summary',
      categoryName: 'Visit Summary',
      confidence: 0.95,
      matchingSignals: ['Matches clinical note indicator: "visit summary"', 'Matches medication list indicator: "medication orders"'],
      registeredByAgent: 'Clinical Notes Subagent'
    },
    extractedPayload: {
      patientName: 'Alex Morgan',
      dob: '1985-04-12',
      providerName: 'Dr. Marcus Vance, MD',
      facilityName: 'Metro Cardiology Specialist Clinic',
      documentDate: '2026-06-12',
      summary: 'Cardiology consultation summary initiating Spironolactone 25 mg daily and Ibuprofen 400 mg PRN alongside Lisinopril and Glucophage.',
      biomarkers: [],
      medications: [
        { id: 'm-4', drugName: 'Spironolactone', dosage: '25 mg', frequency: 'Once daily', route: 'Oral', prescriber: 'Dr. Marcus Vance, MD', startDate: '2026-06-12', status: 'ACTIVE', sourceDocId: 'sample-visit-cardiology', sourceDocName: 'Cardiology_Consultation_VisitSummary.pdf' },
        { id: 'm-5', drugName: 'Ibuprofen', dosage: '400 mg', frequency: 'PRN as needed', route: 'Oral', prescriber: 'Dr. Marcus Vance, MD', startDate: '2026-06-12', status: 'ACTIVE', sourceDocId: 'sample-visit-cardiology', sourceDocName: 'Cardiology_Consultation_VisitSummary.pdf' },
        { id: 'm-6', drugName: 'Glucophage', dosage: '1000 mg', frequency: 'Twice daily', route: 'Oral', prescriber: 'Dr. Marcus Vance, MD', startDate: '2026-06-12', status: 'ACTIVE', sourceDocId: 'sample-visit-cardiology', sourceDocName: 'Cardiology_Consultation_VisitSummary.pdf' }
      ],
      findings: [
        { id: 'f-6', heading: 'Cardiology Recommendation', text: 'Monitor serum potassium and creatinine due to Lisinopril and Spironolactone combination.', severity: 'warning' }
      ],
      diagnoses: [
        { id: 'dx-hypertension', displayName: 'Essential Primary Hypertension', icdCode: 'I10', diagnosisType: 'CONFIRMED', primaryDiagnosis: true, sourceDocId: 'sample-visit-cardiology', sourceDocName: 'Cardiology_Consultation_VisitSummary.pdf', diagnosedDate: '2026-06-12' }
      ],
      symptoms: [
        { id: 'sym-card-1', displayName: 'Mild Peripheral Edema', severity: 'MILD', sourceDocId: 'sample-visit-cardiology', sourceDocName: 'Cardiology_Consultation_VisitSummary.pdf' }
      ],
      rawEntities: { specialty: 'Cardiology' },
      confidenceScore: 0.95
    }
  },

  /* ─────────────────────────────────────────────────────────────
     NEW: TEMPORAL EPISODE SCENARIO — KIDNEY STONES (BOUT #1: JAN 2026)
     ───────────────────────────────────────────────────────────── */
  {
    id: 'sample-ks-ct-jan',
    filename: 'CT_Abdomen_Pelvis_KidneyStones_Jan2026.pdf',
    fileSize: 224000,
    mimeType: 'application/pdf',
    uploadTimestamp: '2026-01-08T16:00:00Z',
    rawOcrText: `METRO RADIOLOGY - CT ABDOMEN AND PELVIS WITHOUT CONTRAST
Patient: Alex Morgan | DOB: 1985-04-12 | Date: 2026-01-08
Ordering Physician: Dr. Amanda Lin, MD (Emergency Dept)

CLINICAL INDICATION: Acute right flank pain radiating to groin, severe, sudden onset 4 hours ago. Nausea and microscopic hematuria.

FINDINGS:
A 4.2 mm obstructive hyperdense calculus is visualized at the right ureterovesical junction (UVJ) with associated mild right hydronephrosis and mild perinephric fat stranding. Left kidney is unremarkable without calculus. No acute appendicitis or bowel obstruction.

IMPRESSION:
1. 4.2 mm right ureterovesical junction calculus causing mild right hydronephrosis. High likelihood of spontaneous passage.
2. Clinical Nephrolithiasis bout #1.`,
    ocrEngineUsed: 'pdfjs-native',
    classification: {
      classId: 'imaging-result',
      categoryName: 'Imaging Result',
      confidence: 0.98,
      matchingSignals: ['Matches radiology keyword: "ct scan"', 'Matches radiology keyword: "impression:"'],
      registeredByAgent: 'Core Medical Agent'
    },
    extractedPayload: {
      patientName: 'Alex Morgan',
      dob: '1985-04-12',
      providerName: 'Dr. Amanda Lin, MD',
      facilityName: 'Metro Health Emergency Imaging Center',
      documentDate: '2026-01-08',
      summary: 'CT Abdomen/Pelvis showing 4.2 mm right UVJ kidney stone causing mild right hydronephrosis.',
      biomarkers: [],
      medications: [],
      findings: [
        { id: 'f-ks-1', heading: 'Impression', text: '4.2 mm right UVJ obstructive calculus with hydronephrosis.', severity: 'warning' }
      ],
      diagnoses: [
        { id: 'dx-kidney-stones', displayName: 'Nephrolithiasis (Calculus of Ureter)', icdCode: 'N20.1', diagnosisType: 'CONFIRMED', primaryDiagnosis: true, sourceDocId: 'sample-ks-ct-jan', sourceDocName: 'CT_Abdomen_Pelvis_KidneyStones_Jan2026.pdf', diagnosedDate: '2026-01-08', provider: 'Dr. Amanda Lin, MD' }
      ],
      symptoms: [
        { id: 'sym-ks-1', displayName: 'Severe Right Flank Pain', severity: 'SEVERE', sourceDocId: 'sample-ks-ct-jan', sourceDocName: 'CT_Abdomen_Pelvis_KidneyStones_Jan2026.pdf' },
        { id: 'sym-ks-2', displayName: 'Nausea', severity: 'MODERATE', sourceDocId: 'sample-ks-ct-jan', sourceDocName: 'CT_Abdomen_Pelvis_KidneyStones_Jan2026.pdf' }
      ],
      rawEntities: { modality: 'CT Abdomen/Pelvis' },
      confidenceScore: 0.98
    }
  },
  {
    id: 'sample-ks-er-jan',
    filename: 'ER_Discharge_Urinalysis_Jan2026.pdf',
    fileSize: 154000,
    mimeType: 'application/pdf',
    uploadTimestamp: '2026-01-09T08:30:00Z',
    rawOcrText: `EMERGENCY DEPARTMENT DISCHARGE SUMMARY & LABS
Patient: Alex Morgan | DOB: 1985-04-12 | Encounter Date: 2026-01-09

URINALYSIS PANEL:
Test Name              Result     Reference Range      Units    Status
RBC (Blood in Urine)   45.0       0 - 3                /HPF     CRITICAL
WBC                    2.0        0 - 5                /HPF     NORMAL
Urine pH               5.5        4.6 - 8.0            pH       NORMAL

DISCHARGE DIAGNOSIS: Acute Right Ureteral Calculus (Nephrolithiasis).
DISCHARGE INSTRUCTIONS: Hydrate vigorously (3L water/day). Strain all urine. Take Tamsulosin 0.4mg daily for stone passage.`,
    ocrEngineUsed: 'pdfjs-native',
    classification: {
      classId: 'visit-summary',
      categoryName: 'Visit Summary',
      confidence: 0.96,
      matchingSignals: ['Matches clinical note indicator: "discharge summary"'],
      registeredByAgent: 'Clinical Notes Subagent'
    },
    extractedPayload: {
      patientName: 'Alex Morgan',
      dob: '1985-04-12',
      providerName: 'Dr. Amanda Lin, MD',
      facilityName: 'Metro Hospital Emergency Department',
      documentDate: '2026-01-09',
      summary: 'ER Discharge summary following acute kidney stone episode with urinalysis confirming RBC 45 /HPF (hematuria).',
      biomarkers: [
        { id: 'sb-ua-1', canonicalName: 'Urine Red Blood Cells (RBC)', loincCode: '5794-3', value: 45.0, unit: '/HPF', refRangeMin: 0, refRangeMax: 3, refRangeText: '0-3 /HPF', status: 'CRITICAL', timestamp: '2026-01-09T08:30:00Z', sourceDocId: 'sample-ks-er-jan', sourceDocName: 'ER_Discharge_Urinalysis_Jan2026.pdf', category: 'Urinalysis', relatedDiagnoses: ['dx-kidney-stones'] }
      ],
      medications: [],
      findings: [
        { id: 'f-ks-2', heading: 'Discharge Plan', text: 'Hydrate 3L/day, strain urine, follow-up with Urology in 2 weeks.', severity: 'info' }
      ],
      diagnoses: [
        { id: 'dx-kidney-stones', displayName: 'Nephrolithiasis (Acute Right Ureteral Calculus)', icdCode: 'N20.1', diagnosisType: 'CONFIRMED', primaryDiagnosis: true, sourceDocId: 'sample-ks-er-jan', sourceDocName: 'ER_Discharge_Urinalysis_Jan2026.pdf', diagnosedDate: '2026-01-09' }
      ],
      symptoms: [
        { id: 'sym-ks-3', displayName: 'Gross Hematuria', severity: 'SEVERE', sourceDocId: 'sample-ks-er-jan', sourceDocName: 'ER_Discharge_Urinalysis_Jan2026.pdf' },
        { id: 'sym-ks-4', displayName: 'Dysuria', severity: 'MODERATE', sourceDocId: 'sample-ks-er-jan', sourceDocName: 'ER_Discharge_Urinalysis_Jan2026.pdf' }
      ],
      rawEntities: { erEncounter: 'True' },
      confidenceScore: 0.96
    }
  },
  {
    id: 'sample-ks-rx-jan',
    filename: 'Prescription_Tamsulosin_Jan2026.pdf',
    fileSize: 92000,
    mimeType: 'application/pdf',
    uploadTimestamp: '2026-01-10T12:00:00Z',
    rawOcrText: `METRO HEALTH PHARMACY PRESCRIPTION
Rx #: 8829104
Patient: Alex Morgan | Prescriber: Dr. Amanda Lin, MD (ER Dept)

Rx: Tamsulosin HCl 0.4 mg Oral Capsule
Sig: Take 1 capsule daily after the same meal each day to facilitate ureteral stone passage
Qty: 30 capsules | Refills: 0 | Date: 2026-01-10`,
    ocrEngineUsed: 'pdfjs-native',
    classification: {
      classId: 'prescription',
      categoryName: 'Prescription',
      confidence: 0.97,
      matchingSignals: ['Matches prescription indicator: "rx"', 'Matches prescription indicator: "sig:"'],
      registeredByAgent: 'Pharmacy Subagent'
    },
    extractedPayload: {
      patientName: 'Alex Morgan',
      dob: '1985-04-12',
      providerName: 'Dr. Amanda Lin, MD',
      facilityName: 'Metro Health Pharmacy',
      documentDate: '2026-01-10',
      summary: 'Prescription for Tamsulosin 0.4 mg daily for medical expulsive therapy (kidney stone passage).',
      biomarkers: [],
      medications: [
        {
          id: 'm-tamsulosin',
          drugName: 'Tamsulosin HCl',
          dosage: '0.4 mg',
          frequency: 'Once daily',
          route: 'Oral',
          prescriber: 'Dr. Amanda Lin, MD',
          startDate: '2026-01-10',
          status: 'ACTIVE',
          sourceDocId: 'sample-ks-rx-jan',
          sourceDocName: 'Prescription_Tamsulosin_Jan2026.pdf',
          diagnoses: [
            { id: 'dx-kidney-stones', displayName: 'Nephrolithiasis (Medical Expulsive Therapy)', icdCode: 'N20.1', diagnosisType: 'CONFIRMED', primaryDiagnosis: true, relevantUse: 'Facilitate ureteral stone passage (alpha blocker therapy)', sourceDocId: 'sample-ks-rx-jan', sourceDocName: 'Prescription_Tamsulosin_Jan2026.pdf', diagnosedDate: '2026-01-10' }
          ]
        }
      ],
      findings: [],
      diagnoses: [
        { id: 'dx-kidney-stones', displayName: 'Nephrolithiasis (Kidney Stones)', icdCode: 'N20.1', diagnosisType: 'CONFIRMED', primaryDiagnosis: true, sourceDocId: 'sample-ks-rx-jan', sourceDocName: 'Prescription_Tamsulosin_Jan2026.pdf', diagnosedDate: '2026-01-10' }
      ],
      symptoms: [],
      rawEntities: { rxCount: '1' },
      confidenceScore: 0.97
    }
  },

  /* ─────────────────────────────────────────────────────────────
     NEW: TEMPORAL EPISODE SCENARIO — KIDNEY STONES (BOUT #2: SEP 2026 — 8 MONTHS LATER!)
     ───────────────────────────────────────────────────────────── */
  {
    id: 'sample-ks-us-sep',
    filename: 'Renal_Ultrasound_RecurrentKidneyStones_Sep2026.pdf',
    fileSize: 189000,
    mimeType: 'application/pdf',
    uploadTimestamp: '2026-09-15T15:00:00Z',
    rawOcrText: `METRO RADIOLOGY - RENAL ULTRASOUND
Patient: Alex Morgan | DOB: 1985-04-12 | Date: 2026-09-15
Ordering Provider: Dr. Sarah Jenkins, MD

INDICATION: Recurrent left flank discomfort, 8 months after prior right ureteral stone episode.

FINDINGS:
Right kidney measures 11.2 cm, normal echogenicity, no hydronephrosis or stone.
Left kidney measures 11.5 cm. A new 3.5 mm non-obstructive renal calculus is identified in the lower pole of the left kidney without shadow acoustic attenuating hydronephrosis.

IMPRESSION:
New 3.5 mm non-obstructive left lower pole renal calculus (Recurrent Nephrolithiasis Bout #2).`,
    ocrEngineUsed: 'pdfjs-native',
    classification: {
      classId: 'imaging-result',
      categoryName: 'Imaging Result',
      confidence: 0.98,
      matchingSignals: ['Matches radiology keyword: "ultrasound"', 'Matches radiology keyword: "impression:"'],
      registeredByAgent: 'Core Medical Agent'
    },
    extractedPayload: {
      patientName: 'Alex Morgan',
      dob: '1985-04-12',
      providerName: 'Dr. Sarah Jenkins, MD',
      facilityName: 'Metro Radiology Imaging Center',
      documentDate: '2026-09-15',
      summary: 'Renal Ultrasound revealing a new 3.5 mm non-obstructive left lower pole kidney stone (recurrent bout #2, 8 months after Jan episode).',
      biomarkers: [],
      medications: [],
      findings: [
        { id: 'f-ks-3', heading: 'Impression', text: 'New 3.5 mm non-obstructive left renal calculus.', severity: 'info' }
      ],
      diagnoses: [
        { id: 'dx-kidney-stones', displayName: 'Nephrolithiasis (Calculus of Left Kidney - Bout #2)', icdCode: 'N20.0', diagnosisType: 'CONFIRMED', primaryDiagnosis: true, sourceDocId: 'sample-ks-us-sep', sourceDocName: 'Renal_Ultrasound_RecurrentKidneyStones_Sep2026.pdf', diagnosedDate: '2026-09-15', provider: 'Dr. Sarah Jenkins, MD' }
      ],
      symptoms: [
        { id: 'sym-ks-5', displayName: 'Mild Left Flank Discomfort', severity: 'MILD', sourceDocId: 'sample-ks-us-sep', sourceDocName: 'Renal_Ultrasound_RecurrentKidneyStones_Sep2026.pdf' }
      ],
      rawEntities: { modality: 'Renal Ultrasound' },
      confidenceScore: 0.98
    }
  }
];
