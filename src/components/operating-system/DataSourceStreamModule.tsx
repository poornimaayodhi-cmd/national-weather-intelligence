import React from 'react';
import {
  Radio,
  Share2,
  Users,
  Globe,
  Database,
  Cpu,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const DataSourceStreamModule: React.FC = () => {
  const sources = [
    { label: 'IMD', icon: <Radio className="w-3 h-3 text-cyan-400" /> },
    { label: 'SOCIAL', icon: <Share2 className="w-3 h-3 text-sky-400" /> },
    { label: 'CITIZEN', icon: <Users className="w-3 h-3 text-emerald-400" /> },
    { label: 'API', icon: <Globe className="w-3 h-3 text-amber-400" /> },
    { label: 'DATASETS', icon: <Database className="w-3 h-3 text-purple-400" /> },
    { label: 'SENSORS', icon: <Cpu className="w-3 h-3 text-rose-400" /> },
  ];

  const pipeline = [
    'INGESTION',
    'CORRELATION',
    'VERIFICATION',
    'INTELLIGENCE',
  ];

  return (
    <div className="rounded-2xl bg-slate-950/90 border border-slate-800 backdrop-blur-md shadow-2xl p-3.5 space-y-3 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            DATA SOURCE ORBIT
          </h3>
        </div>
        <span className="text-[10px] font-mono text-cyan-400">
          6 FEED STREAMS
        </span>
      </div>

      {/* Grid of Sources */}
      <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
        {sources.map((s) => (
          <div
            key={s.label}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-850 flex items-center gap-1.5 text-slate-300"
          >
            {s.icon}
            <span className="font-bold">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Pipeline Flow: INGESTION → CORRELATION → VERIFICATION → INTELLIGENCE */}
      <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div className="text-[9px] font-mono uppercase text-slate-500 mb-1.5">
          Data Flow Pathway:
        </div>
        <div className="flex items-center justify-between font-mono text-[9px] font-bold">
          {pipeline.map((step, idx) => (
            <React.Fragment key={step}>
              <span
                className={
                  idx === 3
                    ? 'text-cyan-300 bg-cyan-950 px-1 py-0.5 rounded border border-cyan-800/60'
                    : 'text-slate-300'
                }
              >
                {step}
              </span>
              {idx < pipeline.length - 1 && (
                <ArrowRight className="w-2.5 h-2.5 text-cyan-500/60" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
