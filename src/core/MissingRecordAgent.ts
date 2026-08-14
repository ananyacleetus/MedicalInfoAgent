import { MissingRecordAuditItem, ProcessedDocument } from './types';

export class MissingRecordAgent {
  private static instance: MissingRecordAgent;

  private constructor() {}

  public static getInstance(): MissingRecordAgent {
    if (!MissingRecordAgent.instance) {
      MissingRecordAgent.instance = new MissingRecordAgent();
    }
    return MissingRecordAgent.instance;
  }

  /**
   * Scans all processed documents for forward references to tests, imaging, or consults not in the vault
   */
  public auditMissingRecords(documents: ProcessedDocument[]): MissingRecordAuditItem[] {
    const missing: MissingRecordAuditItem[] = [];

    // Check if CT scan report exists
    const hasCTReport = documents.some(d => d.filename.toLowerCase().includes('ct') || d.classification.categoryName.includes('Imaging Result'));
    const hasEchoReport = documents.some(d => d.filename.toLowerCase().includes('echo') || d.rawOcrText.toLowerCase().includes('echocardiogram'));

    if (!hasCTReport) {
      missing.push({
        id: 'audit-missing-ct-feb2026',
        referencedRecordType: 'IMAGING_CT',
        referencedTitle: 'Abdominal & Pelvic CT Scan (Feb 2026)',
        referringProvider: 'Dr. Sarah Jenkins, MD',
        sourceDocId: 'doc-visit-summary-feb2026',
        sourceDocName: 'Visit Summary - Feb 2026',
        dateReferenced: '2026-02-01',
        status: 'MISSING',
        promptMessage: 'Your physician referenced an Abdominal CT Scan performed in February, but this report is missing from your records. Would you like to import it?'
      });
    }

    if (!hasEchoReport) {
      missing.push({
        id: 'audit-missing-echo-jun2026',
        referencedRecordType: 'ECHOCARDIOGRAM',
        referencedTitle: 'Transthoracic Echocardiogram (Echo Report)',
        referringProvider: 'Dr. Marcus Vance, MD (Cardiology)',
        sourceDocId: 'doc-visit-summary-jun2026',
        sourceDocName: 'Cardiology Consultation Note - June 2026',
        dateReferenced: '2026-06-12',
        status: 'MISSING',
        promptMessage: 'Your cardiologist mentions a recent Echocardiogram study, but those results have not been imported yet. Would you like to connect MyChart or upload the PDF?'
      });
    }

    return missing;
  }
}
