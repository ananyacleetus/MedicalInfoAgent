import {
  EmailScanMessage,
  InsuranceClaimEntry,
  EmailAgentAnalysis,
  ProcessedDocument,
  StandardMedicalCategory
} from './types';
import { MedicalDataBridge } from './MedicalDataBridge';
import { MOCK_EMAIL_SCAN_MESSAGES, MOCK_INSURANCE_CLAIMS } from '../services/sampleEmailData';

export class EmailAgent {
  private static instance: EmailAgent;
  private connectedAccounts: EmailAgentAnalysis['connectedAccounts'] = [];
  private scannedMessages: EmailScanMessage[] = [];
  private insuranceClaims: InsuranceClaimEntry[] = [];

  private constructor() {
    // Seed initial connected account
    this.connectedAccounts = [
      {
        emailAddress: 'alex.morgan.patient@gmail.com',
        providerType: 'GMAIL_OAUTH',
        status: 'CONNECTED',
        lastScannedAt: new Date(Date.now() - 3600000 * 3).toISOString()
      }
    ];

    this.scannedMessages = [...MOCK_EMAIL_SCAN_MESSAGES];
    this.insuranceClaims = [...MOCK_INSURANCE_CLAIMS];
  }

  public static getInstance(): EmailAgent {
    if (!EmailAgent.instance) {
      EmailAgent.instance = new EmailAgent();
    }
    return EmailAgent.instance;
  }

  /**
   * Returns current Email Agent analysis status
   */
  public getAnalysis(): EmailAgentAnalysis {
    return {
      analyzedAt: new Date().toISOString(),
      connectedAccounts: [...this.connectedAccounts],
      totalEmailsScanned: 142,
      healthEmailsIdentified: this.scannedMessages.length,
      insuranceClaimsParsed: this.insuranceClaims.length,
      scannedMessages: [...this.scannedMessages],
      claims: [...this.insuranceClaims],
      deduplicatedRecordsCount: 6
    };
  }

  /**
   * Connects a new email account via OAuth2 / IMAP simulation
   */
  public async connectEmailAccount(
    emailAddress: string,
    providerType: 'GMAIL_OAUTH' | 'OUTLOOK_OAUTH' | 'YAHOO_OAUTH' | 'IMAP_CUSTOM'
  ): Promise<void> {
    this.connectedAccounts = this.connectedAccounts.filter(a => a.emailAddress !== emailAddress);
    this.connectedAccounts.push({
      emailAddress,
      providerType,
      status: 'CONNECTED',
      lastScannedAt: new Date().toISOString()
    });

    await this.scanInbox();
  }

  /**
   * Scans connected email inboxes for health-related emails, lab alerts, and insurance claims (EOBs)
   */
  public async scanInbox(): Promise<EmailAgentAnalysis> {
    const todayIso = new Date().toISOString();

    // Mark all connected accounts as scanned
    this.connectedAccounts.forEach(acc => {
      acc.lastScannedAt = todayIso;
    });

    // Process all scanned messages into MedicalDataBridge documents with Provenance
    const bridge = MedicalDataBridge.getInstance();

    this.scannedMessages.forEach(msg => {
      const doc = this.convertEmailToDocument(msg);
      bridge.ingestDocument(doc);
    });

    return this.getAnalysis();
  }

  /**
   * Detects health trigger provider name from sender domain or subject
   */
  public detectProviderName(sender: string, subject: string): string {
    const combined = `${sender} ${subject}`.toLowerCase();
    if (combined.includes('labcorp')) return 'LabCorp';
    if (combined.includes('quest')) return 'Quest Diagnostics';
    if (combined.includes('anthem')) return 'Anthem Blue Cross';
    if (combined.includes('unitedhealth') || combined.includes('uhc')) return 'UnitedHealth';
    if (combined.includes('aetna')) return 'Aetna';
    if (combined.includes('mychart') || combined.includes('epic')) return 'Epic MyChart';
    return 'Email Integration'; // Generic fallback when no 3rd party vendor match is found
  }

