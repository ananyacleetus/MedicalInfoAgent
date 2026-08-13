import {
  EHRProviderSystem,
  EHRConnectionConfig,
  EHRSyncResult,
  EHRIntegrationAnalysis,
  ProcessedDocument,
  BiomarkerObservation,
  MedicationEntry,
  DiagnosisEntry,
  StandardMedicalCategory
} from './types';
import { MedicalDataBridge } from './MedicalDataBridge';
import {
  MOCK_EPIC_FHIR_R4_BUNDLE,
  MOCK_CERNER_FHIR_R4_BUNDLE,
  MOCK_APPLE_HEALTHKIT_JSON,
  MOCK_ANDROID_HEALTH_CONNECT_JSON
} from '../services/sampleEHRData';

const AVAILABLE_PROVIDERS_CATALOG: EHRIntegrationAnalysis['availableProviders'] = [
  {
    system: 'EPIC_MYCHART',
    name: 'Epic Systems (MyChart Patient Portal)',
    description: 'SMART on FHIR R4 API integration with Epic MyChart EHR instance.',
    authProtocol: 'SMART_ON_FHIR_PKCE',
    iconName: 'Building2',
    logoColor: '#f43f5e'
  },
  {
    system: 'ORACLE_CERNER',
    name: 'Oracle Health (Cerner Millennium)',
    description: 'SMART on FHIR R4 endpoint integration for Cerner Health Systems.',
    authProtocol: 'SMART_ON_FHIR_PKCE',
    iconName: 'Server',
    logoColor: '#38bdf8'
  },
  {
    system: 'ATHENA_HEALTH',
    name: 'AthenaHealth EHR & Patient Portal',
    description: 'OAuth 2.0 API connection for AthenaNet clinical records.',
    authProtocol: 'OAUTH2_AUTHORIZATION_CODE',
    iconName: 'Activity',
    logoColor: '#34d399'
  },
  {
    system: 'ECLINICAL_WORKS',
    name: 'eClinicalWorks (eCW Healow Portal)',
    description: 'FHIR R4 SMART OAuth interface for eClinicalWorks ambulatory networks.',
    authProtocol: 'SMART_ON_FHIR_PKCE',
    iconName: 'Layers',
    logoColor: '#a78bfa'
  },
  {
    system: 'APPLE_HEALTH',
    name: 'Apple Health (iOS HealthKit Bridge)',
    description: 'Imports blood glucose, heart rate, and clinical records exported from iOS Apple Health.',
    authProtocol: 'HEALTHKIT_EXPORT_XML',
    iconName: 'Smartphone',
    logoColor: '#ec4899'
  },
  {
    system: 'ANDROID_HEALTH_CONNECT',
    name: 'Android Health Connect (Google Health)',
    description: 'Direct data bridge with Android Health Connect schema records.',
    authProtocol: 'HEALTH_CONNECT_JSON',
    iconName: 'Cpu',
    logoColor: '#10b981'
  },
  {
    system: 'FOLLOW_MY_HEALTH',
    name: 'FollowMyHealth Portal',
    description: 'Patient portal OAuth2 integration for Allscripts / Veradigm networks.',
    authProtocol: 'OAUTH2_AUTHORIZATION_CODE',
    iconName: 'Globe',
    logoColor: '#fb923c'
  },
  {
    system: 'GENERIC_FHIR_R4',
    name: 'Generic SMART on FHIR R4 Endpoint',
    description: 'Connect any ONC-certified FHIR R4 endpoint via custom URL & OAuth2 PKCE.',
    authProtocol: 'SMART_ON_FHIR_PKCE',
    iconName: 'Network',
    logoColor: '#6366f1'
  }
];

export class EHRAgent {
  private static instance: EHRAgent;
  private activeConnections: EHRConnectionConfig[] = [];
  private recentSyncResults: EHRSyncResult[] = [];

