import {
  BiomarkerObservation,
  BiomarkerTrendMetric,
  LabClinicalInsight,
  LabAgentAnalysis
} from './types';

// Canonical name aliases dictionary
const BIOMARKER_ALIASES: Record<string, string> = {
  'hba1c': 'Hemoglobin A1c',
  'hemoglobin a1c': 'Hemoglobin A1c',
  'a1c': 'Hemoglobin A1c',
  'glucose': 'Glucose',
  'fasting glucose': 'Glucose',
  'total cholesterol': 'Total Cholesterol',
  'cholesterol': 'Total Cholesterol',
  'hdl': 'HDL Cholesterol',
  'hdl cholesterol': 'HDL Cholesterol',
  'ldl': 'LDL Cholesterol',
  'ldl cholesterol': 'LDL Cholesterol',
  'triglycerides': 'Triglycerides',
  'hemoglobin': 'Hemoglobin',
  'hgb': 'Hemoglobin',
  'wbc': 'White Blood Cell Count',
  'white blood cell': 'White Blood Cell Count',
  'platelets': 'Platelets',
  'creatinine': 'Creatinine',
};

export class LabAgent {
  private static instance: LabAgent;

  private constructor() {}

  public static getInstance(): LabAgent {
    if (!LabAgent.instance) {
      LabAgent.instance = new LabAgent();
    }
    return LabAgent.instance;
  }

  /**
   * Normalizes biomarker names to canonical display names
   */
  public canonicalizeName(name: string): string {
    const clean = name.trim().toLowerCase();
    for (const [alias, canonical] of Object.entries(BIOMARKER_ALIASES)) {
      if (clean.includes(alias)) {
        return canonical;
      }
    }
    return name.trim();
  }

  /**
   * Normalizes disparate units (e.g. mmol/L -> mg/dL, umol/L -> mg/dL, mmol/mol -> %)
   */
  public normalizeObservationUnit(obs: BiomarkerObservation): { normalized: BiomarkerObservation; wasConverted: boolean } {
    const name = this.canonicalizeName(obs.canonicalName);
    const unitLower = obs.unit.trim().toLowerCase();
    let val = obs.value;
    let targetUnit = obs.unit;
    let wasConverted = false;

    if (name === 'Glucose' && unitLower.includes('mmol')) {
      val = parseFloat((obs.value * 18.018).toFixed(1));
      targetUnit = 'mg/dL';
      wasConverted = true;
    } else if ((name.includes('Cholesterol') || name === 'Total Cholesterol') && unitLower.includes('mmol')) {
      val = parseFloat((obs.value * 38.67).toFixed(1));
      targetUnit = 'mg/dL';
      wasConverted = true;
    } else if (name === 'Triglycerides' && unitLower.includes('mmol')) {
      val = parseFloat((obs.value * 88.57).toFixed(1));
      targetUnit = 'mg/dL';
      wasConverted = true;
    } else if (name === 'Creatinine' && unitLower.includes('umol')) {
      val = parseFloat((obs.value / 88.4).toFixed(2));
      targetUnit = 'mg/dL';
      wasConverted = true;
    } else if (name === 'Hemoglobin A1c' && unitLower.includes('mmol')) {
      val = parseFloat(((obs.value * 0.09148) + 2.15).toFixed(1));
      targetUnit = '%';
      wasConverted = true;
    }

    return {
      normalized: { ...obs, canonicalName: name, value: val, unit: targetUnit },
      wasConverted,
    };
  }

  /**
   * Main analysis: normalizes units, groups by canonical name, computes deltas and trend direction
   */
  public analyzeLabTrends(observations: BiomarkerObservation[]): LabAgentAnalysis {
    let conversionsAppliedCount = 0;
    const normalizedList: BiomarkerObservation[] = observations.map(obs => {
      const { normalized, wasConverted } = this.normalizeObservationUnit(obs);
      if (wasConverted) conversionsAppliedCount++;
      return normalized;
    });

    // Group by canonical name
    const grouped: Record<string, BiomarkerObservation[]> = {};
    normalizedList.forEach(obs => {
      if (!grouped[obs.canonicalName]) grouped[obs.canonicalName] = [];
      grouped[obs.canonicalName].push(obs);
    });

    const trendMetrics: BiomarkerTrendMetric[] = [];

    Object.entries(grouped).forEach(([biomarkerName, series]) => {
      const sorted = [...series].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      const first = sorted[0];
      const last = sorted[sorted.length - 1];

      const baselineVal = first.value;
      const latestVal = last.value;
      const absChange = parseFloat((latestVal - baselineVal).toFixed(2));
      const deltaPercent = baselineVal !== 0
        ? parseFloat(((absChange / baselineVal) * 100).toFixed(1))
        : 0;

      // Determine if this biomarker is one where decrease = improvement
      const lowerIsBetter = (
        biomarkerName === 'Glucose' ||
        biomarkerName === 'Hemoglobin A1c' ||
        biomarkerName.includes('Cholesterol') ||
        biomarkerName === 'Triglycerides' ||
        biomarkerName === 'Creatinine'
      );

      let trendDirection: BiomarkerTrendMetric['trendDirection'] = 'STABLE';
      if (Math.abs(deltaPercent) > 3) {
        const isDecreasing = deltaPercent < 0;
        trendDirection = (isDecreasing === lowerIsBetter) ? 'IMPROVING' : 'WORSENING';
      }
      if (last.status === 'CRITICAL') trendDirection = 'ELEVATED';

      const currentStatus: BiomarkerTrendMetric['currentStatus'] =
        (last.status as BiomarkerTrendMetric['currentStatus']) || 'NORMAL';

      const thresholdCrossed = first.status !== last.status;
      const statusShift = thresholdCrossed ? `${first.status} → ${last.status}` : undefined;

      trendMetrics.push({
        biomarkerName,
        loincCode: last.loincCode || first.loincCode,
        normalizedUnit: last.unit,
        baselineValue: baselineVal,
        latestValue: latestVal,
        baselineDate: first.timestamp?.substring(0, 10) || 'Baseline',
        latestDate: last.timestamp?.substring(0, 10) || 'Latest',
        absoluteChange: absChange,
        deltaPercent,
        trendDirection,
        currentStatus,
        unitNormalized: conversionsAppliedCount > 0,
        thresholdCrossed,
        statusShift,
        observationsCount: sorted.length,
        refRangeText: last.refRangeText,
      });
    });

    const clinicalInsights = this.generatePathologyInsights(trendMetrics, normalizedList);
    const hasCritical = normalizedList.some(o => o.status === 'CRITICAL');
    const hasHigh = normalizedList.some(o => o.status === 'HIGH');

    let overallLabStatus: LabAgentAnalysis['overallLabStatus'] = 'NORMAL';
    if (hasCritical) overallLabStatus = 'CRITICAL';
    else if (hasHigh) overallLabStatus = 'ATTENTION_NEEDED';

    return {
      analyzedAt: new Date().toISOString(),
      normalizedObservationsCount: normalizedList.length,
      conversionsAppliedCount,
      trendMetrics,
      clinicalInsights,
      overallLabStatus,
    };
  }

