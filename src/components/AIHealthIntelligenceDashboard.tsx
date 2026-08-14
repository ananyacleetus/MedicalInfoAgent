import React, { useState } from 'react';
import { MedicalDataBridge } from '../core/MedicalDataBridge';
import {
  Brain,
  Search,
  Sparkles,
  AlertTriangle,
  FileQuestion,
  BookOpen,
  CalendarCheck,
  Stethoscope,
  ArrowRight,
  TrendingDown,
  Clock,
  Download,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { LongitudinalQAQuery } from '../core/types';

export const AIHealthIntelligenceDashboard: React.FC = () => {
  const bridge = MedicalDataBridge.getInstance();
  const [analysis] = useState(() => bridge.getAIHealthPlatformAnalysis());

  const [activeTab, setActiveTab] = useState<'QA' | 'AUDIT' | 'CONTRADICTIONS' | 'JOURNEYS' | 'PREP'>('QA');
  const [userQueryInput, setUserQueryInput] = useState('');
  const [selectedQA, setSelectedQA] = useState<LongitudinalQAQuery | null>(() => analysis.sampleLongitudinalQueries[0]);

  const handleRunQuery = (queryText: string) => {
    setUserQueryInput(queryText);
    const result = bridge.queryHealthIntelligence(queryText);
    setSelectedQA(result);
  };

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', padding: '0 24px 48px 24px' }}>
      
      {/* ── Header ── */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Brain size={28} color="#a78bfa" />
          AI-First Personal Health <span className="gradient-text">Copilot & Manager</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Longitudinal cross-correlated reasoning, missing record detection, specialist contradiction resolution, and chronic health journey stories.
        </p>
      </div>

      {/* ── Metric Banner Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        
        <div
          onClick={() => setActiveTab('AUDIT')}
          className="glass-card"
          style={{ padding: '20px', cursor: 'pointer', borderLeft: '4px solid #fb923c' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: 'rgba(251,146,60,0.12)', padding: '12px', borderRadius: '12px' }}>
              <FileQuestion size={22} color="#fb923c" />
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#fb923c', lineHeight: 1 }}>
                {analysis.missingRecordAudits.length}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Missing Referenced Records
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('CONTRADICTIONS')}
          className="glass-card"
          style={{ padding: '20px', cursor: 'pointer', borderLeft: '4px solid #f43f5e' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: 'rgba(244,63,94,0.12)', padding: '12px', borderRadius: '12px' }}>
              <AlertTriangle size={22} color="#f43f5e" />
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#f43f5e', lineHeight: 1 }}>
                {analysis.specialistContradictions.length}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Specialist Contradiction Alerts
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('JOURNEYS')}
          className="glass-card"
          style={{ padding: '20px', cursor: 'pointer', borderLeft: '4px solid #a78bfa' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: 'rgba(167,139,250,0.12)', padding: '12px', borderRadius: '12px' }}>
              <BookOpen size={22} color="#a78bfa" />
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#a78bfa', lineHeight: 1 }}>
                {analysis.healthJourneys.length}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Chronic Health Journeys
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('PREP')}
          className="glass-card"
          style={{ padding: '20px', cursor: 'pointer', borderLeft: '4px solid #34d399' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: 'rgba(52,211,153,0.12)', padding: '12px', borderRadius: '12px' }}>
              <CalendarCheck size={22} color="#34d399" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#34d399', lineHeight: 1 }}>
                Ready
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Physician Handoff Brief
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('QA')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'QA' ? '#a78bfa' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Sparkles size={16} /> Longitudinal Q&A Engine
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'AUDIT' ? '#a78bfa' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FileQuestion size={16} /> Missing Record Auditor ({analysis.missingRecordAudits.length})
        </button>

        <button
          onClick={() => setActiveTab('CONTRADICTIONS')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'CONTRADICTIONS' ? '#a78bfa' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertTriangle size={16} /> Specialist Disagreement Resolver ({analysis.specialistContradictions.length})
        </button>

        <button
          onClick={() => setActiveTab('JOURNEYS')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'JOURNEYS' ? '#a78bfa' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <BookOpen size={16} /> Chronic Health Journeys ({analysis.healthJourneys.length})
        </button>

        <button
          onClick={() => setActiveTab('PREP')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'PREP' ? '#a78bfa' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Stethoscope size={16} /> Appointment Prep & Handoff
        </button>
      </div>

      {/* ── Tab 1: Longitudinal Q&A Engine ── */}
      {activeTab === 'QA' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Query Bar */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Brain size={20} color="#a78bfa" /> Ask Your Lifelong Health Record
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Queries analyze multi-year lab trends, medication start/stop dates, symptom onset, and provider clinical notes simultaneously.
            </p>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <input
                type="text"
                value={userQueryInput}
                onChange={(e) => setUserQueryInput(e.target.value)}
                placeholder="Ask any question, e.g. 'Which medications was I taking when my cholesterol improved?' or 'When did my fatigue begin?'"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(0,0,0,0.3)',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
              <button
                onClick={() => handleRunQuery(userQueryInput || 'Which medications was I taking when my cholesterol improved?')}
                style={{
                  padding: '12px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #a78bfa, #6366f1)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Search size={16} /> Execute AI Reasoning Query
              </button>
            </div>

            {/* Sample Prompts */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Sample AI Queries:
              </span>
              {analysis.sampleLongitudinalQueries.map(q => (
                <button
                  key={q.id}
                  onClick={() => handleRunQuery(q.question)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid rgba(167,139,250,0.3)',
                    background: 'rgba(167,139,250,0.1)',
                    color: '#a78bfa',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  "{q.question}"
                </button>
              ))}
            </div>
          </div>

          {/* AI Response Card */}
          {selectedQA && (
            <div className="glass-card" style={{ padding: '28px', borderLeft: '5px solid #a78bfa' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Sparkles size={20} color="#a78bfa" />
                <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
                  Query: "{selectedQA.question}"
                </h4>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: '15px', color: '#fff', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                  {selectedQA.answerNarrative}
                </p>
              </div>

              {/* Correlated Parameters Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ background: 'rgba(167,139,250,0.08)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Referenced Timeframe
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} /> {selectedQA.referencedTimeframe}
                  </div>
                </div>

                <div style={{ background: 'rgba(56,189,248,0.08)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Correlated Medications
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8' }}>
                    {selectedQA.correlatedMedications.join(', ')}
                  </div>
                </div>

                <div style={{ background: 'rgba(52,211,153,0.08)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Correlated Biomarkers
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#34d399' }}>
                    {selectedQA.correlatedBiomarkers.join(', ')}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ── Tab 2: Proactive Missing Record Auditor ── */}
      {activeTab === 'AUDIT' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ marginBottom: '8px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fb923c', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileQuestion size={20} /> Proactive Missing Record Auditor
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              The AI continuously audits doctor notes and referrals for tests, imaging, or consults referenced by physicians that do not exist in your vault.
            </p>
          </div>

          {analysis.missingRecordAudits.map(item => (
            <div key={item.id} className="glass-card" style={{ padding: '24px', borderLeft: '4px solid #fb923c' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <span style={{ background: 'rgba(251,146,60,0.15)', color: '#fb923c', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
                    REFERENCED RECORD MISSING
                  </span>
                  <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#fff', margin: '6px 0 2px 0' }}>
                    {item.referencedTitle}
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Referenced by <strong>{item.referringProvider}</strong> in <em>{item.sourceDocName}</em> ({item.dateReferenced})
                  </span>
                </div>

                <button
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #fb923c, #f43f5e)',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Import Report Now <ArrowRight size={14} />
                </button>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px 18px', borderRadius: '10px', fontSize: '13px', color: '#fff', border: '1px solid rgba(255,255,255,0.05)' }}>
                💬 <strong>AI Proactive Prompt:</strong> "{item.promptMessage}"
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tab 3: Specialist Disagreement Resolver ── */}
      {activeTab === 'CONTRADICTIONS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ marginBottom: '4px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} /> Specialist Disagreement & Contradiction Resolver
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Detects conflicting clinical directives, drug contraindications, or conflicting target goals between different attending specialists.
            </p>
          </div>

          {analysis.specialistContradictions.map(alert => (
            <div key={alert.id} className="glass-card" style={{ padding: '24px', borderLeft: '5px solid #f43f5e' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={20} color="#f43f5e" /> {alert.topic}
                </h4>
                <span style={{ background: 'rgba(244,63,94,0.15)', color: '#f43f5e', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px' }}>
                  {alert.conflictSeverity} CLINICAL CONFLICT
                </span>
              </div>

              {/* Side-by-Side Specialist Directives */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '10px', borderLeft: '3px solid #38bdf8' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', marginBottom: '6px' }}>
                    Specialist A: {alert.providerA}
                  </div>
                  <div style={{ fontSize: '13px', color: '#fff', lineHeight: 1.4 }}>
                    "{alert.directiveA}"
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '10px', borderLeft: '3px solid #fb923c' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#fb923c', marginBottom: '6px' }}>
                    Specialist B: {alert.providerB}
                  </div>
                  <div style={{ fontSize: '13px', color: '#fff', lineHeight: 1.4 }}>
                    "{alert.directiveB}"
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(244,63,94,0.08)', padding: '14px 18px', borderRadius: '10px', marginBottom: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#f43f5e', marginBottom: '4px' }}>
                  Potential Clinical Impact & Risk
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {alert.clinicalImpact}
                </div>
              </div>

              <div style={{ background: 'rgba(167,139,250,0.1)', padding: '14px 18px', borderRadius: '10px', border: '1px solid rgba(167,139,250,0.3)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#a78bfa', marginBottom: '4px' }}>
                  💡 Recommended Question to Ask Your Doctor at Next Appointment:
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                  "{alert.recommendedQuestionForDoctor}"
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tab 4: Chronic Health Journeys ── */}
      {activeTab === 'JOURNEYS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ marginBottom: '4px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} /> Continuous Health Journey Narratives
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Instead of 400 isolated PDFs, the AI continuously organizes your health records into coherent chronic condition stories.
            </p>
          </div>

          {analysis.healthJourneys.map(journey => (
            <div key={journey.journeyId} className="glass-card" style={{ padding: '28px', borderLeft: '5px solid #a78bfa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>
                    {journey.journeyName}
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Started: {journey.startDate} | Connected Documents: {journey.linkedDocIds.length}
                  </span>
                </div>
              </div>

              {/* Narrative Text */}
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '18px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', color: '#fff', lineHeight: 1.6 }}>
                📖 <strong>Continuous Narrative Story:</strong><br />
                {journey.summaryNarrative}
              </div>

              {/* Milestones & Biomarker Trends */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                
                <div>
                  <h5 style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', marginBottom: '10px', textTransform: 'uppercase' }}>
                    Chronological Milestones
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {journey.keyMilestones.map((m, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid #38bdf8' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.date}</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{m.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{m.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 style={{ fontSize: '13px', fontWeight: 700, color: '#34d399', marginBottom: '10px', textTransform: 'uppercase' }}>
                    Biomarker Progression
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {journey.biomarkerTrends.map((t, idx) => (
                      <div key={idx} style={{ background: 'rgba(52,211,153,0.08)', padding: '12px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{t.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t.changeText}</div>
                        </div>
                        <span style={{ background: 'rgba(52,211,153,0.2)', color: '#34d399', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <TrendingDown size={12} /> {t.direction}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Unanswered Questions */}
              <div style={{ background: 'rgba(251,146,60,0.08)', padding: '14px 18px', borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#fb923c', marginBottom: '6px' }}>
                  ❓ Unanswered Clinical Questions Remaining:
                </div>
                <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {journey.unansweredQuestions.map((q, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>{q}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tab 5: Appointment Prep Brief & Physician Handoff ── */}
      {activeTab === 'PREP' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ marginBottom: '4px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Stethoscope size={20} /> Smart Appointment Prep & Physician Handoff Brief
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Generate custom pre-appointment question checklists and a 1-page executive physician handoff brief for your upcoming visit.
            </p>
          </div>

          {analysis.appointmentBriefs.map(brief => (
            <div key={brief.appointmentId} className="glass-card" style={{ padding: '28px', borderLeft: '5px solid #34d399' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>
                    {brief.specialty}
                  </h4>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Provider: <strong>{brief.doctorName}</strong> | Date: <strong>{brief.appointmentDate}</strong>
                  </span>
                </div>

                <button
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #34d399, #0284c7)',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Download size={15} /> Download 1-Page PDF Handoff
                </button>
              </div>

              {/* 1-Page Physician Handoff Summary */}
              <div style={{ background: '#090d16', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#34d399', marginBottom: '8px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} /> Executive Physician Handoff Note
                </div>
                <pre style={{ fontSize: '13px', color: '#fff', whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'monospace', lineHeight: 1.5 }}>
                  {brief.physicianHandoffSummary}
                </pre>
              </div>

              {/* Questions Checklist for Patient */}
              <div style={{ background: 'rgba(167,139,250,0.08)', padding: '18px', borderRadius: '12px' }}>
                <h5 style={{ fontSize: '14px', fontWeight: 700, color: '#a78bfa', margin: '0 0 10px 0' }}>
                  Suggested Questions to Ask Your Physician:
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {brief.suggestedQuestionsToAsk.map((q, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#fff' }}>
                      <input type="checkbox" defaultChecked style={{ accentColor: '#a78bfa' }} />
                      <span>"{q}"</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
