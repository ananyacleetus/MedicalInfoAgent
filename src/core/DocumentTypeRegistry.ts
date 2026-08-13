import { BaseMedicalDocumentClass, ClassificationResult } from './types';
import { ImagingResultClass } from './classes/ImagingResultClass';
import { PrescriptionClass } from './classes/PrescriptionClass';
import { LabResultClass } from './classes/LabResultClass';
import { ReferralClass } from './classes/ReferralClass';
import { VisitSummaryClass } from './classes/VisitSummaryClass';
import { LabOrderClass } from './classes/LabOrderClass';
import { ImagingOrderClass } from './classes/ImagingOrderClass';
import { InsuranceClaimClass } from './classes/InsuranceClaimClass';

export class DocumentTypeRegistry {
  private static instance: DocumentTypeRegistry;
  private registeredClasses: Map<string, BaseMedicalDocumentClass> = new Map();

  private constructor() {
    // Auto-register default medical document classes
    this.registerClass(new LabResultClass());
    this.registerClass(new PrescriptionClass());
    this.registerClass(new ImagingResultClass());
    this.registerClass(new VisitSummaryClass());
    this.registerClass(new ReferralClass());
    this.registerClass(new LabOrderClass());
    this.registerClass(new ImagingOrderClass());
    this.registerClass(new InsuranceClaimClass());
  }

  public static getInstance(): DocumentTypeRegistry {
    if (!DocumentTypeRegistry.instance) {
      DocumentTypeRegistry.instance = new DocumentTypeRegistry();
    }
    return DocumentTypeRegistry.instance;
  }

  /**
   * Registers a new Medical Document Class into the system (used by core or future agents)
   */
  public registerClass(docClass: BaseMedicalDocumentClass): void {
    this.registeredClasses.set(docClass.classId, docClass);
  }

  /**
   * Unregisters a document class by classId
   */
  public unregisterClass(classId: string): boolean {
    return this.registeredClasses.delete(classId);
  }

  /**
   * Gets all registered classes
   */
  public getAllClasses(): BaseMedicalDocumentClass[] {
    return Array.from(this.registeredClasses.values());
  }

  /**
   * Retrieves a specific document class definition
   */
  public getClass(classId: string): BaseMedicalDocumentClass | undefined {
    return this.registeredClasses.get(classId);
  }

  /**
   * Evaluates OCR text against all registered document classes and selects the highest confidence match
   */
  public classifyDocument(ocrText: string, metadata?: Record<string, any>): ClassificationResult {
    let bestMatchClass: BaseMedicalDocumentClass | null = null;
    let maxConfidence = 0.0;
    let bestSignals: string[] = [];

    this.registeredClasses.forEach(docClass => {
      const { confidence, matchingSignals } = docClass.evaluateMatch(ocrText, metadata);
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        bestMatchClass = docClass;
        bestSignals = matchingSignals;
      }
    });

    if (bestMatchClass && maxConfidence >= 0.35) {
      return {
        classId: (bestMatchClass as BaseMedicalDocumentClass).classId,
        categoryName: (bestMatchClass as BaseMedicalDocumentClass).displayName,
        confidence: maxConfidence,
        matchingSignals: bestSignals,
        registeredByAgent: (bestMatchClass as BaseMedicalDocumentClass).defaultRegisteredAgent
      };
    }

    // Default fallback if no registered class matches strongly
    return {
      classId: 'general-medical-doc',
      categoryName: 'General Medical Document',
      confidence: 0.30,
      matchingSignals: ['No specific diagnostic category keywords triggered high confidence'],
      registeredByAgent: 'Core Fallback Classifier'
    };
  }
}