  /**
   * Converts a parsed email message & attachment into a ProcessedDocument with explicit ProvenanceMetadata
   */
  public convertEmailToDocument(msg: EmailScanMessage): ProcessedDocument {
    const providerName = this.detectProviderName(msg.senderEmail, msg.subject);
    const provenanceSource = providerName === 'Email Integration' ? 'Email Integration' : `Email Integration - ${providerName}`;
    const provenanceType = msg.category === 'INSURANCE_CLAIM_EOB' ? 'EMAIL_INSURANCE_CLAIM' : 'EMAIL_HEALTH_NOTIFICATION';
    const trustScore = msg.category === 'INSURANCE_CLAIM_EOB' ? 0.95 : 0.98;

    const categoryName: StandardMedicalCategory =
      msg.category === 'INSURANCE_CLAIM_EOB' ? 'Insurance Claim / EOB' :
      msg.category === 'LAB_RESULT_ALERT' ? 'Lab Result' :
      msg.category === 'PRESCRIPTION_NOTICE' ? 'Prescription' : 'Visit Summary';

    const classId =
      msg.category === 'INSURANCE_CLAIM_EOB' ? 'insurance-claim' :
      msg.category === 'LAB_RESULT_ALERT' ? 'lab-result' :
      msg.category === 'PRESCRIPTION_NOTICE' ? 'prescription' : 'visit-summary';

    const docId = `doc-email-${msg.id}`;

    return {
      id: docId,
      filename: msg.attachmentName || `Email_Notification_${msg.providerName.replace(/\s+/g, '')}.eml`,
      fileSize: 34200,
      mimeType: msg.hasAttachment ? 'application/pdf' : 'message/rfc822',
      uploadTimestamp: msg.receivedDate,
      rawOcrText: `EMAIL SOURCE: ${msg.senderEmail}\nSUBJECT: ${msg.subject}\nSNIPPET: ${msg.snippet}`,
      ocrEngineUsed: 'simulated-ocr',
      classification: {
        classId,
        categoryName,
        confidence: 0.97,
        matchingSignals: [`Matched email category: ${msg.category}`, `Sender Domain Verified: ${msg.senderEmail}`],
        registeredByAgent: 'EmailAgent'
      },
      provenance: {
        provenanceSource,
        provenanceType,
        sourceTrustScore: trustScore,
        sourcesList: [provenanceSource],
        emailSender: msg.senderEmail,
        emailSubject: msg.subject,
        emailReceivedDate: msg.receivedDate,
        portalMagicLink: msg.portalLinkUrl
      },
      extractedPayload: {
        patientName: 'Alex Morgan',
        dob: '1985-04-12',
        providerName: msg.providerName,
        facilityName: `${msg.providerName} Health Network`,
        documentDate: msg.receivedDate.substring(0, 10),
        summary: `Email integration notification from ${msg.providerName}. Subject: "${msg.subject}". ${msg.snippet}`,
        biomarkers: msg.category === 'LAB_RESULT_ALERT' ? [
          {
            id: `email-bio-${msg.id}-1`,
            canonicalName: msg.subject.includes('Glucose') ? 'Glucose' : 'Hemoglobin A1c',
            value: msg.subject.includes('Glucose') ? 118.0 : 6.2,
            unit: msg.subject.includes('Glucose') ? 'mg/dL' : '%',
            status: 'HIGH',
            timestamp: msg.receivedDate,
            sourceDocId: docId,
            sourceDocName: msg.attachmentName || 'Email Notice',
            category: 'Blood Chemistry',
            provenance: {
              provenanceSource,
              provenanceType,
              sourceTrustScore: trustScore,
              sourcesList: [provenanceSource]
            }
          }
        ] : [],
        medications: msg.category === 'PRESCRIPTION_NOTICE' || msg.category === 'APPOINTMENT_SUMMARY' ? [
          {
            id: `email-med-${msg.id}-1`,
            drugName: 'Spironolactone',
            dosage: '25 mg',
            frequency: 'Once daily',
            route: 'Oral',
            startDate: msg.receivedDate.substring(0, 10),
            status: 'ACTIVE',
            sourceDocId: docId,
            sourceDocName: msg.attachmentName || 'Email Notice',
            provenance: {
              provenanceSource,
              provenanceType,
              sourceTrustScore: trustScore,
              sourcesList: [provenanceSource]
            }
          }
        ] : [],
        findings: [
          { id: `email-f-${msg.id}`, heading: 'Email Content Snippet', text: msg.snippet, severity: 'normal' }
        ],
        diagnoses: msg.category === 'INSURANCE_CLAIM_EOB' ? [
          {
            id: 'dx-diabetes-t2',
            displayName: 'Type 2 Diabetes Mellitus',
            icdCode: 'E11.9',
            diagnosisType: 'CONFIRMED',
            primaryDiagnosis: true,
            sourceDocId: docId,
            sourceDocName: msg.attachmentName || 'Anthem EOB',
            diagnosedDate: msg.receivedDate.substring(0, 10),
            provenance: {
              provenanceSource,
              provenanceType,
              sourceTrustScore: trustScore,
              sourcesList: [provenanceSource]
            }
          }
        ] : [
          {
            id: `dx-email-${msg.id}`,
            displayName: `${msg.providerName} Health Encounter`,
            diagnosisType: 'CONFIRMED',
            primaryDiagnosis: true,
            sourceDocId: docId,
            sourceDocName: msg.attachmentName || 'Email Notification',
            diagnosedDate: msg.receivedDate.substring(0, 10),
            provenance: {
              provenanceSource,
              provenanceType,
              sourceTrustScore: trustScore,
              sourcesList: [provenanceSource]
            }
          }
        ],
        symptoms: [],
        rawEntities: { provenanceSource, emailSubject: msg.subject },
        confidenceScore: 0.97
      }
    };
  }
}
