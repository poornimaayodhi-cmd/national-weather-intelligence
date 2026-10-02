import React, { useState, useId } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Radio,
  Share2,
  CloudLightning,
  Database,
  Globe,
  Camera,
  Info,
  Layers,
  FileText,
  Sliders,
  Send,
  Plus,
  Compass,
  Building2,
  Activity,
  AlertOctagon,
  ChevronRight,
  Eye,
  Crosshair,
  UserCheck,
  Check,
} from 'lucide-react';
import {
  Module4EventActionDecision,
  EscalationLevel,
  SourceType,
} from '../types.ts';

interface EventActionPanelProps {
  decision: Module4EventActionDecision;
  onClose: () => void;
  onLogAction: (eventId: string, actionType: string, actor: string, notes: string) => Promise<void>;
  onNavigateToModule3?: (eventId: string) => void;
}

export const EventActionPanel: React.FC<EventActionPanelProps> = ({
  decision,
  onClose,
  onLogAction,
  onNavigateToModule3,
}) => {
  const [activeTab, setActiveTab] = useState<'PIPELINE' | 'ACTIONS' | 'EVIDENCE' | 'TRACEABILITY'>('PIPELINE');

  // New action logging form state
  const [actionType, setActionType] = useState<string>('Spotter Dispatch');
  const [actorName, setActorName] = useState<string>('Duty Operations Officer');
  const [actionNotes, setActionNotes] = useState<string>('');
  const [isSubmittingLog, setIsSubmittingLog] = useState<boolean>(false);
  const [logSuccessMsg, setLogSuccessMsg] = useState<string | null>(null);

  const actionNotesId = useId();
  const actorNameId = useId();

  const sourceIcons: Record<SourceType, React.ReactNode> = {
    SOCIAL_MEDIA: <Share2 className="w-3.5 h-3.5 text-blue-400" />,
    CITIZEN: <Radio className="w-3.5 h-3.5 text-emerald-400" />,
    WEATHER_API: <CloudLightning className="w-3.5 h-3.5 text-sky-400" />,
    PUBLIC_DATASET: <Database className="w-3.5 h-3.5 text-amber-400" />,
    WEBSITE: <Globe className="w-3.5 h-3.5 text-slate-300" />,
  };

  const getEscalationBadge = (level: EscalationLevel) => {
    switch (level) {
      case 'ESCALATE':
        return {
          bg: 'bg-rose-950/90 text-rose-200 border-rose-700',
          borderAccent: 'border-rose-600',
          dot: 'bg-rose-400 animate-ping',
          label: 'ESCALATE',
          sub: 'Pre-Activate Tactical Command (Internal High Alert)',
        };
      case 'PREPARE':
        return {
          bg: 'bg-amber-950/90 text-amber-200 border-amber-700',
          borderAccent: 'border-amber-600',
          dot: 'bg-amber-400',
          label: 'PREPARE',
          sub: 'Operational Standby & Barricade Pre-Positioning',
        };
      case 'VERIFY':
        return {
          bg: 'bg-blue-950/90 text-blue-200 border-blue-700',
          borderAccent: 'border-blue-600',
          dot: 'bg-blue-400',
          label: 'VERIFY',
          sub: 'Targeted Ground & Sensor Verification Required',
        };
      case 'MONITOR':
      default:
        return {
          bg: 'bg-slate-900 text-slate-300 border-slate-700',
          borderAccent: 'border-slate-600',
          dot: 'bg-slate-400',
          label: 'MONITOR',
          sub: 'Routine Automated Surveillance & Report Logging',
        };
    }
  };

  const getConfidenceLevelBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return {
          bg: 'bg-emerald-950/80 border-emerald-800 text-emerald-300',
          dot: 'bg-emerald-400',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-950/80 border-amber-800 text-amber-300',
          dot: 'bg-amber-400',
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-rose-950/80 border-rose-800 text-rose-300',
          dot: 'bg-rose-400',
        };
    }
  };

  const escBadge = getEscalationBadge(decision.escalation_level);
  const confBadge = getConfidenceLevelBadge(decision.current_evidence_confidence.level);

  const handleQuickLog = async (type: string, notes: string) => {
    try {
      setIsSubmittingLog(true);
      await onLogAction(decision.event_id, type, actorName, notes);
      setLogSuccessMsg(`Action logged: "${type}"`);
      setTimeout(() => setLogSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to log action');
    } finally {
      setIsSubmittingLog(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionNotes.trim()) return;
    try {
      setIsSubmittingLog(true);
      await onLogAction(decision.event_id, actionType, actorName, actionNotes.trim());
      setActionNotes('');
      setLogSuccessMsg(`Action logged: "${actionType}"`);
      setTimeout(() => setLogSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to log action');
    } finally {
      setIsSubmittingLog(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="action-panel-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    >
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono text-xs font-bold bg-slate-950 text-slate-300 px-2.5 py-0.5 rounded border border-slate-800">
                {decision.event_id}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                {decision.hazard}
              </span>

              {/* Escalation Level Pill */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-extrabold border ${escBadge.bg}`}
              >
                <span className={`w-2 h-2 rounded-full ${escBadge.dot}`}></span>
                <span>ESCALATION LEVEL: {escBadge.label}</span>
              </span>

              {/* Confidence Pill */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${confBadge.bg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${confBadge.dot}`}></span>
                <span>{decision.current_evidence_confidence.level} ({decision.current_evidence_confidence.score}%)</span>
              </span>
            </div>

            <h2 id="action-panel-title" className="text-xl font-bold text-white tracking-tight">
              Event Action Panel: Operational Decision Support
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {decision.location.city}, {decision.location.state} • Footprint: ~{decision.location.radius_km} km radius • Time Window: {decision.time_window.duration_hours}h active period
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToModule3 && (
              <button
                onClick={() => onNavigateToModule3(decision.event_id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-950/60 hover:bg-blue-900 text-blue-200 border border-blue-800/60 rounded-lg transition-colors shadow-xs"
                title="Inspect 9-factor verification audit in Module 3"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                <span>Module 3 Audit</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Mandatory Operational & Legal Notice */}
        <div className="bg-amber-950/40 border-b border-amber-900/60 px-5 py-2.5 flex items-center justify-between text-xs text-amber-200 gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-medium">
              <strong>OPERATIONAL BOUNDARY:</strong> {decision.operational_disclaimer}
            </span>
          </div>
        </div>

        {/* Action Panel Tab Navigation */}
        <div className="flex items-center px-5 border-b border-slate-800 bg-slate-950 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('PIPELINE')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'PIPELINE'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Action Pipeline (Evidence → Action)</span>
          </button>

          <button
            onClick={() => setActiveTab('ACTIONS')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'ACTIONS'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Recommended Actions & Task Log ({decision.simulated_actions_log.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('EVIDENCE')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'EVIDENCE'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Evidence & Conflict Ledger ({decision.supporting_evidence.total_count})</span>
          </button>

          <button
            onClick={() => setActiveTab('TRACEABILITY')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'TRACEABILITY'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Traceability Audit Trail</span>
          </button>
        </div>

        {/* Panel Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900">
          {/* TAB 1: THE 4-STAGE ACTION PIPELINE: Evidence → Confidence → Missing Evidence → Recommended Action */}
          {activeTab === 'PIPELINE' && (
            <div className="space-y-6">
              {/* Escalation Banner Summary */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      DECISION SUPPORT POSTURE:
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-black border ${escBadge.bg}`}>
                      {escBadge.label}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Status: <strong className="text-slate-200">{decision.verification_status}</strong>
                  </span>
                </div>

                <p className="text-sm font-medium text-slate-200 leading-relaxed">
                  {decision.escalation_rationale}
                </p>

                {decision.escalation_triggers.length > 0 && (
                  <div className="pt-2 border-t border-slate-900 flex items-center gap-1.5 flex-wrap text-xs">
                    <span className="text-slate-400 font-semibold">Triggers:</span>
                    {decision.escalation_triggers.map((trig, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-900 text-slate-300 border border-slate-800 px-2 py-0.5 rounded text-[11px]"
                      >
                        {trig}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Sequential 4-Stage Action Pipeline Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Traceable 4-Stage Decision Flow:
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Evidence → Confidence → Missing Evidence → Recommended Action
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
                  {/* STAGE 1: EVIDENCE */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3 relative">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                          STAGE 1
                        </span>
                        <Layers className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <h4 className="text-xs font-bold text-white mb-1">Supporting Evidence</h4>
                      <p className="text-[11px] text-slate-300 font-medium mb-2">
                        {decision.pipeline_trail.evidence_stage.headline}
                      </p>
                      <ul className="space-y-1 text-[11px] text-slate-400">
                        {decision.pipeline_trail.evidence_stage.key_facts.map((fact, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-blue-400">•</span>
                            <span>{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-500 italic">
                      {decision.pipeline_trail.evidence_stage.official_vs_citizen_summary}
                    </div>
                  </div>

                  {/* STAGE 2: CONFIDENCE */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3 relative">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/60">
                          STAGE 2
                        </span>
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <h4 className="text-xs font-bold text-white mb-1">Confidence Score</h4>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-2xl font-extrabold font-mono text-white">
                          {decision.current_evidence_confidence.score}%
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${confBadge.bg}`}>
                          {decision.current_evidence_confidence.level}
                        </span>
                      </div>
                      <ul className="space-y-1 text-[11px] text-slate-400">
                        {decision.pipeline_trail.confidence_stage.key_drivers.map((drv, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-blue-400">•</span>
                            <span>{drv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-400 font-mono">
                      Status: {decision.verification_status}
                    </div>
                  </div>

                  {/* STAGE 3: MISSING EVIDENCE */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3 relative">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          STAGE 3
                        </span>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <h4 className="text-xs font-bold text-white mb-1">Evidence Gaps</h4>
                      <p className="text-[11px] text-amber-300 font-semibold mb-2">
                        {decision.pipeline_trail.missing_evidence_stage.headline}
                      </p>
                      <ul className="space-y-1 text-[11px] text-slate-300">
                        {decision.missing_evidence.map((gap, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>
                              <strong className="text-amber-200">[{gap.priority}]</strong> {gap.item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-500">
                      Sensor & spotter acquisition targets defined
                    </div>
                  </div>

                  {/* STAGE 4: RECOMMENDED ACTION */}
                  <div
                    className={`p-4 rounded-xl bg-slate-950 border flex flex-col justify-between gap-3 relative ${escBadge.borderAccent}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${escBadge.bg}`}>
                          STAGE 4
                        </span>
                        <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <h4 className="text-xs font-bold text-white mb-1">Operational Action</h4>
                      <p className="text-xs font-bold text-white mb-1 leading-snug">
                        {decision.recommended_operational_action.action_title}
                      </p>
                      <p className="text-[11px] text-slate-300 line-clamp-3 mb-2">
                        {decision.recommended_operational_action.description}
                      </p>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-blue-300 font-medium">
                        Next Verification: {decision.recommended_next_verification_step.step_title}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-400 font-mono">
                      Phase: {decision.recommended_operational_action.readiness_phase}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dual Action Spotlight */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Spotlight 1: Recommended Next Verification Step */}
                <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Crosshair className="w-3.5 h-3.5 text-blue-400" />
                      RECOMMENDED NEXT VERIFICATION STEP
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                      {decision.recommended_next_verification_step.urgency} URGENCY
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white">
                    {decision.recommended_next_verification_step.step_title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {decision.recommended_next_verification_step.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-900/40 text-[11px] text-slate-400">
                    <div>
                      <span className="text-slate-500 block">Owner / Lead:</span>
                      <span className="text-slate-200 font-medium">
                        {decision.recommended_next_verification_step.action_owner}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Expected Outcome:</span>
                      <span className="text-slate-200 font-medium">
                        {decision.recommended_next_verification_step.expected_outcome}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Spotlight 2: Recommended Operational Action */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-400" />
                      RECOMMENDED OPERATIONAL ACTION
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                      {decision.recommended_operational_action.readiness_phase}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white">
                    {decision.recommended_operational_action.action_title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {decision.recommended_operational_action.description}
                  </p>

                  <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-slate-500">Stakeholders:</span>
                      {decision.recommended_operational_action.stakeholders.map((s, idx) => (
                        <span key={idx} className="bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded text-[10px] border border-slate-800">
                          {s}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-rose-400/90 font-medium">
                      Safety Warning: {decision.recommended_operational_action.safety_note}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIONS & TASK LOGGING */}
          {activeTab === 'ACTIONS' && (
            <div className="space-y-6">
              {/* Quick Action Dispatch Controls */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Quick Operational Task Execution:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  <button
                    onClick={() =>
                      handleQuickLog(
                        'Spotter Net Alert',
                        `Dispatched SkyWarn amateur radio spotters to check road passability in ${decision.location.city}.`
                      )
                    }
                    disabled={isSubmittingLog}
                    className="p-3 text-left rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 transition-colors text-xs space-y-1"
                  >
                    <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                      <Radio className="w-3.5 h-3.5" />
                      <span>Dispatch Spotter Check</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Task SkyWarn net to verify ground-truth at centroid.
                    </p>
                  </button>

                  <button
                    onClick={() =>
                      handleQuickLog(
                        'Radar Query',
                        `Queried NWS Level-II Dual-Pol Radar velocity and correlation coefficient for ${decision.location.city}.`
                      )
                    }
                    disabled={isSubmittingLog}
                    className="p-3 text-left rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 transition-colors text-xs space-y-1"
                  >
                    <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                      <CloudLightning className="w-3.5 h-3.5" />
                      <span>Query Doppler Radar</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Check dual-pol radar products for rotation/precip.
                    </p>
                  </button>

                  <button
                    onClick={() =>
                      handleQuickLog(
                        'Public Works Staging',
                        `Notified Public Works & Drainage Ops to pre-position barrier trucks at low-water crossings in ${decision.location.city}.`
                      )
                    }
                    disabled={isSubmittingLog}
                    className="p-3 text-left rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 transition-colors text-xs space-y-1"
                  >
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Stage Public Works</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Stage barricade trucks and check pump stations.
                    </p>
                  </button>

                  <button
                    onClick={() =>
                      handleQuickLog(
                        'Traffic Cam Poll',
                        `Inspected regional DOT highway traffic cams for ${decision.location.city}; verified road visibility.`
                      )
                    }
                    disabled={isSubmittingLog}
                    className="p-3 text-left rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 transition-colors text-xs space-y-1"
                  >
                    <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                      <Camera className="w-3.5 h-3.5" />
                      <span>DOT Traffic Cams</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Inspect municipal CCTV streams along transit routes.
                    </p>
                  </button>
                </div>
              </div>

              {/* Log Entry Form */}
              <form
                onSubmit={handleFormSubmit}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
              >
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Log Custom Operational or Verification Note:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-medium">
                      Action Type:
                    </label>
                    <select
                      value={actionType}
                      onChange={(e) => setActionType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-hidden focus:border-blue-500"
                    >
                      <option value="Spotter Dispatch">Spotter Dispatch (SkyWarn/ARES)</option>
                      <option value="Agency Consultation">Agency Consultation (NWS/USGS)</option>
                      <option value="Camera Surveillance">Camera Surveillance (DOT CCTV)</option>
                      <option value="Public Works Standby">Public Works Readiness Standby</option>
                      <option value="Dispute Re-Survey">Dispute Re-Survey (Ground Check)</option>
                      <option value="Operational Escalate">Operational Escalate (Internal Staging)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor={actorNameId} className="block text-[11px] text-slate-400 mb-1 font-medium">
                      Officer / Operator Name:
                    </label>
                    <input
                      id={actorNameId}
                      type="text"
                      value={actorName}
                      onChange={(e) => setActorName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-hidden focus:border-blue-500"
                      placeholder="Officer name or callsign"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={actionNotesId} className="block text-[11px] text-slate-400 mb-1 font-medium">
                    Operational Findings / Notes:
                  </label>
                  <textarea
                    id={actionNotesId}
                    rows={2}
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Enter observations, cross-check results, or dispatch instructions..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  {logSuccessMsg ? (
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {logSuccessMsg}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">
                      Action notes are recorded with immutable timestamps in the event history.
                    </span>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingLog || !actionNotes.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Log Action Entry</span>
                  </button>
                </div>
              </form>

              {/* Task Log History */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Event Action & Verification Log History ({decision.simulated_actions_log.length}):
                </h4>

                {decision.simulated_actions_log.length === 0 ? (
                  <div className="p-6 text-center bg-slate-950 rounded-xl border border-slate-850 text-xs text-slate-400">
                    No operational actions logged yet. Use the quick buttons or form above to record ground verifications.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {decision.simulated_actions_log.map((log) => (
                      <div
                        key={log.id}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-blue-300">{log.action_type}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-300 font-medium">{log.actor}</span>
                          </div>
                          <span className="font-mono text-[11px] text-slate-500">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-300">{log.notes}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SUPPORTING & CONFLICTING EVIDENCE LEDGER */}
          {activeTab === 'EVIDENCE' && (
            <div className="space-y-6">
              {/* Supporting Evidence Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    SUPPORTING EVIDENCE ITEMS ({decision.supporting_evidence.total_count})
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {decision.supporting_evidence.official_count} Official • {decision.supporting_evidence.citizen_count} Citizen/Social
                  </span>
                </div>

                <div className="space-y-2.5">
                  {decision.supporting_evidence.items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl bg-slate-950 border space-y-2 ${
                        item.is_official ? 'border-sky-900/60' : 'border-slate-850'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded bg-slate-900 border border-slate-800">
                            {sourceIcons[item.source_type]}
                          </span>
                          <span className="font-bold text-white">{item.source_platform}</span>
                          <span className="font-mono text-[11px] text-slate-400">[{item.id}]</span>
                          {item.is_official && (
                            <span className="bg-sky-950 text-sky-300 border border-sky-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              Official Agency
                            </span>
                          )}
                        </div>

                        <span className="text-emerald-400 font-mono text-xs font-semibold">
                          {item.reliability}% Reliability
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed font-mono">
                        {item.summary}
                      </p>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-900 text-slate-400">
                        <span>Reported by: {item.author_name || 'Anonymous Spotter'}</span>
                        <span className="text-blue-400 font-mono">{item.weight_impact}</span>
                      </div>

                      {item.has_media && item.media_url && (
                        <div className="pt-1">
                          <img
                            src={item.media_url}
                            alt="Ground observation"
                            className="w-full max-w-sm h-32 object-cover rounded-lg border border-slate-800"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Conflicting Evidence */}
              {decision.conflicting_evidence.total_count > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    CONFLICTING GROUND EVIDENCE ({decision.conflicting_evidence.total_count})
                  </h3>

                  <div className="space-y-2.5">
                    {decision.conflicting_evidence.items.map((conf) => (
                      <div
                        key={conf.report_id}
                        className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/70 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-rose-300">{conf.source_platform}</span>
                          <span className="font-mono text-[11px] text-rose-400">[{conf.report_id}]</span>
                        </div>
                        <p className="text-rose-200">{conf.content}</p>
                        <div className="text-[11px] text-rose-400 font-medium pt-1 border-t border-rose-950">
                          Dispute Basis: {conf.conflict_reason} • Impact: {conf.impact}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TRACEABILITY AUDIT TRAIL */}
          {activeTab === 'TRACEABILITY' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Full End-to-End Traceability Chain:
                </h4>
                <p className="text-xs text-slate-300">
                  Every recommendation and escalation tier is mathematically derived and directly traceable to ground reports, multi-channel consensus, sensor agreements, and dispute statuses.
                </p>
              </div>

              <div className="space-y-3">
                {decision.traceability_trail.map((stage, idx) => (
                  <div
                    key={stage.stage}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-blue-400 border border-slate-800">
                          Stage {idx + 1}: {stage.stage}
                        </span>
                        <h5 className="text-xs font-bold text-white tracking-tight">{stage.title}</h5>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{stage.details}</p>

                    <div className="pt-2 border-t border-slate-900 text-[11px] font-mono text-slate-400 space-y-1">
                      <span className="text-slate-500 block">Supporting Evidence Citations:</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {stage.evidence_links.map((link, lIdx) => (
                          <span
                            key={lIdx}
                            className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800"
                          >
                            {link}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Panel Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono">
            Generated: {new Date(decision.generated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Module 4 Decision Support Engine
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
          >
            Close Action Panel
          </button>
        </div>
      </div>
    </div>
  );
};
