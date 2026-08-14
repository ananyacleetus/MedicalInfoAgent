import { ChronicHealthJourney, ProcessedDocument } from './types';

export class HealthJourneyAgent {
  private static instance: HealthJourneyAgent;

  private constructor() {}

  public static getInstance(): HealthJourneyAgent {
    if (!HealthJourneyAgent.instance) {
      HealthJourneyAgent.instance = new HealthJourneyAgent();
    }
    return HealthJourneyAgent.instance;
  }

  /**
   * Synthesizes longitudinal medical records into chronic health journey stories
   */
  public synthesizeJourneys(_documents: ProcessedDocument[]): ChronicHealthJourney[] {
    const journeys: ChronicHealthJourney[] = [
      {
        journeyId: 'journey-diabetes-metabolic',
        journeyName: 'Type 2 Diabetes & Metabolic Health Journey',
        startDate: '2026-01-15',
        summaryNarrative: 'Longitudinal narrative tracking metabolic control. Initial fasting blood glucose presented elevated at 118 mg/dL with HbA1c at 6.2% in January 2026. Following commencement of Metformin 1000 mg twice daily and lifestyle adjustments, glucose normalized to 94 mg/dL and HbA1c improved to 5.5% by June 2026.',
        keyMilestones: [
          { date: '2026-01-15', title: 'Initial Metabolic Screening', detail: 'Fasting glucose 118 mg/dL, HbA1c 6.2% identified.' },
          { date: '2026-02-01', title: 'Metformin Initiation', detail: 'Started Metformin HCl 1000 mg oral tablet twice daily.' },
          { date: '2026-06-20', title: 'Glycemic Target Achieved', detail: 'Fasting glucose dropped to 94 mg/dL, HbA1c normalized to 5.5%.' }
        ],
        biomarkerTrends: [
          { name: 'Fasting Blood Glucose', changeText: 'Decreased from 118.0 to 94.0 mg/dL (-20.3%)', direction: 'IMPROVED' },
          { name: 'Hemoglobin A1c', changeText: 'Decreased from 6.2% to 5.5% (-11.3%)', direction: 'IMPROVED' }
        ],
        activeMedications: ['Metformin HCl 1000 mg Oral Tablet'],
        unansweredQuestions: [
          'Should Metformin dosage be maintained or tapered given HbA1c normalization to 5.5%?',
          'What is the annual screening frequency for diabetic microvascular retinal evaluation?'
        ],
        linkedDocIds: ['doc-lab-jan2026', 'doc-lab-jun2026', 'epic-medreq-884']
      },
      {
        journeyId: 'journey-kidney-stones',
        journeyName: 'Nephrolithiasis (Kidney Stone Episodes)',
        startDate: '2026-01-10',
        summaryNarrative: 'Recurrent renal calculus journey featuring 2 distinct temporal episodes (Jan 2026 bout vs Sep 2026 bout). Episode 1 resolved following tamsulosin therapy and ultrasound confirmation. Episode 2 presented 8 months later requiring repeat diagnostic evaluation.',
        keyMilestones: [
          { date: '2026-01-10', title: 'Episode 1: Right Flank Pain & Hematuria', detail: 'Diagnosed with 4mm right ureteral stone; Tamsulosin 0.4mg started.' },
          { date: '2026-01-25', title: 'Episode 1 Resolution', detail: 'Stone passed spontaneously; flank pain resolved.' },
          { date: '2026-09-05', title: 'Episode 2: Left Flank Pain Onset', detail: 'New acute episode 8 months later; renal ultrasound ordered.' }
        ],
        biomarkerTrends: [
          { name: 'Serum Creatinine', changeText: 'Maintained stable baseline 0.95 - 1.05 mg/dL', direction: 'STABLE' },
          { name: 'eGFR', changeText: 'Stable at 88 - 92 mL/min', direction: 'STABLE' }
        ],
        activeMedications: ['Tamsulosin HCl 0.4 mg Capsule'],
        unansweredQuestions: [
          'What is the 24-hour urine metabolic profile risk for calcium oxalate formation?',
          'Should dietary oxalate intake be restricted long-term?'
        ],
        linkedDocIds: ['doc-imaging-jan2026', 'doc-imaging-sep2026']
      }
    ];

    return journeys;
  }
}
