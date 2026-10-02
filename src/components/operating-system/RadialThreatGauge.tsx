import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface RadialThreatGaugeProps {
  onHighlightRegions?: () => void;
}

export const RadialThreatGauge: React.FC<RadialThreatGaugeProps> = ({
  onHighlightRegions,
}) => {
  const threatScore = 84; // 84/100 -> SEVERE

  return (
    <div className="rounded-2xl bg-slate-950/90 border border-slate-800 backdrop-blur-md shadow-2xl p-3.5 space-y-3 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            NATIONAL THREAT INDEX
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40 font-bold uppercase">
          LEVEL 04 SEVERE
        </span>
      </div>

      {/* Radial Gauge Dial */}
      <div
        onClick={onHighlightRegions}
        className="flex items-center gap-3.5 p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-850 hover:border-rose-500/40 transition-all cursor-pointer group"
      >
        <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#0f172a"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#EF4444"
              strokeWidth="8"
              strokeDasharray="238"
              strokeDashoffset={238 - (238 * threatScore) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-base font-black font-mono text-rose-300 leading-none">
              {threatScore}
            </span>
            <span className="text-[8px] font-mono text-slate-400 font-bold tracking-tight">
              /100
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <div className="text-xs font-bold font-mono text-rose-400 uppercase">
            SEVERE THREAT ACTIVE
          </div>
          <div className="text-[10.5px] text-slate-300 leading-tight mt-0.5">
            Click to illuminate high-risk inundation perimeters on map
          </div>

          {/* Stepped Pill Levels */}
          <div className="grid grid-cols-5 gap-1 pt-1.5 font-mono text-[8px] font-bold text-center">
            <span className="py-0.5 rounded bg-slate-950 text-slate-500">LOW</span>
            <span className="py-0.5 rounded bg-slate-950 text-slate-500">MOD</span>
            <span className="py-0.5 rounded bg-slate-950 text-slate-500">HIGH</span>
            <span className="py-0.5 rounded bg-rose-500 text-white shadow-xs">SEV</span>
            <span className="py-0.5 rounded bg-slate-950 text-slate-500">CRIT</span>
          </div>
        </div>
      </div>

      {/* Threat Drivers Breakdown (Requirement 10) */}
      <div className="grid grid-cols-2 gap-1.5 text-[10.5px] font-mono">
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-[9px] text-slate-400">ACTIVE ALERTS</div>
          <div className="font-bold text-rose-400 text-xs mt-0.5">17 ACTIVE ALERTS</div>
        </div>
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-[9px] text-slate-400">SEVERE EVENTS</div>
          <div className="font-bold text-amber-300 text-xs mt-0.5">8 SEVERE</div>
        </div>
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-[9px] text-slate-400">HIGH-RISK REGIONS</div>
          <div className="font-bold text-purple-300 text-xs mt-0.5">6 HIGH-RISK</div>
        </div>
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-[9px] text-slate-400">AVG CONFIDENCE</div>
          <div className="font-bold text-emerald-400 text-xs mt-0.5">89% AVG CONF</div>
        </div>
      </div>
    </div>
  );
};
