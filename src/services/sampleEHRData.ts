/**
 * Realistic Mock Payloads for EHR Integration (FHIR R4, Apple HealthKit JSON, Android Health Connect JSON)
 */

export const MOCK_EPIC_FHIR_R4_BUNDLE = {
  resourceType: 'Bundle',
  type: 'searchset',
  total: 5,
  entry: [
    {
      resource: {
        resourceType: 'Patient',
        id: 'epic-patient-10293',
        name: [{ family: 'Morgan', given: ['Alex'] }],
        gender: 'male',
        birthDate: '1985-04-12'
      }
    },
    {
      resource: {
        resourceType: 'Condition',
        id: 'epic-cond-001',
        clinicalStatus: { coding: [{ code: 'active', display: 'Active' }] },
        verificationStatus: { coding: [{ code: 'confirmed', display: 'Confirmed' }] },
        category: [{ coding: [{ display: 'Problem List Item' }] }],
        code: {
          coding: [{ system: 'http://hl7.org/fhir/sid/icd-10-cm', code: 'E11.9', display: 'Type 2 Diabetes Mellitus' }],
          text: 'Type 2 Diabetes Mellitus'
        },
        subject: { reference: 'Patient/epic-patient-10293', display: 'Alex Morgan' },
        onsetDateTime: '2026-02-01'
      }
    },
    {
      resource: {
        resourceType: 'MedicationRequest',
        id: 'epic-medreq-884',
        status: 'active',
        intent: 'order',
        medicationCodeableConcept: {
          coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '860975', display: 'Metformin HCl 1000 MG Oral Tablet' }],
          text: 'Metformin HCl 1000 mg Oral Tablet'
        },
        subject: { reference: 'Patient/epic-patient-10293', display: 'Alex Morgan' },
        authoredOn: '2026-05-10',
        requester: { display: 'Dr. Sarah Jenkins, MD' },
        dosageInstruction: [{ text: 'Take 1 tablet orally twice daily with morning and evening meals' }]
      }
    },
    {
      resource: {
        resourceType: 'Observation',
        id: 'epic-obs-glucose-01',
        status: 'final',
        category: [{ coding: [{ display: 'Laboratory' }] }],
        code: {
          coding: [{ system: 'http://loinc.org', code: '2345-7', display: 'Fasting Blood Glucose' }],
          text: 'Glucose'
        },
        subject: { reference: 'Patient/epic-patient-10293', display: 'Alex Morgan' },
        effectiveDateTime: '2026-06-20T08:00:00Z',
        valueQuantity: { value: 94.0, unit: 'mg/dL', system: 'http://unitsofmeasure.org', code: 'mg/dL' },
        referenceRange: [{ low: { value: 70 }, high: { value: 99 }, text: '70 - 99 mg/dL' }]
      }
    },
    {
      resource: {
        resourceType: 'Observation',
        id: 'epic-obs-hba1c-01',
        status: 'final',
        category: [{ coding: [{ display: 'Laboratory' }] }],
        code: {
          coding: [{ system: 'http://loinc.org', code: '4548-4', display: 'Hemoglobin A1c' }],
          text: 'Hemoglobin A1c'
        },
        subject: { reference: 'Patient/epic-patient-10293', display: 'Alex Morgan' },
        effectiveDateTime: '2026-06-20T08:00:00Z',
        valueQuantity: { value: 5.5, unit: '%', system: 'http://unitsofmeasure.org', code: '%' },
        referenceRange: [{ low: { value: 4.0 }, high: { value: 5.6 }, text: '4.0 - 5.6 %' }]
      }
    }
  ]
};

export const MOCK_CERNER_FHIR_R4_BUNDLE = {
  resourceType: 'Bundle',
  type: 'searchset',
  total: 3,
  entry: [
    {
      resource: {
        resourceType: 'Condition',
        id: 'cerner-cond-992',
        clinicalStatus: { coding: [{ code: 'active', display: 'Active' }] },
        code: {
          coding: [{ system: 'http://hl7.org/fhir/sid/icd-10-cm', code: 'I10', display: 'Essential Primary Hypertension' }],
          text: 'Essential Primary Hypertension'
        },
        subject: { reference: 'Patient/alex-morgan', display: 'Alex Morgan' },
        onsetDateTime: '2026-05-10'
      }
    },
    {
      resource: {
        resourceType: 'MedicationRequest',
        id: 'cerner-med-773',
        status: 'active',
        medicationCodeableConcept: {
          coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '206894', display: 'Lisinopril 10 MG Oral Tablet' }],
          text: 'Lisinopril 10 mg Oral Tablet'
        },
        authoredOn: '2026-05-10',
        dosageInstruction: [{ text: 'Take 1 tablet orally once daily in the morning' }]
      }
    },
    {
      resource: {
        resourceType: 'Encounter',
        id: 'cerner-enc-401',
        status: 'finished',
        class: { display: 'Outpatient Specialist Visit' },
        type: [{ text: 'Cardiology Consultation Encounter' }],
        subject: { display: 'Alex Morgan' },
        period: { start: '2026-06-12T14:00:00Z', end: '2026-06-12T15:00:00Z' },
        serviceProvider: { display: 'Metro Cardiology Specialist Clinic' }
      }
    }
  ]
};

export const MOCK_APPLE_HEALTHKIT_JSON = {
  exportDate: '2026-08-10T18:00:00Z',
  user: { name: 'Alex Morgan', dob: '1985-04-12' },
  metrics: [
    {
      type: 'HKQuantityTypeIdentifierBloodGlucose',
      value: 95.0,
      unit: 'mg/dL',
      startDate: '2026-08-01T07:30:00Z',
      endDate: '2026-08-01T07:30:00Z',
      sourceName: 'Dexcom G7 Continuous Glucose Monitor'
    },
    {
      type: 'HKQuantityTypeIdentifierBloodGlucose',
      value: 92.0,
      unit: 'mg/dL',
      startDate: '2026-08-05T07:45:00Z',
      endDate: '2026-08-05T07:45:00Z',
      sourceName: 'Dexcom G7 Continuous Glucose Monitor'
    },
    {
      type: 'HKQuantityTypeIdentifierHeartRate',
      value: 68.0,
      unit: 'count/min',
      startDate: '2026-08-08T09:00:00Z',
      endDate: '2026-08-08T09:00:00Z',
      sourceName: 'Apple Watch Ultra 2'
    }
  ]
};

export const MOCK_ANDROID_HEALTH_CONNECT_JSON = {
  exportVersion: '1.0.0',
  clientPackage: 'com.google.android.apps.healthdata',
  records: [
    {
      recordType: 'BloodGlucoseRecord',
      specimenSource: 'Capillary blood',
      level: { inMilligramsPerDeciliter: 96.0 },
      time: '2026-08-07T08:15:00Z'
    },
    {
      recordType: 'BloodPressureRecord',
      systolic: { inMillimetersOfMercury: 122.0 },
      diastolic: { inMillimetersOfMercury: 78.0 },
      time: '2026-08-07T08:16:00Z'
    }
  ]
};
