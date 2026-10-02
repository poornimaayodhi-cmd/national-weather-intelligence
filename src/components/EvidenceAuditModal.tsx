import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Clock,
  Sparkles,
  Camera,
  Layers,
  CheckCircle2,
  FileText,
  HelpCircle,
  TrendingUp,
  Share2,
  Radio,
  CloudLightning,
  Database,
  Globe,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info,
  Sliders,
  Award,
} from 'lucide-react';
import {
  Module3VerificationResult,
  VerificationFactorDetail,
  VerificationSourceBreakdown,
  SourceType,
} from '../types.ts';

interface EvidenceAuditModalProps {
  verification: Module3VerificationResult;
  onClose: () => void;
  onReanalyzeWithAI: (eventId: string) => Promise<void>;
  isAnalyzingAI: boolean;
}

export const EvidenceAuditModal: React.FC<EvidenceAuditModalProps> = ({
  verification,
  onClose,
  onReanalyzeWithAI,
  isAnalyzingAI,
}) => {
  const [activeTab, setActiveTab] = useState<'FACTORS' | 'SOURCES' | 'DECISION' | 'LEDGER'>('FACTORS');

  const sourceIcons: Record<SourceType, React.ReactNode> = {
    SOCIAL_MEDIA: <Share2 className="w-3.5 h-3.5 text-blue-400" />,
    CITIZEN: <Radio className="w-3.5 h-3.5 text-emerald-400" />,
    WEATHER_API: <CloudLightning className="w-3.5 h-3.5 text-sky-400" />,
    PUBLIC_DATASET: <Database className="w-3.5 h-3.5 text-amber-400" />,
    WEBSITE: <Globe className="w-3.5 h-3.5 text-slate-300" />,
  };

  const getConfidenceLevelBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return {
          bg: 'bg-emerald-950/80 border-emerald-800 text-emerald-300',
          dot: 'bg-emerald-400',
          label: 'HIGH CONFIDENCE',
          sub: 'Evidence-Supported',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-950/80 border-amber-800 text-amber-300',
          dot: 'bg-amber-400',
          label: 'MEDIUM CONFIDENCE',
          sub: 'Provisional Monitoring',
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-rose-950/80 border-rose-800 text-rose-300',
          dot: 'bg-rose-400',
          label: 'LOW CONFIDENCE',
          sub: 'Disputed or Uncorroborated',
        };
    }
  };

  const getFactorStatusBadge = (status: VerificationFactorDetail['status']) => {
    switch (status) {
      case 'OPTIMAL':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'MODERATE':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'DEFICIT':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'PENALTY':
        return 'bg-rose-950 text-rose-300 border-rose-800';
    }
  };

  const confBadge = getConfidenceLevelBadge(verification.confidence_level);
  const factorKeys = Object.keys(verification.factors) as Array<keyof typeof verification.factors>;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    >
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono text-xs font-bold bg-slate-950 text-slate-300 px-2.5 py-0.5 rounded border border-slate-800">
                {verification.event_id}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                {verification.hazard}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${confBadge.bg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${confBadge.dot}`}></span>
                <span>{confBadge.label} ({verification.evidence_score}%)</span>
              </span>
              {verification.model_assisted && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-950/60 text-blue-300 border border-blue-800/60 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  Gemini AI Verified
                </span>
              )}
            </div>

            <h2 id="audit-modal-title" className="text-xl font-bold text-white tracking-tight">
              Evidence Audit & Explainable Decision Support
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {verification.location.city}, {verification.location.state} • Active window:{' '}
              {new Date(verification.time_window.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
              {new Date(verification.time_window.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({verification.time_window.duration_hours}h duration)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onReanalyzeWithAI(verification.event_id)}
              disabled={isAnalyzingAI}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs disabled:opacity-50"
              title="Trigger Gemini 3.8 Flash meteorological deep reasoning"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAnalyzingAI ? 'animate-spin text-blue-200' : ''}`} />
              <span>{isAnalyzingAI ? 'Re-Analyzing...' : 'Deep AI Re-Analysis'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Mandatory Regulatory & Operational Disclaimer Banner */}
        <div className="bg-blue-950/50 border-b border-blue-900/60 px-5 py-2.5 flex items-center justify-between text-xs text-blue-200 gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="font-medium">
              <strong>OPERATIONAL NOTICE:</strong> {verification.disclaimer} Official government declarations remain under the sole jurisdiction of authorized emergency management agencies.
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-5 border-b border-slate-800 bg-slate-950 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('FACTORS')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'FACTORS'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>9-Factor Evidence Audit</span>
          </button>

          <button
            onClick={() => setActiveTab('DECISION')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'DECISION'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Decision Support & Missing Evidence</span>
          </button>

          <button
            onClick={() => setActiveTab('SOURCES')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'SOURCES'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Official vs Citizen Sources ({verification.supporting_sources.total_count})</span>
          </button>

          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'LEDGER'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Mathematical Score Ledger</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900">
          {/* TAB 1: 9-FACTOR EVIDENCE AUDIT */}
          {activeTab === 'FACTORS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block mb-0.5">
                    OVERALL EVIDENCE VERIFICATION SCORE
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-extrabold font-mono text-white">
                      {verification.evidence_score}%
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${confBadge.bg}`}>
                      {verification.confidence_level} CONFIDENCE
                    </span>
                    <span className="text-xs text-slate-400">
                      Status: <strong className="text-slate-200">{verification.verification_status}</strong>
                    </span>
                  </div>
                </div>

                <div className="w-48 bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
                  <div
                    className={`h-full rounded-full ${
                      verification.evidence_score >= 75
                        ? 'bg-emerald-500'
                        : verification.evidence_score >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${verification.evidence_score}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {factorKeys.map((key, idx) => {
                  const factor = verification.factors[key];
                  return (
                    <div
                      key={key}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-2 hover:border-slate-750 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[11px] flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <h4 className="text-xs font-bold text-white tracking-tight">
                            {factor.name}
                          </h4>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getFactorStatusBadge(
                            factor.status
                          )}`}
                        >
                          {factor.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        {factor.summary}
                      </p>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-900 font-mono">
                        <span className="text-slate-300 font-medium">
                          Metric: {factor.metric_value}
                        </span>
                        <span className="text-blue-400 font-semibold">
                          +{factor.weighted_contribution} pts ({factor.score} × {(factor.weight * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: DECISION SUPPORT & MISSING EVIDENCE */}
          {activeTab === 'DECISION' && (
            <div className="space-y-5">
              {/* Why this event received this confidence */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                  <Award className="w-4 h-4" />
                  <span>Why this event received {verification.confidence_level} Confidence:</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {verification.confidence_explanation}
                </p>
              </div>

              {/* Recommended Next Operational Action */}
              <div className="p-5 rounded-xl bg-blue-950/40 border border-blue-900/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Recommended Next Action:</span>
                </div>
                <p className="text-sm font-medium text-slate-100 leading-relaxed">
                  {verification.recommended_next_action}
                </p>
              </div>

              {/* What Evidence is Missing */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4" />
                  <span>Evidence Deficit & Missing Ground Truth:</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {verification.evidence_missing.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: OFFICIAL VS CITIZEN/SOCIAL EVIDENCE */}
          {activeTab === 'SOURCES' && (
            <div className="space-y-6">
              {/* Supporting Official Agencies */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CloudLightning className="w-4 h-4 text-sky-400" />
                    <h3 className="text-sm font-bold text-white">
                      Official Weather & Government Datasets ({verification.supporting_sources.official_count})
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    NWS, NOAA, USGS & Certified APIs
                  </span>
                </div>

                {verification.supporting_sources.official_count === 0 ? (
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 text-xs text-slate-400 italic">
                    No official agency bulletins or certified datasets currently corroborating this cluster. Relying on crowdsourced observations.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {verification.supporting_sources.list
                      .filter((s) => s.is_official)
                      .map((src) => (
                        <div
                          key={src.report_id}
                          className="p-3.5 rounded-xl bg-slate-950 border border-sky-900/50 space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="p-1 rounded bg-sky-950 border border-sky-800 text-sky-300">
                                {sourceIcons[src.source_type]}
                              </span>
                              <span className="font-bold text-sky-200">{src.source_platform}</span>
                              <span className="text-slate-400 font-mono text-[11px]">[{src.report_id}]</span>
                            </div>
                            <span className="font-mono text-emerald-400 text-xs font-semibold">
                              {src.reliability_score}% Certified
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed font-mono">
                            {src.content}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Supporting Citizen Observers & Social Media */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">
                      Citizen Observers & Social Media Ground Reports ({verification.supporting_sources.citizen_social_count})
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Eyewitness Spotters & mPING Field Reports
                  </span>
                </div>

                <div className="space-y-2.5">
                  {verification.supporting_sources.list
                    .filter((s) => !s.is_official)
                    .map((src) => (
                      <div
                        key={src.report_id}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded bg-slate-900 border border-slate-800">
                              {sourceIcons[src.source_type]}
                            </span>
                            <span className="font-semibold text-slate-200">{src.source_platform}</span>
                            <span className="text-slate-400 text-[11px]">by {src.author_name || 'Anonymous'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                            <span>{src.distance_km} km offset</span>
                            <span>•</span>
                            <span>{src.time_delta_mins}m</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {src.content}
                        </p>

                        {src.has_media && src.media_url && (
                          <div className="pt-2">
                            <div className="flex items-center gap-1.5 text-[11px] text-blue-400 mb-1">
                              <Camera className="w-3.5 h-3.5" />
                              <span>Attached Ground-Truth Photo Reference</span>
                            </div>
                            <img
                              src={src.media_url}
                              alt="Observation evidence"
                              className="w-full max-w-sm h-36 object-cover rounded-lg border border-slate-800"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Conflicting Reports if present */}
              {verification.conflicting_sources.total_count > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                    <h3 className="text-sm font-bold">
                      Conflicting Ground Reports ({verification.conflicting_sources.total_count})
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {verification.conflicting_sources.list.map((c) => (
                      <div
                        key={c.report_id}
                        className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/70 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-rose-300">{c.source_platform}</span>
                          <span className="font-mono text-[11px] text-rose-400">[{c.report_id}]</span>
                        </div>
                        <p className="text-xs text-rose-200">
                          {c.content}
                        </p>
                        <p className="text-[11px] text-rose-400 font-medium">
                          Conflict Basis: {c.conflict_reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MATHEMATICAL SCORE LEDGER */}
          {activeTab === 'LEDGER' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Transparent Step-by-Step Scoring Formula:
                </h4>
                <p className="text-xs text-slate-300">
                  Total Evidence Score is calculated by evaluating all 9 distinct dimensions with transparent weights and penalty constraints.
                </p>
              </div>

              <div className="space-y-2.5">
                {verification.audit_ledger.map((step) => (
                  <div
                    key={step.step}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                          Step {step.step}
                        </span>
                        <h5 className="text-xs font-bold text-white tracking-tight">{step.title}</h5>
                      </div>
                      <p className="text-xs text-slate-400">{step.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/80 px-2 py-1 rounded border border-blue-900/60 block mb-1">
                        +{step.points} pts
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {step.formula_basis}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono">
            Verified: {new Date(verification.verified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Engine: Module 3 AI Decision Support
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
