import React, { useState } from 'react';
import { MedicalDataBridge } from '../core/MedicalDataBridge';
import { TimelineCategory, TimelineSeverity, TimelineEvent } from '../core/types';
import { useMedicalData } from '../context/MedicalDataContext';
import { 
  CalendarClock, 
  Search, 
  Pill, 
  TestTube, 
  Activity, 
  FileText, 
  Share2, 
  Stethoscope, 
  TrendingUp, 
  AlertTriangle, 
  Copy, 
  Check,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
  ArrowRight
} from 'lucide-react';

export const TimelineDashboard: React.FC = () => {
  const bridge = MedicalDataBridge.getInstance();
  const { setSelectedDocument, setActiveTab, documents } = useMedicalData();

  const [selectedCategory, setSelectedCategory] = useState<TimelineCategory | 'ALL'>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<TimelineSeverity | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const fullTimeline = bridge.getPatientTimeline();
  const summary = bridge.getTimelineSummary();

  const filteredEvents = bridge.getPatientTimeline({
    category: selectedCategory,
    severity: selectedSeverity,
    searchTerm
  });

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify({ summary, events: filteredEvents }, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInspectDocument = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      setSelectedDocument(doc);
      setActiveTab('viewer');
    }
  };

  const getEventIcon = (iconName: string, category: TimelineCategory) => {
    switch (iconName) {
      case 'Pill': return <Pill size={18} />;
      case 'TestTube': return <TestTube size={18} />;
      case 'Activity': return <Activity size={18} />;
      case 'Share2': return <Share2 size={18} />;
      case 'Stethoscope': return <Stethoscope size={18} />;
      case 'TrendingUp': return <TrendingUp size={18} />;
      default:
        if (category === 'Medications') return <Pill size={18} />;
        if (category === 'Lab Results') return <TestTube size={18} />;
        if (category === 'Imaging Scans') return <FileText size={18} />;
        if (category === 'Referrals') return <Share2 size={18} />;
        if (category === 'Clinical Visits') return <Stethoscope size={18} />;
        return <CalendarClock size={18} />;
    }
  };

  const categoriesList: { id: TimelineCategory | 'ALL'; label: string; count: number }[] = [
    { id: 'ALL', label: 'All Events', count: fullTimeline.length },
    { id: 'Medications', label: 'Medications', count: summary.categoryBreakdown['Medications'] || 0 },
    { id: 'Lab Results', label: 'Lab Results', count: summary.categoryBreakdown['Lab Results'] || 0 },
    { id: 'Imaging Scans', label: 'Imaging Scans', count: summary.categoryBreakdown['Imaging Scans'] || 0 },
    { id: 'Referrals', label: 'Referrals', count: summary.categoryBreakdown['Referrals'] || 0 },
    { id: 'Clinical Visits', label: 'Clinical Visits', count: summary.categoryBreakdown['Clinical Visits'] || 0 },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 40px 24px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(56, 189, 248, 0.2))',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              padding: '10px',
              borderRadius: '12px',
              color: '#c084fc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CalendarClock size={26} />
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 700 }}>
              Patient Timeline <span className="gradient-text">Intelligence Agent</span>
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Unified chronological feed of medications, lab observations, imaging scans, referrals, and visit summaries.
          </p>
        </div>

        <button className="btn-primary" onClick={handleCopyJson} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied Timeline JSON' : 'Export Timeline JSON'}
        </button>
      </div>

      {/* Patient Milestone Summary Header Banner */}
      <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(139, 92, 246, 0.1))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={20} color="#06b6d4" />
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>PATIENT PROFILE</span>
              <strong style={{ fontSize: '15px', color: '#fff' }}>{summary.patientName} (DOB: 1985-04-12)</strong>
            </div>
          </div>

          <div style={{ width: '1px', height: '32px', background: 'var(--border-color)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} color="#c084fc" />
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>TIMELINE SPAN</span>
              <strong style={{ fontSize: '15px', color: '#fff' }}>{summary.earliestDate} $\rightarrow$ {summary.latestDate}</strong>
            </div>
          </div>

          <div style={{ width: '1px', height: '32px', background: 'var(--border-color)' }} />

          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>TOTAL EVENTS</span>
            <strong style={{ fontSize: '15px', color: '#38bdf8' }}>{summary.totalEventsCount} Chronological Events</strong>
          </div>
        </div>

        {summary.activeSafetyAlertsCount > 0 && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', padding: '6px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e', fontSize: '12px', fontWeight: 700 }}>
            <AlertTriangle size={14} />
            <span>{summary.activeSafetyAlertsCount} Safety / Abnormal Value Flags</span>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categoriesList.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                background: selectedCategory === cat.id ? '#0284c7' : 'rgba(255, 255, 255, 0.06)',
                color: selectedCategory === cat.id ? '#fff' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: selectedCategory === cat.id ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              {cat.label}
              <span style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: '8px',
                fontWeight: 700
              }}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Severity & Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as TimelineSeverity | 'ALL')}
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '13px'
            }}
          >
            <option value="ALL">All Severities</option>
            <option value="critical">Critical / Warning Only</option>
            <option value="normal">Normal Events</option>
          </select>

          <div style={{ position: 'relative', width: '220px' }}>
            <input
              type="text"
              placeholder="Search timeline..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-color)',
                padding: '6px 12px 6px 30px',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '13px'
              }}
            />
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text-muted)' }} />
          </div>
        </div>
      </div>

      {/* Vertical Timeline Feed */}
      <div style={{ position: 'relative', paddingLeft: '32px' }}>
        {/* Central Vertical Spine Line */}
        <div style={{
          position: 'absolute',
          left: '15px',
          top: '10px',
          bottom: '10px',
          width: '3px',
          background: 'linear-gradient(180deg, #8b5cf6, #3b82f6, #10b981)',
          borderRadius: '2px'
        }} />

        {filteredEvents.length === 0 ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>No timeline events match the selected filters.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredEvents.map((evt: TimelineEvent) => {
              const isExpanded = expandedEventId === evt.id;
              const isAlert = evt.severity === 'warning' || evt.severity === 'critical';

              return (
                <div key={evt.id} style={{ position: 'relative' }}>
                  {/* Timeline Node Icon Circle */}
                  <div style={{
                    position: 'absolute',
                    left: '-32px',
                    top: '16px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: evt.colorAccent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: `0 0 12px ${evt.colorAccent}`,
                    zIndex: 2
                  }}>
                    {getEventIcon(evt.iconName, evt.category)}
                  </div>

                  {/* Event Card */}
                  <div
                    className="glass-card"
                    style={{
                      padding: '18px 20px',
                      borderLeft: `4px solid ${evt.colorAccent}`,
                      background: isAlert ? 'rgba(244, 63, 94, 0.05)' : undefined
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <span style={{
                            background: 'rgba(0,0,0,0.4)',
                            color: evt.colorAccent,
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            border: `1px solid ${evt.colorAccent}`
                          }}>
                            {evt.timestamp}
                          </span>

                          <span style={{
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            fontWeight: 600,
                            textTransform: 'uppercase'
                          }}>
                            {evt.category}
                          </span>

                          {isAlert && (
                            <span style={{
                              background: evt.severity === 'critical' ? '#f43f5e' : '#f59e0b',
                              color: '#fff',
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '10px'
                            }}>
                              {evt.severity.toUpperCase()} FLAG
                            </span>
                          )}
                        </div>

                        <h4 style={{ fontSize: '16.5px', fontWeight: 700, color: '#fff', margin: '4px 0 2px 0' }}>
                          {evt.title}
                        </h4>

                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                          {evt.subtitle}
                        </p>
                      </div>

                      {/* Right actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          onClick={() => handleInspectDocument(evt.sourceDocId)}
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid var(--border-color)',
                            color: '#38bdf8',
                            fontSize: '12px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          Source Doc <ArrowRight size={12} />
                        </button>

                        <button
                          onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Details Drawer */}
                    {isExpanded && (
                      <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed rgba(255,255,255,0.1)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <p style={{ marginBottom: '8px', lineHeight: '1.5' }}>
                          <strong>Clinical Narrative:</strong> {evt.details}
                        </p>
                        
                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                          <span>Document File: <strong style={{ color: '#fff' }}>{evt.sourceDocName}</strong></span>
                          {evt.providerName && <span>Provider: <strong style={{ color: '#c084fc' }}>{evt.providerName}</strong></span>}
                          {evt.facilityName && <span>Facility: <strong style={{ color: '#34d399' }}>{evt.facilityName}</strong></span>}
                        </div>

                        {evt.tags && evt.tags.length > 0 && (
                          <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                            {evt.tags.map((tag, idx) => (
                              <span key={idx} style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
