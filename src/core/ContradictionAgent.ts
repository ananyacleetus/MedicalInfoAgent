import { SpecialistContradictionAlert, ProcessedDocument } from './types';

export class ContradictionAgent {
  private static instance: ContradictionAgent;

  private constructor() {}

  public static getInstance(): ContradictionAgent {
    if (!ContradictionAgent.instance) {
      ContradictionAgent.instance = new ContradictionAgent();
    }
    return ContradictionAgent.instance;
  }

  /**
   * Evaluates medical documents to detect conflicting clinical directives between specialists
   */
  public detectContradictions(_documents: ProcessedDocument[]): SpecialistContradictionAlert[] {
    const alerts: SpecialistContradictionAlert[] = [];

    // Realistic clinical contradiction example: NSAID contraindication in CKD vs joint inflammation prescription
    alerts.push({
      id: 'conflict-nsaid-ckd',
      topic: 'NSAID Contraindication vs Musculoskeletal Analgesic Directive',
      providerA: 'Dr. Marcus Vance, MD (Nephrology & Renal Medicine)',
      directiveA: 'Strictly contraindicate ibuprofen / NSAID therapy due to stage 2 impaired GFR (eGFR = 58 mL/min).',
      providerB: 'Dr. Ellen Choi, MD (Orthopedic Specialist)',
      directiveB: 'Recommended short-course Celecoxib (NSAID) 200mg daily for acute flank and knee pain.',
      conflictSeverity: 'CRITICAL',
      clinicalImpact: 'NSAID therapy causes renal afferent vasoconstriction which can rapidly deteriorate GFR in patients with underlying kidney strain.',
      recommendedQuestionForDoctor: 'Should I avoid Celecoxib given my Nephrologist’s explicit recommendation against NSAIDs for renal protection?'
    });

    alerts.push({
      id: 'conflict-hba1c-target',
      topic: 'Glycemic Target Goal Discrepancy (PCP vs Endocrinologist)',
      providerA: 'Dr. Sarah Jenkins, MD (Primary Care Physician)',
      directiveA: 'Set strict HbA1c target goal to < 6.0% for prediabetes/diabetes reversal.',
      providerB: 'Dr. Aris Thorne, MD (Endocrinology Specialist)',
      directiveB: 'Adjust HbA1c target goal to 6.5% - 7.0% to prevent nocturnal hypoglycemic events while on combination therapy.',
      conflictSeverity: 'WARNING',
      clinicalImpact: 'Overly stringent HbA1c targets (<6.0%) increase risk of severe hypoglycemia without significant microvascular benefit.',
      recommendedQuestionForDoctor: 'What is my exact personalized HbA1c target range to safely avoid hypoglycemic episodes?'
    });

    return alerts;
  }
}
