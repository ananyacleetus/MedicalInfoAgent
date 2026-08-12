import {
  MedicationEntry,
  MedicationChangeRecord,
  DuplicateMedicationAlert,
  DrugInteractionAlert,
  MedicationAgentAnalysis
} from './types';

// Canonical drug mapping dictionary (Brand -> Generic & Alias Normalization)
const DRUG_ALIASES: Record<string, string> = {
  'glucophage': 'metformin',
  'metformin hcl': 'metformin',
  'metformin er': 'metformin',
  'prinivil': 'lisinopril',
  'zestril': 'lisinopril',
  'aldactone': 'spironolactone',
  'coumadin': 'warfarin',
  'jantoven': 'warfarin',
  'bayer': 'aspirin',
  'ecotrin': 'aspirin',
  'advil': 'ibuprofen',
  'motrin': 'ibuprofen',
  'aleve': 'naproxen',
  'lipitor': 'atorvastatin',
  'zocor': 'simvastatin',
  'amoxil': 'amoxicillin',
  'augmentin': 'amoxicillin/clavulanate'
};

// Clinical Drug-Drug Interaction Rules Knowledge Base
interface InteractionRule {
  drugA: string;
  drugB: string;
  severity: DrugInteractionAlert['severity'];
  mechanism: string;
  clinicalImpact: string;
  recommendation: string;
}

const KNOWN_INTERACTION_RULES: InteractionRule[] = [
  {
    drugA: 'lisinopril',
    drugB: 'spironolactone',
    severity: 'CRITICAL',
    mechanism: 'Additive potassium retention from combined ACE inhibition and aldosterone antagonism.',
    clinicalImpact: 'Severe Hyperkalemia risk, potentially leading to cardiac arrhythmias and muscle weakness.',
    recommendation: 'Monitor serum potassium and serum creatinine levels closely. Adjust doses if serum K+ exceeds 5.0 mEq/L.'
  },
  {
    drugA: 'warfarin',
    drugB: 'aspirin',
    severity: 'CRITICAL',
    mechanism: 'Synergistic antiplatelet and anticoagulant actions compromising primary and secondary hemostasis.',
    clinicalImpact: 'High risk of severe gastrointestinal hemorrhage and systemic bleeding complications.',
    recommendation: 'Avoid concomitant use unless explicitly indicated for acute mechanical heart valve protocols. Co-administer PPI for gastric protection if mandatory.'
  },
  {
    drugA: 'warfarin',
    drugB: 'ibuprofen',
    severity: 'CRITICAL',
    mechanism: 'NSAID-induced inhibition of platelet COX-1 combined with hepatic vitamin K antagonism by Warfarin.',
    clinicalImpact: 'Markedly elevated risk of major upper GI mucosal erosion and intracranial hemorrhage.',
    recommendation: 'Discontinue ibuprofen. Substitute with acetaminophen for mild analgesia if clinically appropriate.'
  },
  {
    drugA: 'lisinopril',
    drugB: 'ibuprofen',
    severity: 'WARNING',
    mechanism: 'NSAIDs block renal prostaglandin synthesis, blunting ACE-inhibitor intrarenal afferent arteriolar vasodilation.',
    clinicalImpact: 'Attenuated blood pressure control and increased risk of acute kidney injury (AKI).',
    recommendation: 'Limit NSAID duration to under 5 days. Monitor blood pressure and BUN/creatinine.'
  },
  {
    drugA: 'metformin',
    drugB: 'contrast',
    severity: 'WARNING',
    mechanism: 'Iodinated radiocontrast agents can cause transient acute renal dysfunction, slowing metformin clearance.',
    clinicalImpact: 'Potential accumulation of metformin leading to severe Lactic Acidosis.',
    recommendation: 'Withhold metformin 48 hours prior to contrast imaging procedure and re-evaluate eGFR before restarting.'
  },
  {
    drugA: 'simvastatin',
    drugB: 'amiodarone',
    severity: 'WARNING',
    mechanism: 'Amiodarone inhibits CYP3A4 hepatic clearance of simvastatin.',
    clinicalImpact: 'Elevated plasma statin concentration increasing rhabdomyolysis and severe myopathy risk.',
    recommendation: 'Do not exceed Simvastatin 20 mg daily when co-administered with amiodarone.'
  }
];

export class MedicationAgent {
  private static instance: MedicationAgent;

  private constructor() {}

  public static getInstance(): MedicationAgent {
    if (!MedicationAgent.instance) {
      MedicationAgent.instance = new MedicationAgent();
    }
    return MedicationAgent.instance;
  }

  /**
   * Helper to normalize drug name to lower-case canonical generic root
   */
  public normalizeDrugName(name: string): string {
    const clean = name.trim().toLowerCase();
    for (const [alias, canonical] of Object.entries(DRUG_ALIASES)) {
      if (clean.includes(alias)) {
        return canonical;
      }
    }
    // Return first word if multi-word trade name
    return clean.split(' ')[0];
  }

