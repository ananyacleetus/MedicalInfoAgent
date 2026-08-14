import { LongitudinalQAQuery, ProcessedDocument } from './types';

export class HealthIntelligenceQAEngine {
  private static instance: HealthIntelligenceQAEngine;

  private constructor() {}

  public static getInstance(): HealthIntelligenceQAEngine {
    if (!HealthIntelligenceQAEngine.instance) {
      HealthIntelligenceQAEngine.instance = new HealthIntelligenceQAEngine();
    }
    return HealthIntelligenceQAEngine.instance;
  }

  /**
   * Pre-built longitudinal cross-correlated queries for demonstration & natural language query matching
   */
  public getSampleQueries(): LongitudinalQAQuery[] {
    return [
      {
        id: 'qa-cholesterol-meds',
        question: 'Which medications was I taking when my cholesterol improved?',
        answerNarrative: 'Over the past two years, your LDL cholesterol gradually decreased from 172 mg/dL to 124 mg/dL after starting Rosuvastatin 10 mg daily in March 2025. However, your triglycerides remain elevated (198 mg/dL) and tend to increase during months when your physical activity drops below your yearly average.',
        referencedTimeframe: 'March 2025 – August 2026',
        correlatedMedications: ['Rosuvastatin 10 mg Oral Tablet'],
        correlatedBiomarkers: ['LDL Cholesterol', 'Triglycerides', 'Total Cholesterol'],
        supportingDocIds: ['doc-lab-jan2026', 'doc-lab-jun2026']
      },
      {
        id: 'qa-fatigue-onset',
        question: 'When did my fatigue begin?',
        answerNarrative: 'Your medical records first document persistent fatigue during an outpatient visit on March 14, 2025, where serum Ferritin was tested at 12 ng/mL (Low). Following iron supplementation, Ferritin improved to 45 ng/mL by June 2025, but mild fatigue was noted again during a July 2026 check-up correlated with reduced sleep quality.',
        referencedTimeframe: 'March 2025 – July 2026',
        correlatedMedications: ['Ferrous Sulfate 325 mg Oral Tablet'],
        correlatedBiomarkers: ['Serum Ferritin', 'Hemoglobin', 'WBC'],
        supportingDocIds: ['doc-visit-summary-mar2025']
      },
      {
        id: 'qa-glucose-trend',
        question: 'How has my blood glucose correlated with my medication changes?',
        answerNarrative: 'In January 2026, your fasting glucose was 118 mg/dL and HbA1c was 6.2%. On February 1, 2026, Metformin 1000 mg twice daily was prescribed. By June 2026, your fasting glucose normalized to 94 mg/dL (-20.3%) and HbA1c reached 5.5%, demonstrating significant therapeutic response.',
        referencedTimeframe: 'January 2026 – June 2026',
        correlatedMedications: ['Metformin HCl 1000 mg Oral Tablet'],
        correlatedBiomarkers: ['Fasting Blood Glucose', 'Hemoglobin A1c'],
        supportingDocIds: ['doc-lab-jan2026', 'doc-lab-jun2026', 'epic-medreq-884']
      }
    ];
  }

  /**
   * Executes or matches a user query string against longitudinal health data
   */
  public queryHealthIntelligence(userQuery: string, _documents: ProcessedDocument[]): LongitudinalQAQuery {
    const queryLower = userQuery.toLowerCase();
    const samples = this.getSampleQueries();

    if (queryLower.includes('fatigue') || queryLower.includes('tired')) {
      return samples[1];
    }
    if (queryLower.includes('glucose') || queryLower.includes('metformin') || queryLower.includes('a1c')) {
      return samples[2];
    }
    // Default to cholesterol query sample
    return samples[0];
  }
}
