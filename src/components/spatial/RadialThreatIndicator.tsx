import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Activity,
  Info,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface RadialThreatIndicatorProps {
  onOpenDecisionPanel?: () => void;
}

export const RadialThreatIndicator: React.FC<RadialThreatIndicatorProps> = ({
  onOpenDecisionPanel,
}) => {
  const [isWhyExpanded, setIsWhyExpanded] = useState<boolean>(true);

  // Dynamic threat level calculation (Level 4 SEVERE for active scenario)
  const levelIndex = 4; // 1: LOW, 2: MODERATE, 3: HIGH, 4: SEVERE, 5: CRITICAL
  const levelName = 'SEVERE';
  const threatScore = 84; // 0 - 100

  // 5 Arc segments for circular radial dial
  const segments = [
    { label: 'LOW', color: '#10B981', active: false },
    { label: 'MOD', color: '#06B6D4', active: false },
    { label: 'HIGH', color: '#F59E0B', active: false },
    { label: 'SEVERE', color: '#EF4444', active: true },
    { label: 'CRIT', color: '#DC2626', active: false },
  ];

  return (
    <div className="p-4 rounded-2xl bg-slate-950/85 border border-slate-800 backdrop-blur-md shadow-2xl relative overflow-hidden">
      {/* Background glow behind radial dial */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-rose-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
          <span className="text-[11px] font-mono font-bold tracking-widest text-slate-200 uppercase">
            NATIONAL THREAT INDEX
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40 font-bold uppercase">
          LEVEL 04 SEVERE
        </span>
      </div>

      {/* Futuristic Circular/Radial Gauge */}
      <div className="flex items-center gap-4 py-2">
        {/* SVG Radial Gauge */}
        <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* Background Track */}
            <circle
              cx="60"
              cy="60"
              r="46"
              fill="none"
              stroke="#0f172a"
              strokeWidth="9"
            />

            {/* Glowing Segmented Arc (0 - 84% filled) */}
            <circle
              cx="60"
              cy="60"
              r="46"
              fill="none"
              stroke="url(#threatGradient)"
              strokeWidth="9"
              strokeDasharray="289"
              strokeDashoffset={289 - (289 * threatScore) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />

            {/* Concentric tick rings */}
            <circle
              cx="60"
              cy="60"
              r="53"
              fill="none"
              stroke="rgba(6, 182, 212, 0.2)"
              strokeWidth="1"
              strokeDasharray="2,6"
            />

            <defs>
              <linearGradient id="threatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06B6D4" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Text in Gauge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-black font-mono text-rose-300 leading-none">
              {threatScore}
            </span>
            <span className="text-[9px] font-mono text-slate-400 font-bold tracking-tight">
              /100 RISK
            </span>
          </div>
        </div>

        {/* Level Readout & Segment Breakdown */}
        <div className="flex-1 space-y-1.5">
          <div className="text-base font-black font-mono tracking-wide text-rose-400">
            SEVERE THREAT
          </div>
          <div className="text-[11px] text-slate-300 leading-tight">
            High-risk flash flood & inundation matrix active in Tamil Nadu delta.
          </div>

          {/* 5 Segment Pills */}
          <div className="grid grid-cols-5 gap-1 pt-1">
            {segments.map((seg, idx) => (
              <div
                key={seg.label}
                className={`py-1 rounded text-center text-[8.5px] font-mono font-bold transition-all ${
                  seg.active
                    ? 'bg-rose-500 text-white shadow-xs shadow-rose-500/50 ring-1 ring-white'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}
              >
                {seg.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expandable "WHY?" Intelligence Explanation */}
      <div className="mt-3 pt-2.5 border-t border-slate-800">
        <button
          type="button"
          onClick={() => setIsWhyExpanded(!isWhyExpanded)}
          className="w-full flex items-center justify-between text-left text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5 text-rose-300 text-[10.5px] font-mono uppercase tracking-wider font-bold">
            <Info className="w-3.5 h-3.5" />
            THREAT DRIVERS
          </span>
          {isWhyExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {isWhyExpanded && (
          <div className="mt-2.5 space-y-1.5 text-[10.5px] text-slate-300 animate-in fade-in duration-150">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/70 border border-slate-800">
              <span className="flex items-center gap-2 font-mono font-bold text-rose-300">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                17 ACTIVE ALERTS
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Disaster Flash Broadcasts</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/70 border border-slate-800">
              <span className="flex items-center gap-2 font-mono font-bold text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                8 SEVERE EVENTS
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Inundation & Coastal Gale</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/70 border border-slate-800">
              <span className="flex items-center gap-2 font-mono font-bold text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                91% AVG CONFIDENCE
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Multi-Source Cross-Check</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/70 border border-slate-800">
              <span className="flex items-center gap-2 font-mono font-bold text-purple-300">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                6 HIGH-RISK REGIONS
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Adyar, Saidapet, Coastal TN</span>
            </div>

            {onOpenDecisionPanel && (
              <button
                type="button"
                onClick={onOpenDecisionPanel}
                className="w-full mt-2 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-mono text-[10.5px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>OPEN OPERATIONAL DECISION PANEL</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