  private constructor() {
    // Seed initial active connections for demo
    this.activeConnections = [
      {
        id: 'conn-epic-mychart-demo',
        systemName: 'Metro Health Epic MyChart',
        providerType: 'EPIC_MYCHART',
        authProtocol: 'SMART_ON_FHIR_PKCE',
        fhirBaseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
        clientId: 'demo-client-epic-98123',
        scopes: ['patient/*.read', 'launch/patient', 'openid', 'fhirUser'],
        status: 'CONNECTED',
        lastSyncedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        recordsSyncedCount: 5,
        patientId: 'epic-patient-10293'
      },
      {
        id: 'conn-apple-health-demo',
        systemName: 'Alex Morgan’s Apple Health (HealthKit)',
        providerType: 'APPLE_HEALTH',
        authProtocol: 'HEALTHKIT_EXPORT_XML',
        status: 'CONNECTED',
        lastSyncedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        recordsSyncedCount: 3
      }
    ];

    this.recentSyncResults = [
      {
        connectionId: 'conn-epic-mychart-demo',
        providerType: 'EPIC_MYCHART',
        syncTimestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        importedDocumentsCount: 2,
        importedMedicationsCount: 1,
        importedBiomarkersCount: 2,
        importedDiagnosesCount: 1,
        rawPayloadSize: 14200,
        status: 'SUCCESS'
      }
    ];
  }

  public static getInstance(): EHRAgent {
    if (!EHRAgent.instance) {
      EHRAgent.instance = new EHRAgent();
    }
    return EHRAgent.instance;
  }

  /**
   * Returns complete EHR integration analysis state
   */
  public getAnalysis(): EHRIntegrationAnalysis {
    const totalSynced = this.activeConnections.reduce(
      (acc, conn) => acc + (conn.recordsSyncedCount || 0),
      0
    );

    return {
      analyzedAt: new Date().toISOString(),
      activeConnectionsCount: this.activeConnections.filter(c => c.status === 'CONNECTED').length,
      totalSyncedRecords: totalSynced,
      connections: [...this.activeConnections],
      recentSyncResults: [...this.recentSyncResults],
      availableProviders: AVAILABLE_PROVIDERS_CATALOG
    };
  }

  /**
   * Connects or authenticates with an EHR system using OAuth PKCE handshake simulation
   */
  public async connectSystem(providerType: EHRProviderSystem): Promise<EHRConnectionConfig> {
    const providerMeta = AVAILABLE_PROVIDERS_CATALOG.find(p => p.system === providerType);
    const id = `conn-${providerType.toLowerCase()}-${Date.now().toString().substring(7)}`;

    const newConnection: EHRConnectionConfig = {
      id,
      systemName: providerMeta?.name || 'Custom Health Connection',
      providerType,
      authProtocol: providerMeta?.authProtocol || 'SMART_ON_FHIR_PKCE',
      status: 'CONNECTED',
      lastSyncedAt: new Date().toISOString(),
      recordsSyncedCount: 0,
      clientId: `client-${Math.random().toString(36).substring(7)}`,
      scopes: ['patient/*.read', 'launch/patient', 'openid', 'fhirUser'],
      accessToken: `mock-token-${Math.random().toString(36).substring(2)}`
    };

    // Remove existing if reconnecting
    this.activeConnections = this.activeConnections.filter(c => c.providerType !== providerType);
    this.activeConnections.push(newConnection);

    // Auto-sync after connection
    await this.syncSystem(id);

    return newConnection;
  }

  /**
   * Disconnects an active EHR connection
   */
  public disconnectSystem(connectionId: string): void {
    this.activeConnections = this.activeConnections.filter(c => c.id !== connectionId);
  }