  /**
   * Main analysis pipeline: aggregates medications, detects changes, identifies duplicates, and flags interactions.
   */
  public analyzeMedications(medications: MedicationEntry[]): MedicationAgentAnalysis {
    const activeMedications = this.deduplicateActiveCabinet(medications);
    const changesTracked = this.trackMedicationChanges(medications);
    const duplicateAlerts = this.detectDuplicates(medications);
    const interactionAlerts = this.checkInteractions(activeMedications);

    // Calculate safety score (100 minus severity penalties)
    let safetyScore = 100;
    interactionAlerts.forEach(alert => {
      if (alert.severity === 'CRITICAL') safetyScore -= 30;
      else if (alert.severity === 'WARNING') safetyScore -= 15;
      else if (alert.severity === 'MODERATE') safetyScore -= 8;
    });

    duplicateAlerts.forEach(dup => {
      if (dup.riskSeverity === 'HIGH') safetyScore -= 15;
      else safetyScore -= 5;
    });

    safetyScore = Math.max(0, Math.min(100, safetyScore));

    return {
      analyzedAt: new Date().toISOString(),
      activeMedications,
      totalMedicationsCount: medications.length,
      changesTracked,
      duplicateAlerts,
      interactionAlerts,
      overallSafetyScore: safetyScore
    };
  }

  /**
   * Detects dosage escalation, frequency adjustments, or discontinued status across document timestamps
   */
  public trackMedicationChanges(medications: MedicationEntry[]): MedicationChangeRecord[] {
    const records: MedicationChangeRecord[] = [];
    const groupedByDrug: Record<string, MedicationEntry[]> = {};

    medications.forEach(med => {
      const canonical = this.normalizeDrugName(med.drugName);
      if (!groupedByDrug[canonical]) {
        groupedByDrug[canonical] = [];
      }
      groupedByDrug[canonical].push(med);
    });

    Object.values(groupedByDrug).forEach((entries) => {
      if (entries.length > 1) {
        // Sort chronologically
        const sorted = [...entries].sort((a, b) => {
          const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
          const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
          return dateA - dateB;
        });

        for (let i = 1; i < sorted.length; i++) {
          const prev = sorted[i - 1];
          const curr = sorted[i];

          // Dosage change check
          if (prev.dosage && curr.dosage && prev.dosage.trim() !== curr.dosage.trim()) {
            const numPrev = parseFloat(prev.dosage);
            const numCurr = parseFloat(curr.dosage);
            let changeType: MedicationChangeRecord['changeType'] = 'FREQUENCY_CHANGE';
            
            if (!isNaN(numPrev) && !isNaN(numCurr)) {
              changeType = numCurr > numPrev ? 'DOSAGE_INCREASE' : 'DOSAGE_DECREASE';
            }

            records.push({
              id: `change-${prev.id}-${curr.id}`,
              drugName: curr.drugName,
              changeType,
              previousValue: `${prev.dosage} (${prev.frequency})`,
              newValue: `${curr.dosage} (${curr.frequency})`,
              date: curr.startDate || new Date().toISOString().substring(0, 10),
              sourceDocId: curr.sourceDocId,
              sourceDocName: curr.sourceDocName,
              description: `Dosage for ${curr.drugName} updated from ${prev.dosage} to ${curr.dosage} in document "${curr.sourceDocName}".`
            });
          } else if (prev.frequency && curr.frequency && prev.frequency.trim().toLowerCase() !== curr.frequency.trim().toLowerCase()) {
            records.push({
              id: `change-freq-${prev.id}-${curr.id}`,
              drugName: curr.drugName,
              changeType: 'FREQUENCY_CHANGE',
              previousValue: prev.frequency,
              newValue: curr.frequency,
              date: curr.startDate || new Date().toISOString().substring(0, 10),
              sourceDocId: curr.sourceDocId,
              sourceDocName: curr.sourceDocName,
              description: `Administration schedule for ${curr.drugName} changed from "${prev.frequency}" to "${curr.frequency}".`
            });
          }
        }
      }
    });

    return records;
  }

  /**
   * Identifies exact or generic/brand duplicate active prescriptions
   */
  public detectDuplicates(medications: MedicationEntry[]): DuplicateMedicationAlert[] {
    const alerts: DuplicateMedicationAlert[] = [];
    const groupedByCanonical: Record<string, MedicationEntry[]> = {};

    medications.forEach(med => {
      const canonical = this.normalizeDrugName(med.drugName);
      if (!groupedByCanonical[canonical]) {
        groupedByCanonical[canonical] = [];
      }
      groupedByCanonical[canonical].push(med);
    });

    Object.entries(groupedByCanonical).forEach(([canonical, entries]) => {
      if (entries.length >= 2) {
        const uniqueDocIds = new Set(entries.map(e => e.sourceDocId));
        // If mentioned in multiple distinct documents with active status
        if (uniqueDocIds.size >= 2) {
          const names = Array.from(new Set(entries.map(e => e.drugName)));
          const matchType: DuplicateMedicationAlert['matchType'] = names.length > 1 
            ? 'GENERIC_BRAND_DUPLICATE' 
            : 'EXACT_DUPLICATE';

          alerts.push({
            id: `dup-${canonical}`,
            drugName: canonical.toUpperCase(),
            matchType,
            entries,
            riskSeverity: matchType === 'GENERIC_BRAND_DUPLICATE' ? 'HIGH' : 'WARNING',
            description: `Potential active duplicate prescription for ${canonical.toUpperCase()} detected across ${uniqueDocIds.size} different medical records (${entries.map(e => e.sourceDocName).join(', ')}).`
          });
        }
      }
    });

    return alerts;
  }

