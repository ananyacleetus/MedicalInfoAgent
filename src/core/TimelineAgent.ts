import {
  ProcessedDocument,
  TimelineEvent,
  TimelineCategory,
  TimelineSeverity,
  PatientTimelineSummary,
  TimelineFilterOptions
} from './types';
import { MedicationAgent } from './MedicationAgent';

export class TimelineAgent {
  private static instance: TimelineAgent;

  private constructor() {}

  public static getInstance(): TimelineAgent {
    if (!TimelineAgent.instance) {
      TimelineAgent.instance = new TimelineAgent();
    }
    return TimelineAgent.instance;
  }

  /**
   * Main synthesis pipeline: converts raw documents into a unified, chronologically sorted patient timeline
   */
  public buildUnifiedTimeline(documents: ProcessedDocument[]): TimelineEvent[] {
    const events: TimelineEvent[] = [];

    // 1. Process Document-Level & Entity Events
    documents.forEach(doc => {
      const payload = doc.extractedPayload;
      const categoryName = String(doc.classification.categoryName);
      const docDate = payload.documentDate || doc.uploadTimestamp.substring(0, 10);

      // Category-specific mapping
      if (categoryName.toLowerCase().includes('lab')) {
        // Lab Result Event
        const abnormalCount = payload.biomarkers.filter(b => b.status === 'HIGH' || b.status === 'LOW' || b.status === 'CRITICAL').length;
        const severity: TimelineSeverity = abnormalCount > 0 ? 'warning' : 'normal';

        events.push({
          id: `evt-doc-${doc.id}`,
          timestamp: docDate,
          eventType: 'LAB_RESULT',
          category: 'Lab Results',
          title: `Lab Work: ${payload.summary.substring(0, 60)}...`,
          subtitle: `${payload.biomarkers.length} Biomarkers Measured (${abnormalCount} Out of Range)`,
          details: `Processed by ${doc.classification.registeredByAgent || 'Lab Extractor'}. Summary: ${payload.summary}`,
          severity,
          sourceDocId: doc.id,
          sourceDocName: doc.filename,
          providerName: payload.providerName,
          facilityName: payload.facilityName,
          tags: payload.biomarkers.map(b => b.canonicalName),
          colorAccent: '#8b5cf6',
          iconName: 'TestTube'
        });

        // Individual high/critical biomarker events
        payload.biomarkers.forEach(bio => {
          if (bio.status === 'HIGH' || bio.status === 'LOW' || bio.status === 'CRITICAL') {
            events.push({
              id: `evt-bio-${bio.id}`,
              timestamp: bio.timestamp ? bio.timestamp.substring(0, 10) : docDate,
              eventType: 'LAB_RESULT',
              category: 'Lab Results',
              title: `Abnormal Flag: ${bio.canonicalName} (${bio.value} ${bio.unit})`,
              subtitle: `Status: ${bio.status} | Reference Range: ${bio.refRangeText || `${bio.refRangeMin}-${bio.refRangeMax}`}`,
              details: `Measured in ${doc.filename}. Standardized LOINC Code: ${bio.loincCode || 'N/A'}.`,
              severity: bio.status === 'CRITICAL' ? 'critical' : 'warning',
              sourceDocId: doc.id,
              sourceDocName: doc.filename,
              tags: [bio.canonicalName, bio.status],
              colorAccent: bio.status === 'CRITICAL' ? '#f43f5e' : '#f59e0b',
              iconName: 'Activity'
            });
          }
        });

      } else if (categoryName.toLowerCase().includes('prescription')) {
        // Prescription Event
        payload.medications.forEach(med => {
          events.push({
            id: `evt-rx-${med.id}`,
            timestamp: med.startDate || docDate,
            eventType: med.status === 'MODIFIED' ? 'MEDICATION_MODIFIED' : 'MEDICATION_STARTED',
            category: 'Medications',
            title: `Prescription Order: ${med.drugName} ${med.dosage}`,
            subtitle: `SIG: ${med.frequency} | Prescriber: ${med.prescriber || payload.providerName || 'Physician'}`,
            details: `Document: ${doc.filename}. Status: ${med.status || 'ACTIVE'}. Refills: ${med.refills ?? 'N/A'}.`,
            severity: 'normal',
            sourceDocId: doc.id,
            sourceDocName: doc.filename,
            providerName: med.prescriber || payload.providerName,
            tags: [med.drugName, 'Rx'],
            colorAccent: '#10b981',
            iconName: 'Pill'
          });
        });

      } else if (categoryName.toLowerCase().includes('imaging')) {
        // Radiology Scan Event
        const impression = payload.findings.find(f => f.heading.toLowerCase().includes('impression'))?.text || payload.summary;

        events.push({
          id: `evt-img-${doc.id}`,
          timestamp: docDate,
          eventType: 'IMAGING_RESULT',
          category: 'Imaging Scans',
          title: `Radiology Imaging Scan: ${doc.filename}`,
          subtitle: `Provider: ${payload.providerName || 'Radiologist'}`,
          details: `Impression: ${impression}`,
          severity: 'info',
          sourceDocId: doc.id,
          sourceDocName: doc.filename,
          providerName: payload.providerName,
          facilityName: payload.facilityName,
          tags: ['Radiology', 'Scan'],
          colorAccent: '#06b6d4',
          iconName: 'FileText'
        });

      } else if (categoryName.toLowerCase().includes('referral')) {
        // Referral Event
        events.push({
          id: `evt-ref-${doc.id}`,
          timestamp: docDate,
          eventType: 'REFERRAL',
          category: 'Referrals',
          title: `Specialist Referral: ${payload.facilityName || 'Specialist Consultation'}`,
          subtitle: `Referring Provider: ${payload.providerName || 'Primary Care Physician'}`,
          details: payload.summary,
          severity: 'info',
          sourceDocId: doc.id,
          sourceDocName: doc.filename,
          providerName: payload.providerName,
          facilityName: payload.facilityName,
          tags: ['Referral', 'Care Coordination'],
          colorAccent: '#f59e0b',
          iconName: 'Share2'
        });

      } else if (categoryName.toLowerCase().includes('visit')) {
        // Visit Summary Event
        events.push({
          id: `evt-visit-${doc.id}`,
          timestamp: docDate,
          eventType: 'VISIT_SUMMARY',
          category: 'Clinical Visits',
          title: `Clinical Visit Summary: ${payload.facilityName || 'Medical Clinic'}`,
          subtitle: `Attending Doctor: ${payload.providerName || 'Attending Physician'}`,
          details: payload.summary,
          severity: 'normal',
          sourceDocId: doc.id,
          sourceDocName: doc.filename,
          providerName: payload.providerName,
          facilityName: payload.facilityName,
          tags: ['Visit', 'Consultation'],
          colorAccent: '#3b82f6',
          iconName: 'Stethoscope'
        });

      } else {
        // Generic Document Upload Event
        events.push({
          id: `evt-doc-gen-${doc.id}`,
          timestamp: docDate,
          eventType: 'DOCUMENT_UPLOAD',
          category: 'General',
          title: `Medical Document Ingested: ${doc.filename}`,
          subtitle: `Category: ${categoryName}`,
          details: payload.summary,
          severity: 'normal',
          sourceDocId: doc.id,
          sourceDocName: doc.filename,
          tags: [categoryName],
          colorAccent: '#9ca3af',
          iconName: 'FileText'
        });
      }
    });

    // 2. Process Medication Changes from MedicationAgent
    const medAgent = MedicationAgent.getInstance();
    const allMeds = documents.flatMap(d => d.extractedPayload.medications);
    const medChanges = medAgent.trackMedicationChanges(allMeds);

    medChanges.forEach(change => {
      events.push({
        id: `evt-med-change-${change.id}`,
        timestamp: change.date,
        eventType: 'MEDICATION_MODIFIED',
        category: 'Medications',
        title: `Medication Dose Adjustment: ${change.drugName}`,
        subtitle: `Previous: ${change.previousValue} → New: ${change.newValue}`,
        details: change.description,
        severity: 'info',
        sourceDocId: change.sourceDocId,
        sourceDocName: change.sourceDocName,
        tags: [change.drugName, 'Dose Change'],
        colorAccent: '#38bdf8',
        iconName: 'TrendingUp'
      });
    });

    // 3. Sort Chronologically (Newest First by default)
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Calculates high-level summary metrics for the patient journey
   */
  public getTimelineSummary(events: TimelineEvent[]): PatientTimelineSummary {
    const categoryBreakdown: Record<TimelineCategory, number> = {
      'Medications': 0,
      'Lab Results': 0,
      'Imaging Scans': 0,
      'Referrals': 0,
      'Clinical Visits': 0,
      'Orders': 0,
      'General': 0
    };

    let activeSafetyAlertsCount = 0;
    events.forEach(evt => {
      if (categoryBreakdown[evt.category] !== undefined) {
        categoryBreakdown[evt.category]++;
      } else {
        categoryBreakdown['General']++;
      }

      if (evt.severity === 'warning' || evt.severity === 'critical') {
        activeSafetyAlertsCount++;
      }
    });

    const dates = events.map(e => e.timestamp).filter(Boolean).sort();
    const earliestDate = dates[0] || 'N/A';
    const latestDate = dates[dates.length - 1] || 'N/A';

    return {
      patientName: 'Alex Morgan',
      earliestDate,
      latestDate,
      totalEventsCount: events.length,
      categoryBreakdown,
      activeSafetyAlertsCount
    };
  }

  /**
   * Applies user filter criteria (category, severity, search term, date range)
   */
  public filterTimeline(events: TimelineEvent[], filters: TimelineFilterOptions): TimelineEvent[] {
    return events.filter(evt => {
      // Category filter
      if (filters.category && filters.category !== 'ALL' && evt.category !== filters.category) {
        return false;
      }

      // Severity filter
      if (filters.severity && filters.severity !== 'ALL' && evt.severity !== filters.severity) {
        return false;
      }

      // Search term filter
      if (filters.searchTerm && filters.searchTerm.trim()) {
        const term = filters.searchTerm.toLowerCase();
        const matchesTitle = evt.title.toLowerCase().includes(term);
        const matchesSubtitle = evt.subtitle.toLowerCase().includes(term);
        const matchesDetails = evt.details?.toLowerCase().includes(term);
        const matchesDoc = evt.sourceDocName.toLowerCase().includes(term);
        const matchesTag = evt.tags?.some(t => t.toLowerCase().includes(term));

        if (!matchesTitle && !matchesSubtitle && !matchesDetails && !matchesDoc && !matchesTag) {
          return false;
        }
      }

      return true;
    });
  }
}
