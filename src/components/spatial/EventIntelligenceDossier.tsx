import React from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Share2,
  Clock,
  ArrowRight,
  ExternalLink,
  Bot,
  Layers,
  Sparkles,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { SpatialEventNode } from './SpatialAtmosphericCanvas.tsx';

interface EventIntelligenceDossierProps {
  event: SpatialEventNode | null;
  onClose: () => void;
  onNavigateToModule4?: (eventId: string) => void;
  onAskBot?: (query: string) => void;
}

export const EventIntelligenceDossier: React.FC<EventIntelligenceDossierProps> = ({
  event,
  onClose,
  onNavigateToModule4,
  onAskBot,
}) => {
  if (!event) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-slate-950/95 border-l border-cyan-500/30 backdrop-blur-xl shadow-2xl flex flex-col text-slate-100 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-slate-900/80 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-300">
              EVENT INTELLIGENCE DOSSIER
            </h3>
            <div className="text-[10.5px] font-mono text-slate-400">{event.id}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Core Event Summary Banner */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider"
              style={{
                backgroundColor: `${event.severityColor}20`,
                color: event.severityColor,
                border: `1px solid ${event.severityColor}40`,
              }}
            >
              {event.category} INCIDENT
            </span>
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              {event.timestamp}
            </span>
          </div>

          <h2 className="text-base font-bold text-white leading-snug">{event.title}</h2>
          <div className="text-xs text-cyan-300 font-mono flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>{event.city}, {event.state}</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed pt-1">
            {event.details}
          </p>
        </div>

        {/* Intelligence Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Confidence Score</div>
            <div className="text-xl font-black font-mono text-emerald-400 mt-0.5">{event.confidence}%</div>
            <div className="text-[9.5px] text-slate-500 font-mono">Algorithmic Evidence Score</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Correlated Sources</div>
            <div className="text-xl font-black font-mono text-cyan-300 mt-0.5">{event.sourcesCount}</div>
            <div className="text-[9.5px] text-slate-500 font-mono">Multi-Platform Sensors</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Verification Status</div>
            <div className="text-xs font-bold font-mono text-emerald-300 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {event.status}
            </div>
            <div className="text-[9.5px] text-slate-500 font-mono">Cross-Source Corroborated</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Correlated Reports</div>
            <div className="text-xl font-black font-mono text-purple-300 mt-0.5">8</div>
            <div className="text-[9.5px] text-slate-500 font-mono">Clustered CDM Ingests</div>
          </div>
        </div>

        {/* Visual Evidence Chain */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/25 space-y-3">
          <div className="text-[10.5px] font-mono uppercase font-bold tracking-widest text-cyan-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VISUAL EVIDENCE CHAIN</span>
          </div>

          {/* Stepped Vertical Animated Flow */}
          <div className="space-y-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="font-mono text-[10.5px] text-cyan-300 font-bold">
                IMD + SOCIAL + CITIZEN + API
              </span>
              <span className="text-[9.5px] text-slate-400 font-mono">12 Raw Inputs</span>
            </div>

            <div className="flex justify-center my-0.5 text-cyan-400 font-mono text-[10px]">
              ↓
            </div>

            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="font-mono text-[10.5px] text-purple-300 font-bold">
                CORRELATION
              </span>
              <span className="text-[9.5px] text-slate-400 font-mono">Haversine ≤1.4km • Δt ≤12m</span>
            </div>

            <div className="flex justify-center my-0.5 text-purple-400 font-mono text-[10px]">
              ↓
            </div>

            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="font-mono text-[10.5px] text-emerald-300 font-bold">
                VERIFICATION
              </span>
              <span className="text-[9.5px] text-slate-400 font-mono">Dual-Source Agreement 92.4%</span>
            </div>

            <div className="flex justify-center my-0.5 text-emerald-400 font-mono text-[10px]">
              ↓
            </div>

            <div className="p-2 rounded-lg bg-slate-950 border border-emerald-500/40 flex items-center justify-between">
              <span className="font-mono text-[10.5px] text-amber-300 font-bold">
                {event.confidence}% CONFIDENCE
              </span>
              <span className="text-[9.5px] text-emerald-400 font-mono font-bold">ALGORITHMIC PASS</span>
            </div>

            <div className="flex justify-center my-0.5 text-amber-400 font-mono text-[10px]">
              ↓
            </div>

            <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/40 flex items-center justify-between">
              <span className="font-mono text-[10.5px] text-rose-300 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                ACTIONABLE EVENT
              </span>
              <span className="text-[9.5px] text-rose-300 font-mono font-bold">DISPATCH READY</span>
            </div>
          </div>
        </div>

        {/* AI Assistant Quick Prompt */}
        <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-blue-200">
            <Bot className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-[11px]">Ask AeroBot AI to analyze this event scenario</span>
          </div>
          {onAskBot && (
            <button
              type="button"
              onClick={() => onAskBot(`Explain active meteorological incident ${event.id} in ${event.city} and recommended emergency action`)}
              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono text-[10.5px] font-bold shrink-0 transition-colors cursor-pointer"
            >
              Ask AI
            </button>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
        {onNavigateToModule4 && (
          <button
            type="button"
            onClick={() => onNavigateToModule4(event.id)}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-mono text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>DECISION ACTION PLAN</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};
