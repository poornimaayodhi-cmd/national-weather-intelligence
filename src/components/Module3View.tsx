import React, { useState, useEffect, useId } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Clock,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  FileCheck,
  Camera,
  Layers,
  Radio,
  Share2,
  CloudLightning,
  Database,
  Globe,
  TrendingUp,
  ArrowRight,
  Info,
  Sliders,
  ChevronRight,
  HelpCircle,
  Award,
  ShieldAlert,
} from 'lucide-react';
import {
  Module3VerificationResult,
  VerificationModuleStats,
  VerificationConfidenceLevel,
  SourceType,
} from '../types.ts';
import { EvidenceAuditModal } from './EvidenceAuditModal.tsx';

interface Module3ViewProps {
  onSwitchToModule1: () => void;
  onSwitchToModule2: () => void;
  onSwitchToModule4?: (eventId?: string) => void;
  selectedEventId?: string | null;
  onClearSelectedEventId?: () => void;
}

export const Module3View: React.FC<Module3ViewProps> = ({
  onSwitchToModule1,
  onSwitchToModule2,
  onSwitchToModule4,
  selectedEventId,
  onClearSelectedEventId,
}) => {
  const [verifications, setVerifications] = useState<Module3VerificationResult[]>([]);
  const [stats, setStats] = useState<VerificationModuleStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [confidenceFilter, setConfidenceFilter] = useState<VerificationConfidenceLevel | 'ALL'>('ALL');
  const [hazardFilter, setHazardFilter] = useState('ALL');
  const [officialOnlyFilter, setOfficialOnlyFilter] = useState(false);
  const [hasMediaFilter, setHasMediaFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Active Audit Modal
  const [activeAudit, setActiveAudit] = useState<Module3VerificationResult | null>(null);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Hero Verification Sequence State
  const [isVerifyingHero, setIsVerifyingHero] = useState(false);
  const [verifyStepIndex, setVerifyStepIndex] = useState(0);

  const VERIFICATION_STEPS = [
    'Collecting official confirmation...',
    'Checking gauge telemetry...',
    'Reconciling ground reports...',
    'Analyzing visual evidence...',
    'Resolving contradictions...',
    'Recalculating confidence...',
  ];

  const searchInputId = useId();

  const sourceIcons: Record<SourceType, React.ReactNode> = {
    SOCIAL_MEDIA: <Share2 className="w-3 h-3 text-blue-400" />,
    CITIZEN: <Radio className="w-3 h-3 text-emerald-400" />,
    WEATHER_API: <CloudLightning className="w-3 h-3 text-sky-400" />,
    PUBLIC_DATASET: <Database className="w-3 h-3 text-amber-400" />,
    WEBSITE: <Globe className="w-3 h-3 text-slate-300" />,
  };

  const fetchVerifications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [resList, resStats] = await Promise.all([
        fetch('/api/verification/events'),
        fetch('/api/verification/stats'),
      ]);

      const dataList = await resList.json();
      const dataStats = await resStats.json();

      if (dataList.success) {
        setVerifications(dataList.verifications);
        if (selectedEventId) {
          const match = dataList.verifications.find((v: Module3VerificationResult) => v.event_id === selectedEventId);
          if (match) setActiveAudit(match);
        }
      } else {
        setError(dataList.error || 'Failed to fetch verification results');
      }

      if (dataStats.success) {
        setStats(dataStats.stats);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching verification data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [selectedEventId]);

  const handleBatchAnalyze = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/verification/batch-analyze', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setVerifications(data.verifications);
        const statsRes = await fetch('/api/verification/stats');
        const statsData = await statsRes.json();
        if (statsData.success) setStats(statsData.stats);
        setNotificationMsg('Re-analyzed all 9 verification factors across correlated weather events.');
        setTimeout(() => setNotificationMsg(null), 3500);
      }
    } catch (err: any) {
      setError(err.message || 'Batch analysis failed');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleReanalyzeWithAI = async (eventId: string) => {
    try {
      setIsAnalyzingAI(true);
      const res = await fetch(`/api/verification/analyze/${eventId}`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.verification) {
        setActiveAudit(data.verification);
        setVerifications((prev) =>
          prev.map((v) => (v.event_id === eventId ? data.verification : v))
        );
        setNotificationMsg('Gemini AI-assisted deep meteorological verification complete.');
        setTimeout(() => setNotificationMsg(null), 3500);
      } else {
        alert(data.error || 'AI analysis failed');
      }
    } catch (err: any) {
      alert(err.message || 'Error running AI analysis');
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const handleVerifyHeroEvent = async () => {
    setIsVerifyingHero(true);
    setVerifyStepIndex(0);

    for (let i = 0; i < VERIFICATION_STEPS.length; i++) {
      setVerifyStepIndex(i);
      await new Promise((resolve) => setTimeout(resolve, 450));
    }

    try {
      const res = await fetch('/api/verification/verify-hero', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchVerifications();
        setNotificationMsg('Event verified: 91% HIGH confidence with 4+ independent channels and conflicts resolved.');
        setTimeout(() => setNotificationMsg(null), 4000);
      }
    } catch (err: any) {
      setError(err.message || 'Verification sequence failed');
    } finally {
      setIsVerifyingHero(false);
    }
  };

  const handleResolveConflict = async () => {
    try {
      const res = await fetch('/api/verification/resolve-hero-conflict', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchVerifications();
        setNotificationMsg('Discrepancy reconciled: bridge deck dry above, Adyar river causeway flooded at 14.85m.');
        setTimeout(() => setNotificationMsg(null), 4000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resolve conflict');
    }
  };

  const handleResetDemoScenario = async () => {
    try {
      const res = await fetch('/api/demo/reset-scenario', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchVerifications();
        setNotificationMsg('Reset demo scenario to initial state (48% LOW confidence, 2 conflicts, unverified).');
        setTimeout(() => setNotificationMsg(null), 4000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset demo scenario');
    }
  };

  const getConfidenceLevelBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return {
          bg: 'bg-emerald-950/80 border-emerald-800 text-emerald-300',
          dot: 'bg-emerald-400',
          label: 'HIGH CONFIDENCE',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-950/80 border-amber-800 text-amber-300',
          dot: 'bg-amber-400',
          label: 'MEDIUM CONFIDENCE',
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-rose-950/80 border-rose-800 text-rose-300',
          dot: 'bg-rose-400',
          label: 'LOW CONFIDENCE',
        };
    }
  };

  // Filtered verifications
  const filteredVerifications = verifications.filter((v) => {
    if (confidenceFilter !== 'ALL' && v.confidence_level !== confidenceFilter) {
      return false;
    }
    if (hazardFilter !== 'ALL' && v.hazard.toLowerCase() !== hazardFilter.toLowerCase()) {
      return false;
    }
    if (officialOnlyFilter && v.supporting_sources.official_count === 0) {
      return false;
    }
    if (hasMediaFilter && v.factors.image_video_evidence.score < 80) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match = `${v.event_id} ${v.hazard} ${v.location.city} ${v.location.state} ${v.confidence_explanation} ${v.recommended_next_action}`.toLowerCase();
      if (!match.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Scope & Operational Protocol */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-950/60 text-blue-300 border border-blue-800/60 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-blue-300" />
              Module 3 Active
            </span>
            <span className="text-xs text-slate-400">
              AI Verification & Explainable Decision Support
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Evidence-Backed Weather Event Verification Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Synthesizes 9 rigorous dimensions—evaluating source reliability, spatial/temporal proximity, multi-channel consensus, image/video proof, and official NWS/NOAA agreement into explainable confidence scores and actionable decision support.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleBatchAnalyze}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-colors shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Verifying...' : 'Re-verify All Events'}</span>
          </button>

          <button
            onClick={onSwitchToModule2}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Correlated Events (Module 2)</span>
          </button>
        </div>
      </div>

      {/* Mandatory Disclaimer Callout */}
      <div className="p-3.5 bg-blue-950/40 border border-blue-900/60 rounded-xl flex items-center gap-3 text-xs text-blue-200">
        <Info className="w-4 h-4 text-blue-400 shrink-0" />
        <span>
          <strong>OPERATIONAL MANDATE:</strong> All assessments are <em>AI-assisted verification</em> and <em>evidence-supported</em> estimations. This platform strictly distinguishes official accredited weather agencies from citizen crowdsourced reports and does not substitute for certified government emergency declarations.
        </span>
      </div>

      {/* Action Notification */}
      {notificationMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="text-emerald-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Verification KPI Strip */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-medium text-emerald-400 block mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              High Confidence
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-emerald-300">
                {stats.high_confidence_count}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                (Evidence-Supported)
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-medium text-amber-400 block mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Medium Confidence
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-amber-300">
                {stats.medium_confidence_count}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                (Provisional)
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-medium text-rose-400 block mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Low / Contested
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-rose-300">
                {stats.low_confidence_count}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                ({stats.events_with_conflicts} Disputed)
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-medium text-sky-400 block mb-1 flex items-center gap-1">
              <CloudLightning className="w-3.5 h-3.5" />
              Official Agreement
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-sky-300">
                {stats.events_with_official_agreement}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                NWS / USGS / NOAA
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-medium text-blue-400 block mb-1 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5" />
              Visual Evidence
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-blue-200">
                {stats.events_with_multimedia}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Photos / Videos
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Smart India Hackathon Hero Event Verification Showcase */}
      {(() => {
        const heroEvent = verifications.find(
          (v) => v.event_id.includes('CHE') || v.location.city.toLowerCase().includes('saidapet')
        );
        if (!heroEvent) return null;

        const isHigh = heroEvent.confidence_level === 'HIGH';
        const heroFactorsList = [
          { name: '1. Source Reliability', detail: heroEvent.factors.source_reliability },
          { name: '2. Independent Sources', detail: heroEvent.factors.independent_supporting_sources },
          { name: '3. Spatial Proximity', detail: heroEvent.factors.spatial_proximity },
          { name: '4. Temporal Proximity', detail: heroEvent.factors.temporal_proximity },
          { name: '5. Official-Agency Agreement', detail: heroEvent.factors.official_data_agreement },
          { name: '6. Cross-Channel Agreement', detail: heroEvent.factors.hazard_type_consistency },
          { name: '7. Visual Evidence', detail: heroEvent.factors.image_video_evidence },
          { name: '8. Contradiction Penalty', detail: heroEvent.factors.conflicting_sources },
          { name: '9. Evidence Completeness', detail: heroEvent.factors.semantic_similarity },
        ];

        return (
          <div
            id="hero-verification-showcase"
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-5"
          >
            {/* Top Badge & Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-md">
                  DEMO / SIMULATED DATA — JURY HERO SCENARIO
                </span>
                <span className="text-xs font-mono font-bold text-slate-300">
                  {heroEvent.event_id}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                  {heroEvent.hazard}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isHigh ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-950 text-emerald-300 border border-emerald-700 shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span>91% — HIGH CONFIDENCE</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-rose-950 text-rose-300 border border-rose-700 shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping"></span>
                    <span>48% — LOW CONFIDENCE</span>
                  </span>
                )}

                {isHigh ? (
                  <span className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                    VERIFIED
                  </span>
                ) : (
                  <span className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-rose-950/80 text-rose-400 border border-rose-800">
                    DISPUTED / UNVERIFIED
                  </span>
                )}
              </div>
            </div>

            {/* Hero Header */}
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Flash Flood — Saidapet, Chennai</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                  Adyar River Basin
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl">
                Maraimalai Adigal Bridge • Anna Salai Subways • West Saidapet Residential Inundation Zone (Centroid 13.021°N, 80.223°E)
              </p>
            </div>

            {/* 4 Key Comparison Metrics Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Supporting Sources</span>
                <div className="text-lg font-black text-slate-100 font-mono">
                  {heroEvent.supporting_sources.total_count} Sources
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Official ({heroEvent.supporting_sources.official_count}) • Citizen/Social ({heroEvent.supporting_sources.citizen_social_count})
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Independent Channels</span>
                <div
                  className={`text-lg font-black font-mono ${
                    isHigh ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {isHigh ? '4+ Channels' : '2 Channels'}
                </div>
                <span className="text-[11px] text-slate-400 block">
                  {isHigh
                    ? 'IMD Telemetry, CWC Gauge, Ground Spotter, Drone'
                    : 'Deficit: Requires cross-channel corroboration'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Official Confirmation</span>
                <div
                  className={`text-lg font-black font-mono ${
                    isHigh ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {isHigh ? 'YES' : 'PENDING'}
                </div>
                <span className="text-[11px] text-slate-400 block">
                  {isHigh
                    ? 'IMD AWS + CWC 14.85m River Gauge'
                    : 'Awaiting CWC & IMD field reconciliation'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Conflict Status</span>
                <div
                  className={`text-lg font-black font-mono ${
                    isHigh ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isHigh ? 'RESOLVED' : '2 CONFLICTS'}
                </div>
                <span className="text-[11px] text-slate-400 block truncate" title={heroEvent.conflict_resolution_note}>
                  {isHigh
                    ? 'Deck dry above, causeway flooded below'
                    : 'Eyewitness disputed water level at bridge'}
                </span>
              </div>
            </div>

            {/* Missing Evidence / Resolution Callout */}
            {isHigh ? (
              <div className="p-3.5 bg-emerald-950/30 border border-emerald-900/60 rounded-xl text-xs text-emerald-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-300">EVIDENCE AUDIT VERIFIED & CONFLICT RESOLVED:</strong> GCC drone imagery and trained ground spotter clarified the discrepancy: the commuter was on the elevated Maraimalai Adigal high bridge deck where traffic moved freely; however, the Adyar River breached its embankments at 14.85m, completely inundating the low-level causeway, subways, and residential fringes below.
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-950/40 border border-amber-900/60 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300">1 CRITICAL MISSING EVIDENCE ITEM:</strong> Field spotter & GCC survey drone required to reconcile Maraimalai Adigal elevated bridge deck report with CWC 14.85m river stage gauge. Active contradiction suppresses confidence score to 48%.
                </div>
              </div>
            )}

            {/* Verification Sequence Animation Block (Active during simulated verification) */}
            {isVerifyingHero && (
              <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/80 shadow-lg space-y-3 animate-pulse">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 animate-spin text-blue-400" />
                    Executing Multi-Factor Automated Verification Pipeline
                  </span>
                  <span className="font-mono text-blue-400">
                    Step {verifyStepIndex + 1} of {VERIFICATION_STEPS.length}
                  </span>
                </div>

                <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-300"
                    style={{
                      width: `${((verifyStepIndex + 1) / VERIFICATION_STEPS.length) * 100}%`,
                    }}
                  />
                </div>

                <div className="text-xs font-semibold text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                  <span>{VERIFICATION_STEPS[verifyStepIndex]}</span>
                </div>
              </div>
            )}

            {/* Interactive Action Control Bar */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {!isHigh ? (
                  <button
                    id="hero-verify-event-btn"
                    onClick={handleVerifyHeroEvent}
                    disabled={isVerifyingHero}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isVerifyingHero ? 'VERIFYING...' : 'VERIFY EVENT'}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-2 bg-emerald-950 text-emerald-300 border border-emerald-700 rounded-xl font-bold text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>EVENT VERIFIED (91% HIGH)</span>
                    </span>
                    <button
                      onClick={handleResetDemoScenario}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset Demo Scenario</span>
                    </button>
                  </div>
                )}

                {!isHigh && (
                  <button
                    onClick={handleResolveConflict}
                    className="px-3.5 py-2 bg-amber-950/70 hover:bg-amber-900 text-amber-200 border border-amber-800 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Resolve Conflict via Spotter</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveAudit(heroEvent)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Inspect Full 9-Factor Audit</span>
                </button>
              </div>

              {onSwitchToModule4 && (
                <button
                  onClick={() => onSwitchToModule4(heroEvent.event_id)}
                  className="px-4 py-2 bg-rose-950 hover:bg-rose-900 text-rose-200 font-bold text-xs rounded-xl border border-rose-800 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Module 4: {isHigh ? 'ESCALATE' : 'VERIFY'} Action Panel</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 9-Factor Evidence Audit Traceability Matrix */}
            <div className="space-y-2 pt-2 border-t border-slate-850">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-400" />
                  9-Factor Evidence Audit Traceability Matrix
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Mathematical Contribution to {heroEvent.evidence_score}% Evidence Score
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                {heroFactorsList.map((factorItem) => {
                  const factor = factorItem.detail;
                  if (!factor) return null;
                  const isPenalty = factor.status === 'PENALTY';
                  const isOptimal = factor.status === 'OPTIMAL';

                  return (
                    <div
                      key={factor.factor_key}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-slate-200 truncate" title={factor.name}>
                          {factorItem.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                            isPenalty
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : isOptimal
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {factor.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-1" title={factor.summary}>
                        {factor.summary}
                      </p>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-900 font-mono">
                        <span className="text-slate-400">Metric: {factor.metric_value}</span>
                        <span
                          className={`font-bold ${
                            isPenalty
                              ? 'text-rose-400'
                              : isOptimal
                              ? 'text-emerald-400'
                              : 'text-blue-400'
                          }`}
                        >
                          {factor.weighted_contribution >= 0 ? '+' : ''}
                          {factor.weighted_contribution.toFixed(1)} pts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id={searchInputId}
              type="text"
              placeholder="Search by city, hazard, event ID, or recommendation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 text-xs focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Confidence Level Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Confidence:</span>
            <select
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-blue-500"
            >
              <option value="ALL">All Confidence Tiers</option>
              <option value="HIGH">HIGH (Evidence-Supported)</option>
              <option value="MEDIUM">MEDIUM (Provisional)</option>
              <option value="LOW">LOW (Disputed/Unverified)</option>
            </select>
          </div>

          {/* Hazard Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Hazard:</span>
            <select
              value={hazardFilter}
              onChange={(e) => setHazardFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-blue-500"
            >
              <option value="ALL">All Hazards</option>
              <option value="Flash Flood">Flash Flood</option>
              <option value="Hailstorm">Hailstorm</option>
              <option value="Tornado">Tornado</option>
              <option value="Severe Thunderstorm">Severe Thunderstorm</option>
              <option value="Winter Storm">Winter Storm</option>
            </select>
          </div>

          {/* Official Only Toggle */}
          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={officialOnlyFilter}
              onChange={(e) => setOfficialOnlyFilter(e.target.checked)}
              className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0"
            />
            <span>Official API/Data Only</span>
          </label>

          {/* Has Media Toggle */}
          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasMediaFilter}
              onChange={(e) => setHasMediaFilter(e.target.checked)}
              className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0"
            />
            <span>With Visual Evidence</span>
          </label>

          {(confidenceFilter !== 'ALL' || hazardFilter !== 'ALL' || officialOnlyFilter || hasMediaFilter || searchQuery) && (
            <button
              onClick={() => {
                setConfidenceFilter('ALL');
                setHazardFilter('ALL');
                setOfficialOnlyFilter(false);
                setHasMediaFilter(false);
                setSearchQuery('');
              }}
              className="text-blue-400 hover:underline text-[11px]"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Verified Events List */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400" />
          <p className="text-xs">Computing 9-factor evidence verification & decision support...</p>
        </div>
      ) : filteredVerifications.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
          <FileCheck className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-200">No matching verified events</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting filter parameters or re-verifying events across Modules 1 and 2.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredVerifications.map((v) => {
            const conf = getConfidenceLevelBadge(v.confidence_level);
            const hasConflicts = v.conflicting_sources.total_count > 0;
            const hasOfficial = v.supporting_sources.official_count > 0;
            const hasMedia = v.factors.image_video_evidence.score >= 80;

            return (
              <div
                key={v.event_id}
                id={`verified-card-${v.event_id}`}
                className={`p-5 rounded-2xl bg-slate-900 border transition-all duration-200 flex flex-col justify-between gap-4 hover:border-slate-700 hover:shadow-xl ${
                  hasConflicts ? 'border-rose-900/60' : 'border-slate-800'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-[11px] font-bold bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded">
                          {v.event_id}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {v.hazard}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          {v.verification_status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white tracking-tight">
                        {v.hazard} in {v.location.city}, {v.location.state}
                      </h3>
                    </div>

                    {/* Confidence Score Badge */}
                    <div className="text-right shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${conf.bg}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${conf.dot}`}></span>
                        <span>{v.evidence_score}% Evidence</span>
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">{conf.label}</p>
                    </div>
                  </div>

                  {/* Location & Time Window */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-850 mb-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Location & Footprint</span>
                      <div className="flex items-center gap-1 text-slate-200 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{v.location.city}, {v.location.state}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ~{v.location.radius_km} km radius ({v.location.centroid_lat.toFixed(3)}°N, {v.location.centroid_lng.toFixed(3)}°W)
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Time Window</span>
                      <div className="flex items-center gap-1 text-slate-200 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{v.time_window.duration_hours}h active period</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(v.time_window.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(v.time_window.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Distinct Sources Ledger: Official vs Citizen/Social */}
                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-850 mb-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Evidence Provenance:</span>
                        {hasOfficial ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                            <CloudLightning className="w-3 h-3" />
                            {v.supporting_sources.official_count} Official Agency Source(s)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            Crowdsourced only (0 official)
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                          <Radio className="w-3 h-3" />
                          {v.supporting_sources.citizen_social_count} Citizen/Social
                        </span>

                        {hasMedia && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">
                            <Camera className="w-3 h-3 text-blue-400" />
                            Visual Media
                          </span>
                        )}
                      </div>

                      {hasConflicts && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                          <AlertTriangle className="w-3 h-3" />
                          {v.conflicting_sources.total_count} Conflicting
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Explanation of Why It Received That Confidence */}
                  <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-850 mb-3 space-y-1 text-xs">
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                      Confidence Explanation:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {v.confidence_explanation}
                    </p>
                  </div>

                  {/* Recommended Next Action Snippet */}
                  <div className="p-3 bg-blue-950/30 rounded-xl border border-blue-900/40 mb-3 space-y-1 text-xs">
                    <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                      Recommended Next Action:
                    </span>
                    <p className="text-xs text-slate-200 font-medium line-clamp-2">
                      {v.recommended_next_action}
                    </p>
                  </div>

                  {/* Missing Evidence Tags */}
                  {v.evidence_missing.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-400 pt-1">
                      <span className="text-amber-400 font-medium">Missing:</span>
                      {v.evidence_missing.slice(0, 2).map((missing, i) => (
                        <span
                          key={i}
                          className="bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded truncate max-w-[240px]"
                          title={missing}
                        >
                          {missing}
                        </span>
                      ))}
                      {v.evidence_missing.length > 2 && (
                        <span className="text-slate-500">+{v.evidence_missing.length - 2} more</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-850 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                    <span>9-Factor Audit Ready</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onSwitchToModule4 && (
                      <button
                        onClick={() => onSwitchToModule4(v.event_id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 rounded-lg transition-colors shadow-xs"
                        title="Open in Module 4: Operational Decision Support & Action Panel"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                        <span>Action Panel</span>
                      </button>
                    )}

                    <button
                      onClick={() => setActiveAudit(v)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-xs"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Inspect Evidence Audit</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deep Evidence Audit Modal */}
      {activeAudit && (
        <EvidenceAuditModal
          verification={activeAudit}
          onClose={() => {
            setActiveAudit(null);
            if (onClearSelectedEventId) onClearSelectedEventId();
          }}
          onReanalyzeWithAI={handleReanalyzeWithAI}
          isAnalyzingAI={isAnalyzingAI}
        />
      )}
    </div>
  );
};