  /**
   * Syncs data from an active EHR connection and converts FHIR/HealthKit payloads into ProcessedDocuments
   */
  public async syncSystem(connectionId: string): Promise<EHRSyncResult> {
    const conn = this.activeConnections.find(c => c.id === connectionId);
    if (!conn) {
      throw new Error(`EHR Connection [${connectionId}] not found.`);
    }

    let importedDocs: ProcessedDocument[] = [];

    if (conn.providerType === 'EPIC_MYCHART' || conn.providerType === 'GENERIC_FHIR_R4') {
      importedDocs = this.transformFHIRBundle(MOCK_EPIC_FHIR_R4_BUNDLE, 'Epic MyChart FHIR R4');
    } else if (conn.providerType === 'ORACLE_CERNER' || conn.providerType === 'ECLINICAL_WORKS') {
      importedDocs = this.transformFHIRBundle(MOCK_CERNER_FHIR_R4_BUNDLE, 'Oracle Cerner Millennium');
    } else if (conn.providerType === 'APPLE_HEALTH') {
      importedDocs = this.transformHealthKitExport(MOCK_APPLE_HEALTHKIT_JSON);
    } else if (conn.providerType === 'ANDROID_HEALTH_CONNECT') {
      importedDocs = this.transformHealthConnectExport(MOCK_ANDROID_HEALTH_CONNECT_JSON);
    } else {
      importedDocs = this.transformFHIRBundle(MOCK_EPIC_FHIR_R4_BUNDLE, conn.systemName);
    }

    // Ingest into MedicalDataBridge
    const bridge = MedicalDataBridge.getInstance();
    importedDocs.forEach(doc => bridge.ingestDocument(doc));

    // Calculate metrics
    let medsCount = 0;
    let bioCount = 0;
    let dxCount = 0;

    importedDocs.forEach(doc => {
      medsCount += doc.extractedPayload.medications?.length || 0;
      bioCount += doc.extractedPayload.biomarkers?.length || 0;
      dxCount += doc.extractedPayload.diagnoses?.length || 0;
    });

    conn.lastSyncedAt = new Date().toISOString();
    conn.recordsSyncedCount = importedDocs.length + medsCount + bioCount + dxCount;

    const syncResult: EHRSyncResult = {
      connectionId,
      providerType: conn.providerType,
      syncTimestamp: conn.lastSyncedAt,
      importedDocumentsCount: importedDocs.length,
      importedMedicationsCount: medsCount,
      importedBiomarkersCount: bioCount,
      importedDiagnosesCount: dxCount,
      rawPayloadSize: 15400,
      status: 'SUCCESS'
    };

    this.recentSyncResults.unshift(syncResult);
    return syncResult;
  }

