import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  TrendingUp,
  Activity,
  Layers,
  Info,
  ChevronRight,
} from 'lucide-react';

interface NationalThreatAndConfidencePanelProps {
  onNavigateToDecision?: () => void;
  onNavigateToVerification?: () => void;
}

export const NationalThreatAndConfidencePanel: React.FC<NationalThreatAndConfidencePanelProps> = ({
  onNavigateToDecision,
  onNavigateToVerification,
}) => {
  // Threat Level State (Derived from active high-priority Chennai / monsoon scenario events)
  const currentThreatLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE' | 'CRITICAL' = 'SEVERE';

  const threatLevels = [
    { key: 'LOW', label: 'LOW', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-950/40' },
    { key: 'MODERATE', label: 'MODERATE', color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-950/40' },
    { key: 'HIGH', label: 'HIGH', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-950/40' },
    { key: 'SEVERE', label: 'SEVERE', color: 'text-rose-400', border: 'border-rose-500/40', bg: 'bg-rose-950/60' },
    { key: 'CRITICAL', label: 'CRITICAL', color: 'text-red-500', border: 'border-red-600/40', bg: 'bg-red-950/40' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* 1. National Weather Threat Level Card (7 Cols on desktop) */}
      <div className="lg:col-span-7 rounded-2xl bg-slate-900/60 border border-slate-750 backdrop-blur-md p-5 shadow-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
                  NATIONAL WEATHER THREAT LEVEL
                </h3>
                <p className="text-[11px] text-slate-400">
                  Real-time algorithmic risk index based on multi-source disaster reports
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              LEVEL 4: SEVERE
            </span>
          </div>

          {/* Stepped Level Progression Bar */}
          <div className="grid grid-cols-5 gap-1.5 mb-5">
            {threatLevels.map((lvl) => {
              const isActive = lvl.key === currentThreatLevel;
              return (
                <div
                  key={lvl.key}
                  className={`p-2 rounded-xl text-center border transition-all duration-200 ${
                    isActive
                      ? `${lvl.bg} ${lvl.border} ring-2 ring-rose-500/40 shadow-lg shadow-rose-950/40 scale-[1.02]`
                      : 'bg-slate-950/50 border-slate-800/80 opacity-50'
                  }`}
                >
                  <div className={`text-[10.5px] font-mono font-bold ${lvl.color}`}>
                    {lvl.label}
                  </div>
                  {isActive && (
                    <div className="text-[9px] text-rose-300 font-semibold tracking-tight mt-0.5">
                      ACTIVE RISK
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* WHY THIS LEVEL? Section */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-slate-200 flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-rose-300">
                <Info className="w-3.5 h-3.5 text-rose-400" />
                WHY THIS LEVEL?
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Formula: Weighted Severity × Source Confidence × Basin Population
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="flex items-start gap-2 p-1.5 rounded-lg bg-slate-900/60 border border-slate-850">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-white">Active Severe Events:</strong> 17 reports flagged with flood depth &gt; 3.0ft.
                </div>
              </div>

              <div className="flex items-start gap-2 p-1.5 rounded-lg bg-slate-900/60 border border-slate-850">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-white">Geographic Spread:</strong> Critical inundation focused in Adyar & Saidapet basins.
                </div>
              </div>

              <div className="flex items-start gap-2 p-1.5 rounded-lg bg-slate-900/60 border border-slate-850">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-white">Source Agreement:</strong> 92.4% cross-verification between GCC sensors & citizen eyewitnesses.
                </div>
              </div>

              <div className="flex items-start gap-2 p-1.5 rounded-lg bg-slate-900/60 border border-slate-850">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-white">Confidence Score:</strong> 89% aggregate score exceeding high-confidence threshold.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">
            Escalation protocol: Automated CAP broadcast triggered to district emergency controllers.
          </span>
          {onNavigateToDecision && (
            <button
              type="button"
              onClick={onNavigateToDecision}
              className="text-[11px] font-semibold text-rose-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View Action Protocol</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Evidence Confidence Analytics Panel (5 Cols on desktop) */}
      <div className="lg:col-span-5 rounded-2xl bg-slate-900/60 border border-slate-750 backdrop-blur-md p-5 shadow-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
                  EVIDENCE CONFIDENCE
                </h3>
                <p className="text-[11px] text-slate-400">
                  Cross-source corroboration metrics
                </p>
              </div>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-cyan-300">89%</span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase">HIGH</span>
            </div>
          </div>

          {/* Progress Bars as Specified in Brief */}
          <div className="space-y-3.5 mb-4 text-xs">
            {/* 1. Evidence Sources */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-semibold text-slate-200">Evidence Sources</span>
                <span className="font-mono text-cyan-300 font-bold">92%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: '92%' }}
                />
              </div>
            </div>

            {/* 2. Source Agreement */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-semibold text-slate-200">Source Agreement</span>
                <span className="font-mono text-cyan-300 font-bold">86%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: '86%' }}
                />
              </div>
            </div>

            {/* 3. Location Consistency */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-semibold text-slate-200">Location Consistency</span>
                <span className="font-mono text-cyan-300 font-bold">94%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: '94%' }}
                />
              </div>
            </div>

            {/* 4. Duplicate Detection */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-semibold text-slate-200">Duplicate Detection</span>
                <span className="font-mono text-cyan-300 font-bold">98%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: '98%' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-[10px] text-slate-400 font-mono">
            Audit Method: 9-Factor Deterministic Model
          </span>
          {onNavigateToVerification && (
            <button
              type="button"
              onClick={onNavigateToVerification}
              className="text-[11px] font-semibold text-cyan-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Explainable Audit</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
