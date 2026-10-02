import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Clock,
  MapPin,
  Layers,
  Sparkles,
  Share2,
  Radio,
  CloudLightning,
  Database,
  Globe,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Activity,
  User,
  Compass,
  AlertCircle,
  RotateCw,
  ExternalLink,
} from 'lucide-react';
import { CorrelatedWeatherEvent, ReportCorrelationMetric, SourceType } from '../types.ts';

interface EventDetailModalProps {
  event: CorrelatedWeatherEvent;
  onClose: () => void;
  onInjectConflict: (eventId: string) => Promise<void>;
  onVerifyWithAI: (eventId: string) => Promise<void>;
  isInjectingConflict: boolean;
  isVerifyingAI: boolean;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onInjectConflict,
  onVerifyWithAI,
  isInjectingConflict,
  isVerifyingAI,
}) => {
  const [activeTab, setActiveTab] = useState<'evidence' | 'grouping' | 'confidence' | 'matrix'>('evidence');
  const [reportFilter, setReportFilter] = useState<'ALL' | 'SUPPORTING' | 'CONFLICTING'>('ALL');

  const sourceIcons: Record<SourceType, React.ReactNode> = {
    SOCIAL_MEDIA: <Share2 className="w-3.5 h-3.5 text-purple-400" />,
    CITIZEN: <Radio className="w-3.5 h-3.5 text-emerald-400" />,
    WEATHER_API: <CloudLightning className="w-3.5 h-3.5 text-sky-400" />,
    PUBLIC_DATASET: <Database className="w-3.5 h-3.5 text-amber-400" />,
    WEBSITE: <Globe className="w-3.5 h-3.5 text-rose-400" />,
  };

  const sourceLabels: Record<SourceType, string> = {
    SOCIAL_MEDIA: 'Social Media',
    CITIZEN: 'Citizen Observer',
    WEATHER_API: 'Weather API',
    PUBLIC_DATASET: 'Public Dataset',
    WEBSITE: 'Website / News',
  };

  const getConfidenceBadge = (level: string, score: number) => {
    switch (level) {
      case 'VERY_HIGH':
        return {
          bg: 'bg-emerald-950/80 border-emerald-800 text-emerald-300',
          dot: 'bg-emerald-400',
          label: 'Highly Confirmed',
        };
      case 'HIGH':
        return {
          bg: 'bg-blue-950/80 border-blue-800 text-blue-300',
          dot: 'bg-blue-400',
          label: 'Strong Corroboration',
        };
      case 'DISPUTED':
        return {
          bg: 'bg-rose-950/80 border-rose-800 text-rose-300',
          dot: 'bg-rose-400',
          label: 'Disputed / Conflicting',
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-950/80 border-amber-800 text-amber-300',
          dot: 'bg-amber-400',
          label: 'Moderate Agreement',
        };
      default:
        return {
          bg: 'bg-slate-800 border-slate-700 text-slate-300',
          dot: 'bg-slate-400',
          label: 'Single Source Unverified',
        };
    }
  };

  const confBadge = getConfidenceBadge(event.confidence.confidence_level, event.confidence.overall_score);

  const filteredMetrics = event.report_metrics.filter((m) => {
    if (reportFilter === 'SUPPORTING') return m.is_supporting;
    if (reportFilter === 'CONFLICTING') return m.is_conflicting;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div
        id={`event-detail-${event.event_id}`}
        className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-100 my-auto"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-900/95 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-950 text-blue-400 border border-blue-800 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {event.title}
                </h3>
                <span className="font-mono text-xs bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-semibold">
                  {event.event_id}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${confBadge.bg}`}
                >
                  <span className={`w-2 h-2 rounded-full ${confBadge.dot} animate-pulse`}></span>
                  <span>
                    {confBadge.label} ({event.confidence.overall_score}%)
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {event.city}, {event.state} (Centroid: {event.centroid_lat}°N, {event.centroid_lng}°W)
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Duration: {event.duration_hours}h active window
                </span>
                <span className="flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-slate-500" />
                  Radius: {event.radius_km} km footprint
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onVerifyWithAI(event.event_id)}
              disabled={isVerifyingAI}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-xs disabled:opacity-50"
              title="Run Gemini AI Meteorological Verification"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isVerifyingAI ? 'animate-spin' : ''}`} />
              <span>{isVerifyingAI ? 'Verifying AI...' : 'Verify with Gemini AI'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="px-6 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'evidence'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Supporting & Conflicting Evidence ({event.report_metrics.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('grouping')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'grouping'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Why Reports Were Grouped</span>
            </button>

            <button
              onClick={() => setActiveTab('confidence')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'confidence'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Explainable Confidence Formula</span>
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'matrix'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Distance / Time Matrix</span>
            </button>
          </div>

          <button
            onClick={() => onInjectConflict(event.event_id)}
            disabled={isInjectingConflict}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg transition-colors disabled:opacity-50"
            title="Inject a conflicting eyewitness observation to test conflict resolution and confidence penalization"
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${isInjectingConflict ? 'animate-spin' : ''}`} />
            <span>Simulate Conflicting Report</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* AI Synthesis Banner (if generated) */}
          {event.ai_synthesis && (
            <div className="p-4 rounded-xl bg-blue-950/50 border border-blue-800/80 shadow-inner space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  AI Meteorological Verification Synthesis ({event.ai_synthesis.model_used || 'Gemini'})
                </span>
                <span className="text-slate-400 text-[11px]">
                  Verified at {new Date(event.ai_synthesis.verified_at).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                <strong>Meteorological Analysis:</strong> {event.ai_synthesis.meteorological_summary}
              </p>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                <strong>Dispute & Conflict Resolution:</strong> {event.ai_synthesis.conflict_resolution}
              </p>
              <div className="pt-2 border-t border-blue-900/60 flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>
                  <strong>Recommended Action:</strong> {event.ai_synthesis.recommended_action}
                </span>
              </div>
            </div>
          )}

          {/* TAB 1: EVIDENCE (SUPPORTING & CONFLICTING) */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              {/* Filter sub-bar */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReportFilter('ALL')}
                    className={`px-2.5 py-1 rounded-md border transition-colors ${
                      reportFilter === 'ALL'
                        ? 'bg-slate-800 text-white border-slate-700 font-semibold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    All Evidence ({event.report_metrics.length})
                  </button>
                  <button
                    onClick={() => setReportFilter('SUPPORTING')}
                    className={`px-2.5 py-1 rounded-md border transition-colors flex items-center gap-1.5 ${
                      reportFilter === 'SUPPORTING'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800 font-semibold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-emerald-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Supporting ({event.supporting_report_ids.length})</span>
                  </button>
                  <button
                    onClick={() => setReportFilter('CONFLICTING')}
                    className={`px-2.5 py-1 rounded-md border transition-colors flex items-center gap-1.5 ${
                      reportFilter === 'CONFLICTING'
                        ? 'bg-rose-950 text-rose-300 border-rose-800 font-semibold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-rose-300'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    <span>Conflicting ({event.conflicting_report_ids.length})</span>
                  </button>
                </div>

                <span className="text-slate-400 text-[11px]">
                  Reports preserved in Module 1 normalized repository
                </span>
              </div>

              {/* Reports List */}
              <div className="space-y-3">
                {filteredMetrics.map((metric) => (
                  <div
                    key={metric.report_id}
                    className={`p-4 rounded-xl border transition-colors ${
                      metric.is_conflicting
                        ? 'bg-rose-950/30 border-rose-800/80 shadow-xs'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="p-1 rounded bg-slate-900 border border-slate-800">
                          {sourceIcons[metric.source_type]}
                        </span>
                        <span className="text-xs font-semibold text-white">
                          {metric.source_platform}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          ({sourceLabels[metric.source_type]})
                        </span>
                        <span className="text-[11px] font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                          {metric.report_id}
                        </span>

                        {metric.is_conflicting ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-rose-900/60 text-rose-300 border border-rose-700 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3" />
                            Conflicting Report
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Supporting Evidence
                          </span>
                        )}
                      </div>

                      {/* Distance and Time Delta */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {metric.distance_km} km from epicenter
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {metric.time_delta_minutes >= 0 ? `+${metric.time_delta_minutes}` : metric.time_delta_minutes}m delta
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-semibold">
                          Reliability: {metric.reliability_score}%
                        </span>
                      </div>
                    </div>

                    {/* Content Narrative */}
                    <blockquote className="text-xs text-slate-200 pl-3 border-l-2 border-slate-700 py-1 my-2 bg-slate-900/40 rounded-r">
                      &ldquo;{metric.content}&rdquo;
                    </blockquote>

                    {/* Conflict Explanation (if conflicting) */}
                    {metric.is_conflicting && metric.conflict_reason && (
                      <div className="mt-2 p-2.5 bg-rose-950/60 border border-rose-800/80 rounded-lg text-xs text-rose-300 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                        <div>
                          <strong className="font-semibold">Conflict Audit:</strong> {metric.conflict_reason}
                          <p className="text-[11px] text-rose-400/90 mt-0.5">
                            Penalty applied: -20% from composite confidence score to represent uncertainty.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Contributor / Meta details */}
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-900">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-500" />
                          {metric.author_name || 'Verified System / Automated Feed'}
                        </span>
                        <span>•</span>
                        <span>{new Date(metric.timestamp).toLocaleString()}</span>
                      </div>
                      <span className="text-slate-500">
                        Semantic Concordance: {metric.semantic_match_score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: WHY REPORTS WERE GROUPED */}
          {activeTab === 'grouping' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-blue-400" />
                  Four-Pillar Correlation Clustering Framework
                </h4>
                <p className="text-xs text-slate-400">
                  Reports are correlated into this event entity using rigorous multi-dimensional matching across location, timestamp window, hazard taxonomy, and natural language semantic similarity.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Spatial Proximity */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      1. Spatial Proximity Closeness
                    </span>
                    <span className="text-[11px] font-mono bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                      ≤ {event.radius_km} km Radius
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {event.grouping_reasons.spatial_reason}
                  </p>
                  <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400 space-y-1">
                    <div>• Centroid Latitude: {event.centroid_lat}°</div>
                    <div>• Centroid Longitude: {event.centroid_lng}°</div>
                    <div>• Target Geocoding: {event.city}, {event.state}</div>
                  </div>
                </div>

                {/* 2. Temporal Window */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      2. Temporal Coincidence Window
                    </span>
                    <span className="text-[11px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                      {event.duration_hours}h Lifespan
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {event.grouping_reasons.temporal_reason}
                  </p>
                  <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400 space-y-1">
                    <div>• First Onset: {new Date(event.start_time).toLocaleTimeString()}</div>
                    <div>• Latest Observation: {new Date(event.end_time).toLocaleTimeString()}</div>
                    <div>• Max Threshold: Within 4.0h active convective cycle</div>
                  </div>
                </div>

                {/* 3. Hazard Concordance */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <CloudLightning className="w-4 h-4" />
                      3. Hazard Concordance & Compatibility
                    </span>
                    <span className="text-[11px] font-mono bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
                      {event.hazard_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {event.grouping_reasons.hazard_reason}
                  </p>
                  <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400 space-y-1">
                    <div>• Primary Event Category: {event.hazard_type}</div>
                    <div>• Concordance Check: Mutual compatibility matrix evaluated</div>
                  </div>
                </div>

                {/* 4. Semantic Similarity */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      4. Semantic & Landmark Entity Similarity
                    </span>
                    <span className="text-[11px] font-mono bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800">
                      NLP Jaccard Match
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {event.grouping_reasons.semantic_reason}
                  </p>
                  <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400 space-y-1">
                    <div>• Token Intersection: High entity and meteorological overlap</div>
                    <div>• Entity Verification: Corroborated corridor & transit points</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXPLAINABLE CONFIDENCE SCORE */}
          {activeTab === 'confidence' && (
            <div className="space-y-6">
              {/* Formula Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Transparent Mathematical Scoring Formula
                    </h4>
                    <p className="text-xs text-slate-400">
                      Zero black-box logic. Every positive corroboration and negative dispute is audited.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold font-mono text-white">
                      {event.confidence.overall_score}%
                    </span>
                    <p className="text-[11px] text-emerald-400 font-semibold">
                      {event.confidence.confidence_level}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-xs border border-slate-800 overflow-x-auto">
                  <code>{event.confidence.formula_expression}</code>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800/80">
                  <strong>Verification Audit:</strong> {event.confidence.audit_summary}
                </p>
              </div>

              {/* Factors Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Audited Factor Contribution Breakdown:
                </h4>

                <div className="space-y-2">
                  {event.confidence.factors.map((factor) => (
                    <div
                      key={factor.id}
                      className={`p-3.5 rounded-xl border flex items-start justify-between gap-4 ${
                        factor.type === 'positive'
                          ? 'bg-emerald-950/20 border-emerald-800/60'
                          : factor.type === 'negative'
                          ? 'bg-rose-950/30 border-rose-800/80'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{factor.name}</span>
                          <span
                            className={`text-[11px] font-mono font-bold px-2 py-0.2 rounded ${
                              factor.score_impact > 0
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : factor.score_impact < 0
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-slate-900 text-slate-400'
                            }`}
                          >
                            {factor.score_impact > 0 ? `+${factor.score_impact}%` : `${factor.score_impact}%`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{factor.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Source Reliability Weights */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  Source Type Ingestion Reliability Hierarchy
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-amber-400 font-semibold block mb-1">Public Dataset</span>
                    <span className="font-mono text-sm font-bold text-white">95% Base</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Certified NOAA/USGS</p>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-sky-400 font-semibold block mb-1">Weather API</span>
                    <span className="font-mono text-sm font-bold text-white">90% Base</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">NWS Doppler Radar</p>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-emerald-400 font-semibold block mb-1">Citizen Net</span>
                    <span className="font-mono text-sm font-bold text-white">78% Base</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">mPING Spotters</p>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-rose-400 font-semibold block mb-1">News Website</span>
                    <span className="font-mono text-sm font-bold text-white">72% Base</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Editorial Media</p>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-purple-400 font-semibold block mb-1">Social Media</span>
                    <span className="font-mono text-sm font-bold text-white">58% Base</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Eyewitness Feeds</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SPATIO-TEMPORAL MATRIX */}
          {activeTab === 'matrix' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Spatial Distance Matrix & Chronological Delta Timeline
                </h4>
                <p className="text-xs text-slate-400">
                  Exact mathematical offset of each contributing report relative to event geographic centroid ({event.centroid_lat}°N, {event.centroid_lng}°W) and chronological onset.
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Report ID</th>
                      <th className="p-3">Source Channel</th>
                      <th className="p-3">Distance to Centroid</th>
                      <th className="p-3">Time Delta</th>
                      <th className="p-3">Report Reliability</th>
                      <th className="p-3">Verification Stance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {event.report_metrics.map((metric) => (
                      <tr
                        key={metric.report_id}
                        className={metric.is_conflicting ? 'bg-rose-950/20 text-rose-200' : 'hover:bg-slate-900/50'}
                      >
                        <td className="p-3 font-mono font-semibold text-slate-200">
                          {metric.report_id}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            {sourceIcons[metric.source_type]}
                            <span className="font-medium text-slate-200">{metric.source_platform}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              metric.distance_km <= 5
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-slate-900 text-slate-300 border border-slate-800'
                            }`}
                          >
                            {metric.distance_km} km
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-300">
                          {metric.time_delta_minutes >= 0 ? `+${metric.time_delta_minutes}` : metric.time_delta_minutes} min
                        </td>
                        <td className="p-3 font-mono font-bold text-white">
                          {metric.reliability_score}%
                        </td>
                        <td className="p-3">
                          {metric.is_conflicting ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Contradictory / Conflict
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Corroborating
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-200">
              Module 2 Verification Engine
            </span>
            <span>•</span>
            <span>Original records safe & unmutated in Module 1 repository</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg font-medium transition-colors"
          >
            Close Event View
          </button>
        </div>
      </div>
    </div>
  );
};