  /**
   * Transforms raw FHIR R4 Bundle JSON into standardized ProcessedDocuments
   */
  public transformFHIRBundle(fhirBundle: any, sourceSystemName: string): ProcessedDocument[] {
    const documents: ProcessedDocument[] = [];
    const entries = fhirBundle.entry || [];
    const todayIso = new Date().toISOString();

    const biomarkers: BiomarkerObservation[] = [];
    const medications: MedicationEntry[] = [];
    const diagnoses: DiagnosisEntry[] = [];

    entries.forEach((entry: any) => {
      const res = entry.resource;
      if (!res) return;

      // 1. FHIR Condition -> DiagnosisEntry
      if (res.resourceType === 'Condition') {
        const codeText = res.code?.text || res.code?.coding?.[0]?.display || 'Clinical Condition';
        const icdCode = res.code?.coding?.find((c: any) => c.system?.includes('icd'))?.code || res.code?.coding?.[0]?.code;
        const status = res.clinicalStatus?.coding?.[0]?.code === 'active' ? 'CONFIRMED' : 'SUSPECTED';

        diagnoses.push({
          id: `fhir-dx-${res.id}`,
          displayName: codeText,
          icdCode,
          diagnosisType: status,
          primaryDiagnosis: true,
          sourceDocId: `fhir-doc-${res.id}`,
          sourceDocName: `${sourceSystemName} Bundle`,
          diagnosedDate: res.onsetDateTime ? res.onsetDateTime.substring(0, 10) : todayIso.substring(0, 10)
        });
      }

      // 2. FHIR MedicationRequest / MedicationStatement -> MedicationEntry
      if (res.resourceType === 'MedicationRequest' || res.resourceType === 'MedicationStatement') {
        const drugName = res.medicationCodeableConcept?.text || res.medicationCodeableConcept?.coding?.[0]?.display || 'Prescribed Medication';
        const dosageSig = res.dosageInstruction?.[0]?.text || 'As directed by physician';
        const prescriber = res.requester?.display;

        medications.push({
          id: `fhir-med-${res.id}`,
          drugName,
          dosage: 'Standard Dose',
          frequency: dosageSig,
          route: 'Oral',
          prescriber,
          startDate: res.authoredOn || todayIso.substring(0, 10),
          status: 'ACTIVE',
          sourceDocId: `fhir-doc-${res.id}`,
          sourceDocName: `${sourceSystemName} Bundle`
        });
      }

      // 3. FHIR Observation -> BiomarkerObservation
      if (res.resourceType === 'Observation' && res.valueQuantity) {
        const name = res.code?.text || res.code?.coding?.[0]?.display || 'Lab Observation';
        const loinc = res.code?.coding?.find((c: any) => c.system?.includes('loinc'))?.code;
        const val = res.valueQuantity.value;
        const unit = res.valueQuantity.unit || 'units';

        const minRef = res.referenceRange?.[0]?.low?.value;
        const maxRef = res.referenceRange?.[0]?.high?.value;
        let obsStatus: BiomarkerObservation['status'] = 'NORMAL';

        if (maxRef !== undefined && val > maxRef) obsStatus = 'HIGH';
        if (minRef !== undefined && val < minRef) obsStatus = 'LOW';

        biomarkers.push({
          id: `fhir-bio-${res.id}`,
          canonicalName: name,
          loincCode: loinc,
          value: val,
          unit,
          refRangeMin: minRef,
          refRangeMax: maxRef,
          refRangeText: res.referenceRange?.[0]?.text || (minRef && maxRef ? `${minRef}-${maxRef} ${unit}` : undefined),
          status: obsStatus,
          timestamp: res.effectiveDateTime || todayIso,
          sourceDocId: `fhir-doc-${res.id}`,
          sourceDocName: `${sourceSystemName} Bundle`,
          category: 'FHIR Observation'
        });
      }
    });

    // Package into ProcessedDocument
    const docId = `fhir-sync-${Date.now()}`;
    const categoryName: StandardMedicalCategory = 'Visit Summary';

    const doc: ProcessedDocument = {
      id: docId,
      filename: `${sourceSystemName}_FHIR_R4_Bundle.json`,
      fileSize: JSON.stringify(fhirBundle).length,
      mimeType: 'application/json',
      uploadTimestamp: todayIso,
      rawOcrText: JSON.stringify(fhirBundle, null, 2),
      ocrEngineUsed: 'simulated-ocr',
      classification: {
        classId: 'visit-summary',
        categoryName,
        confidence: 0.99,
        matchingSignals: ['FHIR R4 Bundle Validated', 'SMART OAuth Authenticated'],
        registeredByAgent: 'EHRAgent'
      },
      extractedPayload: {
        patientName: 'Alex Morgan',
        dob: '1985-04-12',
        providerName: sourceSystemName,
        facilityName: sourceSystemName,
        documentDate: todayIso.substring(0, 10),
        summary: `FHIR R4 API Bundle synced directly from ${sourceSystemName}. Extracted ${diagnoses.length} conditions, ${medications.length} medication orders, and ${biomarkers.length} lab observations.`,
        biomarkers,
        medications,
        findings: [
          { id: 'fhir-f1', heading: 'FHIR R4 Sync Status', text: `Successfully parsed SMART on FHIR R4 bundle from ${sourceSystemName}.`, severity: 'normal' }
        ],
        diagnoses,
        symptoms: [],
        rawEntities: { fhirResourceType: 'Bundle', fhirVersion: '4.0.1' },
        confidenceScore: 0.99
      }
    };

    documents.push(doc);
    return documents;
  }

