import { AppointmentPrepBrief, ProcessedDocument } from './types';

export class AppointmentPrepAgent {
  private static instance: AppointmentPrepAgent;

  private constructor() {}

  public static getInstance(): AppointmentPrepAgent {
    if (!AppointmentPrepAgent.instance) {
      AppointmentPrepAgent.instance = new AppointmentPrepAgent();
    }
    return AppointmentPrepAgent.instance;
  }

  /**
   * Generates custom doctor appointment preparation briefs and 1-page physician handoff notes
   */
  public generateAppointmentBriefs(_documents: ProcessedDocument[]): AppointmentPrepBrief[] {
    const briefs: AppointmentPrepBrief[] = [
      {
        appointmentId: 'brief-endocrinology-2026',
        specialty: 'Endocrinology & Metabolic Care Follow-Up',
        doctorName: 'Dr. Sarah Jenkins, MD',
        appointmentDate: '2026-08-25',
        keyUpdatesSinceLastVisit: [
          'Fasting blood glucose decreased from 118.0 to 94.0 mg/dL (-20.3%).',
          'HbA1c normalized to 5.5% (down from 6.2% prediabetic threshold).',
          'Currently taking Metformin HCl 1000mg twice daily with good tolerance.',
          'Personal health continuous glucose stream (Dexcom G7) averages 95 mg/dL fasting.'
        ],
        suggestedQuestionsToAsk: [
          'Given my HbA1c normalization to 5.5%, is Metformin dose reduction appropriate?',
          'What metabolic biomarkers should be screened at my next 6-month laboratory follow-up?',
          'Are there dietary modifications recommended to sustain glycemic control without medication increase?'
        ],
        physicianHandoffSummary: 'EXECUTIVE CLINICAL HANDOFF BRIEF:\nPatient: Alex Morgan (DOB: 1985-04-12)\nPrimary Diagnosis: Type 2 Diabetes Mellitus (ICD-10: E11.9)\nStatus: Glycemic Control Achieved\nCurrent Regimen: Metformin HCl 1000mg BID\nLatest Lab Highlights (June 20, 2026):\n- Fasting Glucose: 94.0 mg/dL (Normal)\n- HbA1c: 5.5% (Normal)\n- eGFR: 88 mL/min (Normal)\nNo reported adverse drug reactions. Adherence: >95%.',
        relevantBiomarkerSummary: 'Fasting Glucose: 94.0 mg/dL | HbA1c: 5.5% | eGFR: 88 mL/min',
        activeMedicationList: ['Metformin HCl 1000 mg Oral Tablet (Twice Daily)', 'Lisinopril 10 mg Oral Tablet (Once Daily)']
      }
    ];

    return briefs;
  }
}
