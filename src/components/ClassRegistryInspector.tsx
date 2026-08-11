import React, { useState } from 'react';
import { DocumentTypeRegistry } from '../core/DocumentTypeRegistry';
import { BaseMedicalDocumentClass, ExtractedMedicalPayload, StandardMedicalCategory } from '../core/types';
import { 
  Blocks, 
  PlusCircle, 
  Cpu, 
  Sparkles, 
  Play
} from 'lucide-react';

export const ClassRegistryInspector: React.FC = () => {
  const registry = DocumentTypeRegistry.getInstance();
  const [classes, setClasses] = useState<BaseMedicalDocumentClass[]>(registry.getAllClasses());

  // Form for registering a custom document class dynamically
  const [customClassName, setCustomClassName] = useState<string>('Genomic Sequence Report');
  const [customClassId, setCustomClassId] = useState<string>('genomic-sequence');
  const [customKeywords, setCustomKeywords] = useState<string>('genomic, dna, sequencing, variant, mutation, bca1');
  const [customAgent, setCustomAgent] = useState<string>('Genomics Subagent');
  const [customColor] = useState<string>('#ec4899'); // Pink

  const [testText, setTestText] = useState<string>('PATIENT GENOMIC SEQUENCING REPORT\nSequencing: Whole Exome DNA Panel\nVariants Detected: BRCA1 pathogenic variant identified.\nRecommendation: Genetic counselor consultation.');
  const [testResult, setTestResult] = useState<any>(null);

  const handleRegisterClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customClassName || !customClassId) return;

    class DynamicAgentDocumentClass extends BaseMedicalDocumentClass {
      readonly classId = customClassId;
      readonly displayName: StandardMedicalCategory = customClassName;
      readonly description = `Dynamically registered medical document class created by ${customAgent}.`;
      readonly iconName = 'Dna';
      readonly colorAccent = customColor;
      readonly categoryGroup = 'Diagnostic' as const;
      readonly defaultRegisteredAgent = customAgent;

      evaluateMatch(ocrText: string): { confidence: number; matchingSignals: string[] } {
        const textLower = ocrText.toLowerCase();
        const kwArray = customKeywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
        const signals: string[] = [];

        kwArray.forEach(kw => {
          if (textLower.includes(kw)) {
            signals.push(`Matches custom signal: "${kw}"`);
          }
        });

        let confidence = 0;
        if (signals.length >= 2) confidence = 0.95;
        else if (signals.length === 1) confidence = 0.65;
        else confidence = 0.05;

        return { confidence, matchingSignals: signals };
      }

      parsePayload(_ocrText: string, docId: string, _docName: string): ExtractedMedicalPayload {
        return {
          summary: `Extracted via dynamically registered class [${customClassName}].`,
          biomarkers: [],
          medications: [],
          findings: [{
            id: `${docId}-dyn-1`,
            heading: 'Custom Agent Finding',
            text: `Document matched dynamically registered class [${customClassName}].`,
            severity: 'info'
          }],
          rawEntities: { customClassId: this.classId },
          confidenceScore: 0.90
        };
      }
    }

    const newClassInstance = new DynamicAgentDocumentClass();
    registry.registerClass(newClassInstance);
    setClasses(registry.getAllClasses());

    const res = registry.classifyDocument(testText);
    setTestResult(res);
  };

  const handleTestClassify = () => {
    const res = registry.classifyDocument(testText);
    setTestResult(res);
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 24px 40px 24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px' }}>
          Extensible Document Class <span className="gradient-text">Registry</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Document types are decoupled into pluggable classes extending <code style={{ color: '#38bdf8' }}>BaseMedicalDocumentClass</code>. Future subagents or developers can register new document classes dynamically.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Left: Register Custom Document Class */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ec4899' }}>
            <PlusCircle size={20} />
            Register New Document Class (Future Agent Simulation)
          </h3>

          <form onSubmit={handleRegisterClass} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                DOCUMENT CLASS DISPLAY NAME
              </label>
              <input
                type="text"
                value={customClassName}
                onChange={(e) => setCustomClassName(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '8px', color: '#fff', fontSize: '14px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  CLASS ID (UNIQUE)
                </label>
                <input
                  type="text"
                  value={customClassId}
                  onChange={(e) => setCustomClassId(e.target.value)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '8px', color: '#fff', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  REGISTERING AGENT NAME
                </label>
                <input
                  type="text"
                  value={customAgent}
                  onChange={(e) => setCustomAgent(e.target.value)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '8px', color: '#fff', fontSize: '14px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                CLASSIFICATION KEYWORDS (COMMA SEPARATED)
              </label>
              <input
                type="text"
                value={customKeywords}
                onChange={(e) => setCustomKeywords(e.target.value)}
                placeholder="e.g. genomic, dna, sequencing, variant"
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '8px', color: '#fff', fontSize: '14px' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '8px', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}>
              <Sparkles size={16} />
              Register Class in Registry
            </button>
          </form>
        </div>

        {/* Right: Live Interactive Classifier Tester */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
            <Play size={20} />
            Test Classifier Against Active Registry
          </h3>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              SAMPLE TEXT STREAM TO EVALUATE
            </label>
            <textarea
              rows={4}
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '8px', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
            />
          </div>

          <button className="btn-secondary" onClick={handleTestClassify} style={{ marginBottom: '16px' }}>
            <Cpu size={16} /> Run Classification Evaluation
          </button>

          {testResult && (
            <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid #06b6d4', padding: '14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>CLASSIFICATION MATCH RESULT</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
                {testResult.categoryName} <span style={{ fontSize: '13px', color: '#34d399' }}>({(testResult.confidence * 100).toFixed(0)}% confidence)</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Evaluated by Agent: <strong>{testResult.registeredByAgent}</strong>
              </div>
              <div style={{ marginTop: '8px', fontSize: '12px' }}>
                <strong>Matching Signals:</strong> {testResult.matchingSignals.join(', ') || 'None'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid of All Registered Document Classes */}
      <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Blocks size={22} color="#06b6d4" />
        Currently Registered Classes ({classes.length})
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {classes.map((cls) => (
          <div key={cls.classId} className="glass-card" style={{ padding: '18px', borderLeft: `4px solid ${cls.colorAccent}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{cls.displayName}</h4>
              <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '10px', color: 'var(--text-muted)' }}>
                {cls.categoryGroup}
              </span>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', minHeight: '38px' }}>
              {cls.description}
            </p>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Class ID: <strong style={{ color: '#fff' }}>{cls.classId}</strong></span>
              <span style={{ color: cls.colorAccent, fontWeight: 600 }}>{cls.defaultRegisteredAgent}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
