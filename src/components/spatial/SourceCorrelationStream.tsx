import React, { useState } from 'react';
import {
  Radio,
  Share2,
  Users,
  Database,
  Globe,
  Cpu,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Zap,
} from 'lucide-react';

export const SourceCorrelationStream: React.FC = () => {
  const [selectedSource, setSelectedSource] = useState<string>('all');

  const sources = [
    { id: 'imd', name: 'IMD RADAR & AWS', icon: <Radio className="w-3.5 h-3.5" />, color: '#06B6D4', count: '550+ Stations' },
    { id: 'social', name: 'SOCIAL MEDIA', icon: <Share2 className="w-3.5 h-3.5" />, color: '#38BDF8', count: '48 Dispatches' },
    { id: 'citizen', name: 'CITIZEN REPORTS', icon: <Users className="w-3.5 h-3.5" />, color: '#10B981', count: '32 Spotters' },
    { id: 'datasets', name: 'PUBLIC DATASETS', icon: <Database className="w-3.5 h-3.5" />, color: '#8B5CF6', count: '14 Basins' },
    { id: 'apis', name: 'GLOBAL APIs', icon: <Globe className="w-3.5 h-3.5" />, color: '#F59E0B', count: '5 External Grids' },
    { id: 'sensors', name: 'IOT SENSORS', icon: <Cpu className="w-3.5 h-3.5" />, color: '#EC4899', count: '24 Sluice Gauges' },
  ];

  const pipelineStages = [
    { step: '01', name: 'COLLECT', desc: 'Real-time multi-source ingest', color: 'text-cyan-400' },
    { step: '02', name: 'CLEAN', desc: 'CDM schema & deduplication', color: 'text-sky-400' },
    { step: '03', name: 'CORRELATE', desc: 'Haversine ≤15km, Δt ≤60m', color: 'text-purple-400' },
    { step: '04', name: 'VERIFY', desc: 'Cross-source concordance', color: 'text-emerald-400' },
    { step: '05', name: 'CONFIDENCE', desc: '9-factor mathematical score', color: 'text-amber-400' },
    { step: '06', name: 'DECISION', desc: 'NDMA CAP protocol dispatch', color: 'text-rose-400' },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-950/85 border border-slate-800 backdrop-blur-md shadow-2xl relative overflow-hidden">
      {/* Background cyber grid effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.06),transparent_70%)] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-slate-800 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-bold font-mono tracking-widest text-white uppercase">
              MULTI-SOURCE CORRELATION ENGINE
            </h3>
          </div>
          <p className="text-[11px] text-slate-400">
            Real-time sensory data stream flowing into the central meteorological fusion core
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800/60 shrink-0">
          <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          <span>FUSION CORE: 100% OPERATIONAL</span>
        </div>
      </div>

      {/* Interactive Orbital Source Emitters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6 relative z-10">
        {sources.map((src) => {
          const isSelected = selectedSource === src.id;
          return (
            <button
              key={src.id}
              type="button"
              onClick={() => setSelectedSource(isSelected ? 'all' : src.id)}
              className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'bg-slate-900 border-cyan-400 shadow-lg shadow-cyan-950/50'
                  : 'bg-slate-950/80 hover:bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {/* Particle flow indicator beam */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-75 animate-[pulse_2s_infinite]"
                style={{ backgroundColor: src.color }}
              />

              <div className="flex items-center justify-between mb-1.5">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center text-white"
                  style={{ backgroundColor: `${src.color}25`, color: src.color }}
                >
                  {src.icon}
                </div>
                <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: src.color }} />
              </div>

              <div className="text-[10px] font-bold text-white tracking-tight uppercase truncate">
                {src.name}
              </div>
              <div className="text-[9.5px] font-mono text-slate-400 mt-0.5">
                {src.count}
              </div>
            </button>
          );
        })}
      </div>

      {/* Sequential Pipeline Stages (Signature Visual Element) */}
      <div className="relative z-10">
        <div className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-400 mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>FUSION PIPELINE SEQUENCE:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {pipelineStages.map((stage, idx) => (
            <div
              key={stage.name}
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mb-1">
                  <span>STEP {stage.step}</span>
                  {idx < pipelineStages.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-cyan-500/50 hidden lg:inline" />
                  )}
                </div>
                <div className={`text-xs font-black font-mono tracking-wider ${stage.color}`}>
                  {stage.name}
                </div>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 leading-tight">
                {stage.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
