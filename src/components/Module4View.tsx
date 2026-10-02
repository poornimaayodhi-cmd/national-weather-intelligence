import React, { useState, useEffect, useId } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Layers,
  Radio,
  FileText,
  Building2,
  Crosshair,
  Compass,
  AlertOctagon,
  Eye,
  Check,
} from 'lucide-react';
import {
  Module4EventActionDecision,
  Module4Stats,
  EscalationLevel,
  VerificationConfidenceLevel,
} from '../types.ts';
import { EventActionPanel } from './EventActionPanel.tsx';

interface Module4ViewProps {
  onSwitchToModule1: () => void;
  onSwitchToModule2: () => void;
  onSwitchToModule3: (eventId?: string) => void;
  selectedEventId?: string | null;
  onClearSelectedEventId?: () => void;
}

export const Module4View: React.FC<Module4ViewProps> = ({
  onSwitchToModule1,
  onSwitchToModule2,
  onSwitchToModule3,
  selectedEventId,
  onClearSelectedEventId,
}) => {
  const [decisions, setDecisions] = useState<Module4EventActionDecision[]>([]);
  const [stats, setStats] = useState<Module4Stats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [escalationFilter, setEscalationFilter] = useState<EscalationLevel | 'ALL'>('ALL');
  const [confidenceFilter, setConfidenceFilter] = useState<VerificationConfidenceLevel | 'ALL'>('ALL');
  const [hazardFilter, setHazardFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected decision for detailed Action Panel
  const [activePanelDecision, setActivePanelDecision] = useState<Module4EventActionDecision | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const searchInputId = useId();

  const fetchDecisions = async () => {
    try {
      const res = await fetch('/api/decision-support/decisions');
      const data = await res.json();
      if (data.success) {
        setDecisions(data.decisions);

        // If a target event was passed in props, pre-select it
        if (selectedEventId) {
          const match = data.decisions.find((d: Module4EventActionDecision) => d.event_id === selectedEventId);
          if (match) {
            setActivePanelDecision(match);
          }
        }
      } else {
        setError(data.error || 'Failed to load decisions');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching decisions');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/decision-support/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err: any) {
      console.error('Failed to load stats:', err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      await Promise.all([fetchDecisions(), fetchStats()]);
      setIsLoading(false);
    };
    loadAll();
  }, []);

  useEffect(() => {
    if (selectedEventId && decisions.length > 0) {
      const match = decisions.find((d) => d.event_id === selectedEventId);
      if (match) {
        setActivePanelDecision(match);
      }
    }
  }, [selectedEventId, decisions]);

  const handleSyncPipeline = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/decision-support/refresh', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setDecisions(data.decisions);
        await fetchStats();
        setToastMsg('Synchronized decision pipeline with live evidence verifications');
        setTimeout(() => setToastMsg(null), 3500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sync pipeline');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogAction = async (
    eventId: string,
    actionType: string,
    actor: string,
    notes: string
  ) => {
    const res = await fetch('/api/decision-support/action-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: eventId, action_type: actionType, actor, notes }),
    });
    const data = await res.json();
    if (data.success && data.decision) {
      setDecisions((prev) =>
        prev.map((d) => (d.event_id === eventId ? data.decision : d))
      );
      if (activePanelDecision?.event_id === eventId) {
        setActivePanelDecision(data.decision);
      }
      fetchStats();
    } else {
      throw new Error(data.error || 'Failed to log action');
    }
  };

  // Filter logic
  const filteredDecisions = decisions.filter((d) => {
    if (escalationFilter !== 'ALL' && d.escalation_level !== escalationFilter) return false;
    if (confidenceFilter !== 'ALL' && d.current_evidence_confidence.level !== confidenceFilter) return false;
    if (hazardFilter !== 'ALL' && d.hazard.toLowerCase() !== hazardFilter.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchText =
        d.event_id.toLowerCase().includes(q) ||
        d.hazard.toLowerCase().includes(q) ||
        d.location.city.toLowerCase().includes(q) ||
        d.location.state.toLowerCase().includes(q) ||
        d.recommended_operational_action.action_title.toLowerCase().includes(q) ||
        d.recommended_next_verification_step.step_title.toLowerCase().includes(q);
      if (!matchText) return false;
    }
    return true;
  });

  const getEscalationStyle = (level: EscalationLevel) => {
    switch (level) {
      case 'ESCALATE':
        return {
          badgeBg: 'bg-rose-950/90 text-rose-200 border-rose-700',
          borderAccent: 'border-rose-700/80 hover:border-rose-500',
          dot: 'bg-rose-400 animate-ping',
          label: 'ESCALATE',
          sub: 'Internal High Alert',
        };
      case 'PREPARE':
        return {
          badgeBg: 'bg-amber-950/90 text-amber-200 border-amber-700',
          borderAccent: 'border-amber-700/80 hover:border-amber-500',
          dot: 'bg-amber-400',
          label: 'PREPARE',
          sub: 'Standby Staging',
        };
      case 'VERIFY':
        return {
          badgeBg: 'bg-blue-950/90 text-blue-200 border-blue-700',
          borderAccent: 'border-blue-700/80 hover:border-blue-500',
          dot: 'bg-blue-400',
          label: 'VERIFY',
          sub: 'Field Spotters Needed',
        };
      case 'MONITOR':
      default:
        return {
          badgeBg: 'bg-slate-900 text-slate-300 border-slate-700',
          borderAccent: 'border-slate-800 hover:border-slate-700',
          dot: 'bg-slate-400',
          label: 'MONITOR',
          sub: 'Surveillance Mode',
        };
    }
  };

  const getConfidenceStyle = (level: VerificationConfidenceLevel) => {
    switch (level) {
      case 'HIGH':
        return 'bg-emerald-950/80 border-emerald-800 text-emerald-300';
      case 'MEDIUM':
        return 'bg-amber-950/80 border-amber-800 text-amber-300';
      case 'LOW':
      default:
        return 'bg-rose-950/80 border-rose-800 text-rose-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-800 text-emerald-200 rounded-xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-emerald-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Module 4 Scope Banner with Mandatory Legal Boundary */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[11px] font-bold bg-rose-950 text-rose-300 rounded border border-rose-800 uppercase tracking-wider">
                Module 4 Active
              </span>
              <h1 className="text-base font-bold text-white tracking-tight">
                Operational Decision Support & Event Action Panel
              </h1>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Synthesizes verified weather clusters into explainable tactical actions. Evaluates confidence, detects missing evidence gaps, generates next verification steps, and assigns operational escalation levels (<strong className="text-slate-200">Monitor</strong>, <strong className="text-slate-200">Verify</strong>, <strong className="text-slate-200">Prepare</strong>, <strong className="text-slate-200">Escalate</strong>).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncPipeline}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Sync Decision Pipeline</span>
            </button>
          </div>
        </div>

        {/* Mandatory Legal & Operational Boundary Warning */}
        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/60 flex items-start gap-2.5 text-xs text-amber-200/90">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong>OPERATIONAL BOUNDARY:</strong> AI-assisted decision support only. Official warnings and emergency declarations remain under the exclusive authority of authorized government agencies (IMD, CWC, TNSDMA, NDMA, SDMA, and District Collectorates). This system provides evidentiary coordination recommendations for disaster response desks.
          </p>
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* ESCALATE */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-rose-900/40 space-y-1">
          <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
            Escalate
          </span>
          <div className="text-2xl font-black text-rose-200 font-mono">
            {stats?.by_escalation.ESCALATE ?? 0}
          </div>
          <span className="text-[10px] text-slate-400 block">High Alert Posture</span>
        </div>

        {/* PREPARE */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-900/40 space-y-1">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Prepare
          </span>
          <div className="text-2xl font-black text-amber-200 font-mono">
            {stats?.by_escalation.PREPARE ?? 0}
          </div>
          <span className="text-[10px] text-slate-400 block">Stage Crews & Gear</span>
        </div>

        {/* VERIFY */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-blue-900/40 space-y-1">
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            Verify
          </span>
          <div className="text-2xl font-black text-blue-200 font-mono">
            {stats?.by_escalation.VERIFY ?? 0}
          </div>
          <span className="text-[10px] text-slate-400 block">Field Re-Survey</span>
        </div>

        {/* MONITOR */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Monitor
          </span>
          <div className="text-2xl font-black text-slate-200 font-mono">
            {stats?.by_escalation.MONITOR ?? 0}
          </div>
          <span className="text-[10px] text-slate-400 block">Passive Watch</span>
        </div>

        {/* OFFICIAL BACKED */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-sky-900/40 space-y-1">
          <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Official Backed
          </span>
          <div className="text-2xl font-black text-sky-200 font-mono">
            {stats?.official_backed_decisions ?? 0}
          </div>
          <span className="text-[10px] text-slate-400 block">NWS / USGS Linked</span>
        </div>

        {/* CONFLICTS ACTIVE */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Ground Disputes
          </span>
          <div className="text-2xl font-black text-white font-mono">
            {stats?.events_with_conflicts ?? 0}
          </div>
          <span className="text-[10px] text-slate-400 block">Requiring Spotters</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Escalation Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Escalation:</span>
            <select
              value={escalationFilter}
              onChange={(e) => setEscalationFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-hidden focus:border-blue-500"
            >
              <option value="ALL">All Levels</option>
              <option value="ESCALATE">ESCALATE Only</option>
              <option value="PREPARE">PREPARE Only</option>
              <option value="VERIFY">VERIFY Only</option>
              <option value="MONITOR">MONITOR Only</option>
            </select>
          </div>

          {/* Confidence Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Confidence:</span>
            <select
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-hidden focus:border-blue-500"
            >
              <option value="ALL">All Confidences</option>
              <option value="HIGH">HIGH (≥75%)</option>
              <option value="MEDIUM">MEDIUM (50-74%)</option>
              <option value="LOW">LOW (&lt;50%)</option>
            </select>
          </div>

          {/* Hazard Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Hazard:</span>
            <select
              value={hazardFilter}
              onChange={(e) => setHazardFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-hidden focus:border-blue-500"
            >
              <option value="ALL">All Hazards</option>
              <option value="Flash Flood">Flash Flood</option>
              <option value="Hailstorm">Hailstorm</option>
              <option value="Severe Thunderstorm">Severe Thunderstorm</option>
              <option value="Tornado">Tornado</option>
              <option value="Winter Storm">Winter Storm</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <label htmlFor={searchInputId} className="sr-only">
            Search decision support
          </label>
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            id={searchInputId}
            type="text"
            placeholder="Search events, actions, cities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Decision Cards List */}
      {isLoading ? (
        <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-3"></div>
          <p className="text-xs text-slate-400">Loading Module 4 Operational Decision Support...</p>
        </div>
      ) : filteredDecisions.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-xs">
          No correlated events match the selected decision support filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDecisions.map((dec) => {
            const escStyle = getEscalationStyle(dec.escalation_level);
            const confStyle = getConfidenceStyle(dec.current_evidence_confidence.level);

            return (
              <div
                key={dec.event_id}
                className={`p-5 rounded-2xl bg-slate-900 border transition-all shadow-md space-y-4 ${escStyle.borderAccent}`}
              >
                {/* Top Row: Event ID, Hazard, Location, Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-850">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-300 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                      {dec.event_id}
                    </span>
                    <span className="text-sm font-bold text-white">{dec.hazard}</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {dec.location.city}, {dec.location.state} (~{dec.location.radius_km} km)
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-600" />
                      {dec.time_window.duration_hours}h span
                    </span>
                  </div>

                  {/* Level & Confidence Badges */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${escStyle.badgeBg}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${escStyle.dot}`}></span>
                      <span>ESCALATION: {escStyle.label}</span>
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${confStyle}`}
                    >
                      <span>{dec.current_evidence_confidence.level} ({dec.current_evidence_confidence.score}%)</span>
                    </span>
                  </div>
                </div>

                {/* THE 4-STAGE ACTION FLOW STRIP: Evidence → Confidence → Missing Evidence → Recommended Action */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-1 text-xs">
                  {/* Step 1: Evidence */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider block mb-1">
                        1. Evidence
                      </span>
                      <div className="font-bold text-white mb-0.5">
                        {dec.supporting_evidence.total_count} Supporting Sources
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {dec.supporting_evidence.official_count} official agency, {dec.supporting_evidence.citizen_count} citizen/social.
                      </p>
                    </div>
                    {dec.conflicting_evidence.total_count > 0 && (
                      <div className="mt-2 text-[10px] text-rose-400 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{dec.conflicting_evidence.total_count} ground dispute</span>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Confidence */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider block mb-1">
                        2. Confidence
                      </span>
                      <div className="font-bold text-white mb-0.5">
                        {dec.current_evidence_confidence.score}% ({dec.current_evidence_confidence.level})
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        Status: <strong className="text-slate-200">{dec.verification_status}</strong>
                      </p>
                    </div>
                    <div className="mt-2 text-[10px] text-slate-500 font-mono">
                      Calculated from 9-factor model
                    </div>
                  </div>

                  {/* Step 3: Missing Evidence */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block mb-1">
                        3. Missing Evidence
                      </span>
                      <div className="font-bold text-white mb-0.5">
                        {dec.missing_evidence.length} Gap(s) Identified
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {dec.missing_evidence[0]?.item || 'None; all channels verified'}
                      </p>
                    </div>
                    <div className="mt-2 text-[10px] text-amber-300/80 font-medium">
                      {dec.missing_evidence[0]?.priority} priority acquisition
                    </div>
                  </div>

                  {/* Step 4: Recommended Action */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                        4. Recommended Action
                      </span>
                      <div className="font-bold text-white mb-0.5 line-clamp-1">
                        {dec.recommended_operational_action.action_title}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        Next: {dec.recommended_next_verification_step.step_title}
                      </p>
                    </div>
                    <div className="mt-2 text-[10px] text-blue-400 font-semibold">
                      Phase: {dec.recommended_operational_action.readiness_phase.split(':')[0]}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions Row */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>Task Log: <strong>{dec.simulated_actions_log.length}</strong> entries</span>
                    <span>•</span>
                    <span>Dispute Status: {dec.conflicting_evidence.total_count > 0 ? 'Disputed' : 'Uncontested'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSwitchToModule3(dec.event_id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold bg-blue-950/60 hover:bg-blue-900 text-blue-200 border border-blue-800/60 rounded-xl transition-colors shadow-xs"
                      title="Inspect 9-factor verification audit in Module 3"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                      <span>Module 3 Verification</span>
                    </button>

                    <button
                      onClick={() => setActivePanelDecision(dec)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors shadow-xs"
                    >
                      <span>Open Event Action Panel</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dedicated Event Action Panel Modal */}
      {activePanelDecision && (
        <EventActionPanel
          decision={activePanelDecision}
          onClose={() => {
            setActivePanelDecision(null);
            if (onClearSelectedEventId) onClearSelectedEventId();
          }}
          onLogAction={handleLogAction}
          onNavigateToModule3={(eventId) => {
            setActivePanelDecision(null);
            onSwitchToModule3(eventId);
          }}
        />
      )}
    </div>
  );
};
