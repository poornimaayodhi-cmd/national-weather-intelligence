import React from 'react';
import {
  X,
  Clock,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Layers,
  Radio,
  Share2,
  Users,
} from 'lucide-react';
import { MapWeatherEvent } from './osData.ts';

interface EventIntelligenceDossierPanelProps {
  event: MapWeatherEvent | null;
  onClose: () => void;
  onOpenDecisionPlan?: (eventId: string) => void;
}

export const EventIntelligenceDossierPanel: React.FC<EventIntelligenceDossierPanelProps> = ({
  event,
  onClose,
  onOpenDecisionPlan,
}) => {
  if (!event) return null;

  return (
    <div className="rounded-2xl bg-slate-950/95 border border-cyan-500/35 backdrop-blur-md shadow-2xl p-4 space-y-4 text-slate-100 select-none">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            EVENT INTELLIGENCE
          </span>
          <h3 className="text-sm font-bold text-white uppercase mt-1 leading-snug">
            {event.type}
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-cyan-300 font-mono mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{event.city.toUpperCase()}, {event.state.toUpperCase()}</span>
            <span>•</span>
            <span className="text-slate-400">{event.timeIST}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[9.5px] font-mono text-slate-400 uppercase">Confidence</div>
          <div className="text-xl font-black font-mono text-emerald-400 mt-0.5">{event.confidence}%</div>
          <div className="text-[9px] text-slate-500 font-mono">Evidence-Based Index</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[9.5px] font-mono text-slate-400 uppercase">Sources Count</div>
          <div className="text-xl font-black font-mono text-cyan-300 mt-0.5">{event.sourcesCount}</div>
          <div className="text-[9px] text-slate-500 font-mono">Independent Ingests</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[9.5px] font-mono text-slate-400 uppercase">Correlated Reports</div>
          <div className="text-xl font-black font-mono text-purple-300 mt-0.5">{event.correlatedReports}</div>
          <div className="text-[9px] text-slate-500 font-mono">Clustered CDM Records</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[9.5px] font-mono text-slate-400 uppercase">Status</div>
          <div className="text-xs font-bold font-mono text-emerald-300 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {event.status}
          </div>
          <div className="text-[9px] text-slate-500 font-mono">Cross-Checked</div>
        </div>
      </div>

      {/* Summary Narrative */}
      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
        {event.summary}
      </div>

      {/* Interactive Evidence Visualization (Requirement 4) */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/25 space-y-2">
        <div className="text-[10px] font-mono uppercase font-bold tracking-widest text-cyan-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>EVIDENCE VERIFICATION PIPELINE</span>
        </div>

        <div className="space-y-1.5 text-xs font-mono">
          {/* Level 1: Raw Sources */}
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-cyan-300 font-bold text-[10px]">
              IMD • SOCIAL • CITIZEN • API
            </span>
            <span className="text-[9px] text-slate-400">{event.sourcesCount} Feeds</span>
          </div>

          <div className="flex justify-center text-cyan-400 text-[10px] leading-none">
            ↓
          </div>

          {/* Level 2: Correlation */}
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-purple-300 font-bold text-[10px]">
              CORRELATION
            </span>
            <span className="text-[9px] text-slate-400">≤15km • Δt ≤60m</span>
          </div>

          <div className="flex justify-center text-purple-400 text-[10px] leading-none">
            ↓
          </div>

          {/* Level 3: Verification */}
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-emerald-300 font-bold text-[10px]">
              VERIFICATION
            </span>
            <span className="text-[9px] text-slate-400">92% Concordance</span>
          </div>

          <div className="flex justify-center text-emerald-400 text-[10px] leading-none">
            ↓
          </div>

          {/* Level 4: Confidence Score */}
          <div className="p-2 rounded-lg bg-slate-950 border border-emerald-500/40 flex items-center justify-between">
            <span className="text-amber-300 font-bold text-[10.5px]">
              {event.confidence}% CONFIDENCE
            </span>
            <span className="text-[9px] text-emerald-400 font-bold">ALGORITHMIC PASS</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      {onOpenDecisionPlan && (
        <button
          type="button"
          onClick={() => onOpenDecisionPlan(event.id)}
          className="w-full py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-rose-950/40"
        >
          <span>TRIGGER OPERATIONAL ACTION PLAN</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
