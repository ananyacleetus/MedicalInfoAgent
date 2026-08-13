import { EmailScanMessage, InsuranceClaimEntry } from '../core/types';

export const MOCK_EMAIL_SCAN_MESSAGES: EmailScanMessage[] = [
  {
    id: 'msg-labcorp-001',
    providerName: 'LabCorp',
    senderEmail: 'notifications@patient.labcorp.com',
    subject: 'LabCorp Patient Portal: Your new laboratory test results are ready for viewing.',
    receivedDate: '2026-06-21T09:15:00Z',
    category: 'LAB_RESULT_ALERT',
    hasAttachment: true,
    attachmentName: 'LabCorp_BloodWork_Results.pdf',
    portalLinkUrl: 'https://patient.labcorp.com/results/view?id=99281',
    snippet: 'Dear Alex, your recent blood chemistry panel ordered by Dr. Sarah Jenkins is now available. Click below to view or download your complete laboratory report.',
    parsedRecordCount: 4,
    provenanceTag: 'Email Integration - LabCorp'
  },
  {
    id: 'msg-anthem-eob-002',
    providerName: 'Anthem Blue Cross',
    senderEmail: 'claims-eob@anthem.com',
    subject: 'Anthem Blue Cross Explanation of Benefits (EOB) Statement - Claim #CLM-99201',
    receivedDate: '2026-05-18T14:30:00Z',
    category: 'INSURANCE_CLAIM_EOB',
    hasAttachment: true,
    attachmentName: 'Anthem_EOB_Claim_CLM99201.pdf',
    snippet: 'Explanation of Benefits for service date 2026-05-10 at Metro Health Pharmacy & Outpatient Clinic. Total Billed: $450.00 | Plan Paid: $380.00 | Patient Responsibility: $70.00. Covered Diagnoses: E11.9 (Type 2 Diabetes), I10 (Hypertension).',
    parsedRecordCount: 5,
    provenanceTag: 'Email Integration - Anthem Blue Cross'
  },
  {
    id: 'msg-quest-003',
    providerName: 'Quest Diagnostics',
    senderEmail: 'no-reply@questdiagnostics.com',
    subject: 'Quest Diagnostics: Test Results Available - Fasting Blood Glucose & Metabolic Panel',
    receivedDate: '2026-01-16T11:00:00Z',
    category: 'LAB_RESULT_ALERT',
    hasAttachment: false,
    portalLinkUrl: 'https://myquest.questdiagnostics.com/results/77123',
    snippet: 'Your test results from your January 15 visit to Metro Diagnostic Laboratories are now viewable in MyQuest. Glucose: 118.0 mg/dL (High), HbA1c: 6.2% (High).',
    parsedRecordCount: 3,
    provenanceTag: 'Email Integration - Quest Diagnostics'
  },
  {
    id: 'msg-mychart-alert-004',
    providerName: 'Epic MyChart',
    senderEmail: 'donotreply@mychart.metrohealth.org',
    subject: 'You have a new clinical message and appointment summary from Metro Health Cardiology Clinic',
    receivedDate: '2026-06-13T10:00:00Z',
    category: 'APPOINTMENT_SUMMARY',
    hasAttachment: false,
    portalLinkUrl: 'https://mychart.metrohealth.org/clinical/notes',
    snippet: 'Dr. Marcus Vance, MD has published your visit summary from 2026-06-12. New prescription order for Spironolactone 25mg daily for fluid & blood pressure regulation.',
    parsedRecordCount: 3,
    provenanceTag: 'Email Integration - Epic MyChart'
  },
  {
    id: 'msg-generic-health-005',
    providerName: 'Email Integration',
    senderEmail: 'patient-care@health-notify.net',
    subject: 'You received new blood work test results from your clinical provider.',
    receivedDate: '2026-07-01T15:20:00Z',
    category: 'LAB_RESULT_ALERT',
    hasAttachment: true,
    attachmentName: 'BloodWork_Summary_Report.pdf',
    snippet: 'Notice: Your clinical provider uploaded new metabolic bloodwork results. Attached is your confidential medical report.',
    parsedRecordCount: 2,
    provenanceTag: 'Email Integration'
  }
];

export const MOCK_INSURANCE_CLAIMS: InsuranceClaimEntry[] = [
  {
    claimId: 'claim-anthem-99201',
    insuranceCarrier: 'Anthem Blue Cross',
    claimNumber: 'CLM-99201',
    serviceDate: '2026-05-10',
    renderingProvider: 'Dr. Sarah Jenkins, MD',
    facilityName: 'Metro Health Ambulatory Clinic',
    diagnosesICD: [
      { code: 'E11.9', display: 'Type 2 Diabetes Mellitus without complications' },
      { code: 'I10', display: 'Essential Primary Hypertension' }
    ],
    proceduresCPT: [
      { code: '99214', display: 'Office Visit Outpatient Level 4 (30-39 mins)', amountBilled: 250.0 },
      { code: '83036', display: 'Hemoglobin A1c Glycated Blood Test', amountBilled: 80.0 },
      { code: '80053', display: 'Comprehensive Metabolic Panel (CMP)', amountBilled: 120.0 }
    ],
    medicationsClaimed: [
      { drugName: 'Metformin HCl', dosage: '1000 mg', dateFilled: '2026-05-10' },
      { drugName: 'Lisinopril', dosage: '10 mg', dateFilled: '2026-05-10' }
    ],
    totalBilled: 450.0,
    planPaid: 380.0,
    patientResponsibility: 70.0,
    claimStatus: 'PAID',
    sourceDocId: 'doc-claim-anthem-99201',
    sourceDocName: 'Anthem_EOB_Claim_CLM99201.pdf',
    provenance: {
      provenanceSource: 'Email Integration - Anthem Blue Cross',
      provenanceType: 'EMAIL_INSURANCE_CLAIM',
      sourceTrustScore: 0.95
    }
  }
];