  /**
   * Evaluates drug-drug interactions using clinical rules engine
   */
  public checkInteractions(medications: MedicationEntry[]): DrugInteractionAlert[] {
    const alerts: DrugInteractionAlert[] = [];
    const canonicalMeds = medications.map(m => ({
      entry: m,
      canonical: this.normalizeDrugName(m.drugName)
    }));

    for (let i = 0; i < canonicalMeds.length; i++) {
      for (let j = i + 1; j < canonicalMeds.length; j++) {
        const itemA = canonicalMeds[i];
        const itemB = canonicalMeds[j];

        // Check rules
        KNOWN_INTERACTION_RULES.forEach(rule => {
          const matchNormal = (itemA.canonical.includes(rule.drugA) && itemB.canonical.includes(rule.drugB));
          const matchReverse = (itemA.canonical.includes(rule.drugB) && itemB.canonical.includes(rule.drugA));

          if (matchNormal || matchReverse) {
            // Avoid duplicate alert if already logged
            const exists = alerts.some(a => 
              (a.drugA.toLowerCase().includes(rule.drugA) && a.drugB.toLowerCase().includes(rule.drugB)) ||
              (a.drugA.toLowerCase().includes(rule.drugB) && a.drugB.toLowerCase().includes(rule.drugA))
            );

            if (!exists) {
              alerts.push({
                id: `interaction-${rule.drugA}-${rule.drugB}`,
                drugA: itemA.entry.drugName,
                drugB: itemB.entry.drugName,
                severity: rule.severity,
                mechanism: rule.mechanism,
                clinicalImpact: rule.clinicalImpact,
                recommendation: rule.recommendation,
                sourceEntries: [itemA.entry, itemB.entry]
              });
            }
          }
        });
      }
    }

    return alerts;
  }

  /**
   * Helper to deduplicate active medication cabinet (keeps latest entry per drug)
   */
  private deduplicateActiveCabinet(medications: MedicationEntry[]): MedicationEntry[] {
    const latestMap = new Map<string, MedicationEntry>();
    medications.forEach(m => {
      const canonical = this.normalizeDrugName(m.drugName);
      const existing = latestMap.get(canonical);
      if (!existing) {
        latestMap.set(canonical, m);
      } else {
        // Keep the one with newer start date or higher dosage
        const dateExisting = existing.startDate ? new Date(existing.startDate).getTime() : 0;
        const dateCurrent = m.startDate ? new Date(m.startDate).getTime() : 0;
        if (dateCurrent >= dateExisting) {
          latestMap.set(canonical, m);
        }
      }
    });
    return Array.from(latestMap.values());
  }

  /**
   * Simulates adding a candidate medication to test against active medications
   */
  public simulateCandidateMedication(
    existingMeds: MedicationEntry[],
    candidateName: string,
    candidateDosage: string,
    candidateFreq: string
  ): {
    candidate: { drugName: string; dosage: string; frequency: string };
    interactionAlerts: DrugInteractionAlert[];
    isDuplicate: boolean;
    duplicateDescription?: string;
    safetyScoreImpact: number;
  } {
    const tempCandidate: MedicationEntry = {
      id: 'simulated-candidate',
      drugName: candidateName,
      dosage: candidateDosage,
      frequency: candidateFreq,
      sourceDocId: 'simulated',
      sourceDocName: 'Simulated Order'
    };

    const combined = [...existingMeds, tempCandidate];
    const candidateCanonical = this.normalizeDrugName(candidateName);

    // Check interactions specific to candidate
    const allInteractions = this.checkInteractions(combined);
    const candidateInteractions = allInteractions.filter(
      alert => this.normalizeDrugName(alert.drugA) === candidateCanonical || this.normalizeDrugName(alert.drugB) === candidateCanonical
    );

    // Check duplicate specific to candidate
    const existingDuplicates = existingMeds.filter(
      m => this.normalizeDrugName(m.drugName) === candidateCanonical
    );
    const isDuplicate = existingDuplicates.length > 0;
    const duplicateDescription = isDuplicate 
      ? `Patient is currently taking ${existingDuplicates[0].drugName} (${existingDuplicates[0].dosage}). Prescribing ${candidateName} creates an active drug duplicate.`
      : undefined;

    let impact = 0;
    candidateInteractions.forEach(a => {
      if (a.severity === 'CRITICAL') impact -= 30;
      else if (a.severity === 'WARNING') impact -= 15;
    });
    if (isDuplicate) impact -= 20;

    return {
      candidate: { drugName: candidateName, dosage: candidateDosage, frequency: candidateFreq },
      interactionAlerts: candidateInteractions,
      isDuplicate,
      duplicateDescription,
      safetyScoreImpact: impact
    };
  }
}