  /**
   * Synthesizes trend metrics into automated pathology clinical insights
   */
  public generatePathologyInsights(
    metrics: BiomarkerTrendMetric[],
    observations: BiomarkerObservation[]
  ): LabClinicalInsight[] {
    const insights: LabClinicalInsight[] = [];

    // 1. Check for any CRITICAL values
    const critObs = observations.filter(o => o.status === 'CRITICAL');
    critObs.forEach(o => {
      insights.push({
        id: `critical-${o.id}`,
        biomarkerName: o.canonicalName,
        insightType: 'ABNORMAL_VALUE',
        severity: 'CRITICAL',
        description: `${o.canonicalName} measured ${o.value} ${o.unit} on ${o.timestamp?.substring(0, 10)} — critically outside reference range (${o.refRangeText || `${o.refRangeMin}–${o.refRangeMax}`}).`,
        recommendation: 'Urgent clinical review recommended.',
        affectedBiomarkers: [o.canonicalName],
      });
    });

    // 2. Consistent worsening trend
    metrics.filter(m => m.trendDirection === 'WORSENING' && Math.abs(m.deltaPercent) > 10).forEach(m => {
      insights.push({
        id: `worsening-${m.biomarkerName}`,
        biomarkerName: m.biomarkerName,
        insightType: 'CONSISTENT_WORSENING',
        severity: 'HIGH',
        description: `${m.biomarkerName} has worsened by ${Math.abs(m.deltaPercent).toFixed(1)}% from ${m.baselineValue} to ${m.latestValue} ${m.normalizedUnit} (${m.baselineDate} → ${m.latestDate}).`,
        recommendation: 'Consider reviewing treatment plan and lifestyle modifications.',
        affectedBiomarkers: [m.biomarkerName],
      });
    });

    // 3. Threshold crossed — normalization (improvement)
    metrics.filter(m => m.statusShift?.includes('→ NORMAL') && m.trendDirection === 'IMPROVING').forEach(m => {
      insights.push({
        id: `normalized-${m.biomarkerName}`,
        biomarkerName: m.biomarkerName,
        insightType: 'NORMALIZATION',
        severity: 'LOW',
        description: `${m.biomarkerName} has returned to the normal reference range (${m.baselineValue} → ${m.latestValue} ${m.normalizedUnit}). Status shifted from ${m.statusShift}.`,
        recommendation: 'Continue current management. Schedule routine follow-up.',
        affectedBiomarkers: [m.biomarkerName],
      });
    });

    // 4. High/abnormal current values
    metrics.filter(m => m.currentStatus === 'HIGH' && m.trendDirection !== 'IMPROVING').forEach(m => {
      insights.push({
        id: `high-${m.biomarkerName}`,
        biomarkerName: m.biomarkerName,
        insightType: 'REFERENCE_EXCEEDED',
        severity: 'MODERATE',
        description: `${m.biomarkerName} is currently elevated at ${m.latestValue} ${m.normalizedUnit}, exceeding normal reference range.`,
        recommendation: 'Monitor closely and consider clinical intervention.',
        affectedBiomarkers: [m.biomarkerName],
      });
    });

    // 5. Rapid change (>20% in any direction)
    metrics.filter(m => Math.abs(m.deltaPercent) > 20 && m.trendDirection !== 'NORMALIZATION' as unknown as string).forEach(m => {
      if (!insights.find(i => i.biomarkerName === m.biomarkerName && i.insightType === 'CONSISTENT_WORSENING')) {
        insights.push({
          id: `rapid-${m.biomarkerName}`,
          biomarkerName: m.biomarkerName,
          insightType: 'RAPID_CHANGE',
          severity: 'MODERATE',
          description: `${m.biomarkerName} changed rapidly by ${m.deltaPercent > 0 ? '+' : ''}${m.deltaPercent.toFixed(1)}% (${m.baselineValue} → ${m.latestValue} ${m.normalizedUnit}) between ${m.baselineDate} and ${m.latestDate}.`,
          recommendation: 'Investigate potential causes of rapid change.',
          affectedBiomarkers: [m.biomarkerName],
        });
      }
    });

    return insights;
  }
}
