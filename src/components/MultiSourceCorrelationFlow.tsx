import React, { useState } from 'react';
import {
  Layers,
  ArrowRight,
  ArrowDown,
  Sparkles,
  Radio,
  Share2,
  CloudLightning,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Cpu,
  Database,
  Info,
} from 'lucide-react';

interface StageDetail {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  details: string[];
  metric: string;
}

export const MultiSourceCorrelationFlow: React.FC = () => {
  const [activeStage, setActiveStage] = useState<string>('correlation');

  const stages: StageDetail[] = [
    {
      id: 'sources',
      name: 'Multi-Source Raw Ingestion',
      subtitle: '5 Heterogeneous Source Ingestors',
      badge: 'CDM Normalization',
      details: [
        'IMD Doppler Radar & Automated Surface Stations',
        'Social Media Geotagged Feeds (Twitter/X, Bluesky)',
        'Citizen Eyewitness Spotters (mPING Observer Grid)',
        'Global Numerical Weather APIs (NWS, OpenWeather)',
        'TNSDMA & GCC River Gauges & PWD Sluice Sensors',
      ],
      metric: '128 Reports Active',
    },
    {
      id: 'correlation',
      name: 'Spatial-Temporal Data Correlation',
      subtitle: 'Automated Clustering Matrix',
      badge: 'Cluster Engine',
      details: [
        'Spatial Proximity: Haversine distance threshold ≤ 15.0 km',
        'Temporal Co-occurrence: Timestamp delta window Δt ≤ 60 min',
        'Semantic Hazard Alignment: NLP entity extraction & synonym graph',
        'Provenance & Duplicate Filtering: Exact & near-duplicate hash',
      ],
      metric: '4 Clusters Generated',
    },
    {
      id: 'verification',
      name: 'Evidence Verification & Conflict Resolution',
      subtitle: 'Multi-Perspective Verification',
      badge: 'Cross-Source Audit',
      details: [
        'Official vs Ground Eyewitness Agreement Calculation',
        'Multimedia Verification: Optical flood depth & radar cross-check',
        'Contradiction Resolver: Negation keyword detection (e.g. dry road)',
        'Weight Impact Analysis based on source credibility scores',
      ],
      metric: '92% Source Concordance',
    },
    {
      id: 'confidence',
      name: 'Explainable Confidence Scoring',
      subtitle: '9-Factor Weighted Algorithm',
      badge: 'Calculated Index',
      details: [
        'Independent Sources Count Weight (35%)',
        'Official Government Agency Agreement (25%)',
        'Sensor & Radar Physical Ground Truth (20%)',
        'Temporal Freshness & Spatial Density (20%)',
      ],
      metric: '89% Mean Confidence',
    },
    {
      id: 'event',
      name: 'Actionable Meteorological Event',
      subtitle: 'Operational Decision Dispatch',
      badge: 'Disaster Support',
      details: [
        'Targeted CAP Protocol SMS Broadcasting (PIN 600015)',
        'NDRF 4th Battalion Inflatable Boat Pre-positioning',
        'GCC Automated Storm Water Gate Sluice Control',
        'Traffic Diversion along Anna Salai Corridor',
      ],
      metric: 'P1 Emergency Tier',
    },
  ];

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-750 backdrop-blur-md p-5 shadow-2xl relative overflow-hidden">
      {/* Background subtle flow line glow */}
      <div className="absolute top-1/2 left-0 right-0 h-32 -translate-y-1/2 bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              MULTI-SOURCE CORRELATION & VERIFICATION PIPELINE
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Automated fusion of official telemetry, crowd observations, social dispatches, and sensory data into verified decision events.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono bg-cyan-950/60 px-3 py-1.5 rounded-xl border border-cyan-800/60 shrink-0">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>REAL-TIME PIPELINE ACTIVE</span>
        </div>
      </div>

      {/* Connected Nodes Flow Container (Horizontal on Desktop, Vertical on Mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 lg:gap-3.5 mb-6 relative z-10">
        {/* Stage 1: Ingestion Sources */}
        <div
          onClick={() => setActiveStage('sources')}
          className={`group p-3.5 rounded-xl border transition-all duration-200 cursor-pointer relative ${
            activeStage === 'sources'
              ? 'bg-blue-950/80 border-blue-500 shadow-lg shadow-blue-900/30 ring-1 ring-blue-500/50'
              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-blue-400 px-1.5 py-0.5 rounded bg-blue-900/50 border border-blue-700/60">
              STAGE 01
            </span>
            <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
          </div>
          <h4 className="text-xs font-bold text-white mb-0.5">Ingestion Sources</h4>
          <p className="text-[11px] text-slate-400 leading-tight mb-2">
            IMD • Social • Citizen • APIs • Sensors
          </p>
          <div className="text-[10px] font-mono text-cyan-300 font-semibold bg-slate-900 px-2 py-1 rounded border border-slate-800 flex items-center justify-between">
            <span>Volume</span>
            <span>128 Reports</span>
          </div>
        </div>

        {/* Stage 2: Data Correlation */}
        <div
          onClick={() => setActiveStage('correlation')}
          className={`group p-3.5 rounded-xl border transition-all duration-200 cursor-pointer relative ${
            activeStage === 'correlation'
              ? 'bg-cyan-950/80 border-cyan-500 shadow-lg shadow-cyan-900/30 ring-1 ring-cyan-500/50'
              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-900/50 border border-cyan-700/60">
              STAGE 02
            </span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <h4 className="text-xs font-bold text-white mb-0.5">Data Correlation</h4>
          <p className="text-[11px] text-slate-400 leading-tight mb-2">
            Spatial • Temporal • Semantic NLP
          </p>
          <div className="text-[10px] font-mono text-cyan-300 font-semibold bg-slate-900 px-2 py-1 rounded border border-slate-800 flex items-center justify-between">
            <span>Clustering</span>
            <span>≤15km / 60m</span>
          </div>
        </div>

        {/* Stage 3: Evidence Verification */}
        <div
          onClick={() => setActiveStage('verification')}
          className={`group p-3.5 rounded-xl border transition-all duration-200 cursor-pointer relative ${
            activeStage === 'verification'
              ? 'bg-teal-950/80 border-teal-500 shadow-lg shadow-teal-900/30 ring-1 ring-teal-500/50'
              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-teal-400 px-1.5 py-0.5 rounded bg-teal-900/50 border border-teal-700/60">
              STAGE 03
            </span>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>
          <h4 className="text-xs font-bold text-white mb-0.5">Evidence Audit</h4>
          <p className="text-[11px] text-slate-400 leading-tight mb-2">
            Conflict Resolution & Multi-Check
          </p>
          <div className="text-[10px] font-mono text-teal-300 font-semibold bg-slate-900 px-2 py-1 rounded border border-slate-800 flex items-center justify-between">
            <span>Agreement</span>
            <span>92.4% Match</span>
          </div>
        </div>

        {/* Stage 4: Confidence Score */}
        <div
          onClick={() => setActiveStage('confidence')}
          className={`group p-3.5 rounded-xl border transition-all duration-200 cursor-pointer relative ${
            activeStage === 'confidence'
              ? 'bg-indigo-950/80 border-indigo-500 shadow-lg shadow-indigo-900/30 ring-1 ring-indigo-500/50'
              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-900/50 border border-indigo-700/60">
              STAGE 04
            </span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <h4 className="text-xs font-bold text-white mb-0.5">Confidence Score</h4>
          <p className="text-[11px] text-slate-400 leading-tight mb-2">
            Multi-Factor Mathematical Weighting
          </p>
          <div className="text-[10px] font-mono text-indigo-300 font-semibold bg-slate-900 px-2 py-1 rounded border border-slate-800 flex items-center justify-between">
            <span>Overall Score</span>
            <span>89.2% AVG</span>
          </div>
        </div>

        {/* Stage 5: Weather Event Dispatch */}
        <div
          onClick={() => setActiveStage('event')}
          className={`group p-3.5 rounded-xl border transition-all duration-200 cursor-pointer relative ${
            activeStage === 'event'
              ? 'bg-rose-950/80 border-rose-500 shadow-lg shadow-rose-900/30 ring-1 ring-rose-500/50'
              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-rose-400 px-1.5 py-0.5 rounded bg-rose-900/50 border border-rose-700/60">
              STAGE 05
            </span>
            <CheckCircle2 className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <h4 className="text-xs font-bold text-white mb-0.5">Actionable Event</h4>
          <p className="text-[11px] text-slate-400 leading-tight mb-2">
            NDMA & SDMA Decision Dispatch
          </p>
          <div className="text-[10px] font-mono text-rose-300 font-semibold bg-slate-900 px-2 py-1 rounded border border-slate-800 flex items-center justify-between">
            <span>Action Ready</span>
            <span>P1 Priority</span>
          </div>
        </div>
      </div>

      {/* Dynamic Detailed Inspection Box for Selected Stage */}
      {(() => {
        const stage = stages.find((s) => s.id === activeStage) || stages[1];
        return (
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs relative z-10 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/80">
                  {stage.badge}
                </span>
                <h5 className="font-bold text-white text-xs sm:text-sm">{stage.name}</h5>
              </div>
              <span className="text-slate-400 text-[11px] font-mono">
                Key Performance Metric: <strong className="text-cyan-300">{stage.metric}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 text-[11px]">
              {stage.details.map((detail, idx) => (
                <div key={idx} className="flex items-start gap-2 p-1.5 rounded-lg bg-slate-900/50 border border-slate-850">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
