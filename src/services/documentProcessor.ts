import { ProcessedDocument } from '../core/types';
import { DocumentTypeRegistry } from '../core/DocumentTypeRegistry';
import { MedicalDataBridge } from '../core/MedicalDataBridge';
import { extractTextFromDocument } from './ocrEngine';

export async function processMedicalDocument(file: File): Promise<ProcessedDocument> {
  // 1. Run OCR / Text Extraction
  const { text, engineUsed } = await extractTextFromDocument(file);

  // 2. Classify Document using DocumentTypeRegistry
  const registry = DocumentTypeRegistry.getInstance();
  const classification = registry.classifyDocument(text, { filename: file.name, fileSize: file.size });

  // 3. Extract Payload based on matched Class
  const docClass = registry.getClass(classification.classId);
  const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  let extractedPayload;
  if (docClass) {
    extractedPayload = docClass.parsePayload(text, docId, file.name);
  } else {
    // Generic fallback payload
    extractedPayload = {
      patientName: 'Extracted Patient',
      summary: 'Medical document parsed via OCR.',
      biomarkers: [],
      medications: [],
      findings: [],
      rawEntities: {},
      confidenceScore: 0.50
    };
  }

  const processedDoc: ProcessedDocument = {
    id: docId,
    filename: file.name,
    fileSize: file.size,
    mimeType: file.type || 'application/octet-stream',
    uploadTimestamp: new Date().toISOString(),
    rawOcrText: text,
    ocrEngineUsed: engineUsed,
    classification,
    extractedPayload,
    documentUrl: URL.createObjectURL(file)
  };

  // 4. Ingest into MedicalDataBridge for Insights/Analytics Agent
  MedicalDataBridge.getInstance().ingestDocument(processedDoc);

  return processedDoc;
}