  /**
   * Transforms Apple HealthKit Export JSON into ProcessedDocument
   */
  public transformHealthKitExport(healthKitJson: any): ProcessedDocument[] {
    const todayIso = new Date().toISOString();
    const biomarkers: BiomarkerObservation[] = [];

    const metrics = healthKitJson.metrics || [];
    metrics.forEach((m: any, i: number) => {
      let name = m.type.replace('HKQuantityTypeIdentifier', '');
      if (name === 'BloodGlucose') name = 'Glucose';
      if (name === 'HeartRate') name = 'Heart Rate';

      biomarkers.push({
        id: `hk-bio-${i}`,
        canonicalName: name,
        value: m.value,
        unit: m.unit,
        status: 'NORMAL',
        timestamp: m.startDate || todayIso,
        sourceDocId: `hk-doc-export`,
        sourceDocName: 'Apple Health (HealthKit)',
        category: 'Personal Health Device'
      });
    });

    const doc: ProcessedDocument = {
      id: `hk-export-${Date.now()}`,
      filename: 'Apple_HealthKit_Export.json',
      fileSize: JSON.stringify(healthKitJson).length,
      mimeType: 'application/json',
      uploadTimestamp: todayIso,
      rawOcrText: JSON.stringify(healthKitJson, null, 2),
      ocrEngineUsed: 'simulated-ocr',
      classification: {
        classId: 'lab-result',
        categoryName: 'Lab Result',
        confidence: 0.98,
        matchingSignals: ['HealthKit Export Verified'],
        registeredByAgent: 'EHRAgent'
      },
      extractedPayload: {
        patientName: healthKitJson.user?.name || 'Alex Morgan',
        dob: healthKitJson.user?.dob || '1985-04-12',
        providerName: 'Apple HealthKit Engine',
        facilityName: 'iOS Health App Data Sync',
        documentDate: todayIso.substring(0, 10),
        summary: `Imported ${biomarkers.length} personal health metrics from Apple Health (HealthKit continuous glucose and vitals stream).`,
        biomarkers,
        medications: [],
        findings: [],
        diagnoses: [
          { id: 'dx-healthkit-stream', displayName: 'Personal Vitals & Continuous Glucose Stream', diagnosisType: 'CONFIRMED', primaryDiagnosis: true, sourceDocId: 'hk-doc-export', sourceDocName: 'Apple HealthKit' }
        ],
        symptoms: [],
        rawEntities: { framework: 'iOS HealthKit' },
        confidenceScore: 0.98
      }
    };

    return [doc];
  }

  /**
   * Transforms Android Health Connect JSON into ProcessedDocument
   */
  public transformHealthConnectExport(healthConnectJson: any): ProcessedDocument[] {
    const todayIso = new Date().toISOString();
    const biomarkers: BiomarkerObservation[] = [];

    const records = healthConnectJson.records || [];
    records.forEach((r: any, i: number) => {
      if (r.recordType === 'BloodGlucoseRecord') {
        biomarkers.push({
          id: `hc-bio-bg-${i}`,
          canonicalName: 'Glucose',
          value: r.level?.inMilligramsPerDeciliter || 96.0,
          unit: 'mg/dL',
          status: 'NORMAL',
          timestamp: r.time || todayIso,
          sourceDocId: 'hc-doc-export',
          sourceDocName: 'Android Health Connect',
          category: 'Personal Health Device'
        });
      }
    });

    const doc: ProcessedDocument = {
      id: `hc-export-${Date.now()}`,
      filename: 'Android_HealthConnect_Export.json',
      fileSize: JSON.stringify(healthConnectJson).length,
      mimeType: 'application/json',
      uploadTimestamp: todayIso,
      rawOcrText: JSON.stringify(healthConnectJson, null, 2),
      ocrEngineUsed: 'simulated-ocr',
      classification: {
        classId: 'lab-result',
        categoryName: 'Lab Result',
        confidence: 0.98,
        matchingSignals: ['Health Connect Schema Validated'],
        registeredByAgent: 'EHRAgent'
      },
      extractedPayload: {
        patientName: 'Alex Morgan',
        providerName: 'Android Health Connect',
        facilityName: 'Google Health APIs',
        documentDate: todayIso.substring(0, 10),
        summary: `Imported ${biomarkers.length} records from Android Health Connect framework.`,
        biomarkers,
        medications: [],
        findings: [],
        diagnoses: [
          { id: 'dx-healthconnect-stream', displayName: 'Android Health Vitals Stream', diagnosisType: 'CONFIRMED', primaryDiagnosis: true, sourceDocId: 'hc-doc-export', sourceDocName: 'Android Health Connect' }
        ],
        symptoms: [],
        rawEntities: { framework: 'Android Health Connect' },
        confidenceScore: 0.98
      }
    };

    return [doc];
  }
}
