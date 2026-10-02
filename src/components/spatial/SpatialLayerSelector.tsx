import React from 'react';
import {
  CloudSun,
  Layers,
  ShieldCheck,
  Sparkles,
  ShieldAlert,
  ChevronDown,
  Activity,
  Check,
} from 'lucide-react';

export interface SpatialLayer {
  id: string;
  number: string;
  name: string;
  subtitle: string;
  metrics: string;
  color: string;
  icon: React.ReactNode;
}

export const SPATIAL_LAYERS: SpatialLayer[] = [
  {
    id: 'LAYER_01',
    number: '01',
    name: 'LIVE WEATHER',
    subtitle: 'Surface AWS & Doppler Radar Telemetry',
    metrics: '550+ Stations • 14ms Latency',
    color: '#06B6D4', // Electric Cyan
    icon: <CloudSun className="w-3.5 h-3.5 text-cyan-400" />,
  },
  {
    id: 'LAYER_02',
    number: '02',
    name: 'MULTI-SOURCE REPORTS',
    subtitle: 'Social Media, Eyewitness Spotters, APIs',
    metrics: '128 Active Streams Ingested',
    color: '#38BDF8', // Sky Blue
    icon: <Layers className="w-3.5 h-3.5 text-sky-400" />,
  },
  {
    id: 'LAYER_03',
    number: '03',
    name: 'CORRELATED EVIDENCE',
    subtitle: 'Spatial-Temporal-Semantic Clustering',
    metrics: '≤15km Radius • Δt ≤60 min',
    color: '#8B5CF6', // Aurora Violet
    icon: <Activity className="w-3.5 h-3.5 text-purple-400" />,
  },
  {
    id: 'LAYER_04',
    number: '04',
    name: 'AI VERIFICATION',
    subtitle: 'Cross-Source Corroboration & Conflict Resolver',
    metrics: '91.4% Confidence Threshold',
    color: '#10B981', // Emerald
    icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400" />,
  },
  {
    id: 'LAYER_05',
    number: '05',
    name: 'THREAT INTELLIGENCE',
    subtitle: 'NDMA/SDMA Algorithmic Severity Dispatch',
    metrics: 'Level 4 SEVERE • 17 Active Alerts',
    color: '#EF4444', // Red
    icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />,
  },
];

interface SpatialLayerSelectorProps {
  activeLayer: string;
  onSelectLayer: (layerId: string) => void;
  compact?: boolean;
  className?: string;
}

export const SpatialLayerSelector: React.FC<SpatialLayerSelectorProps> = ({
  activeLayer,
  onSelectLayer,
  compact = false,
  className = '',
}) => {
  if (compact) {
    return (
      <div className={`flex flex-col gap-2 w-full ${className}`}>
        <div className="flex items-center justify-between pb-1 px-1">
          <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-cyan-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            SPATIAL DATA STACK • 5 LAYERS
          </span>
          <div className="flex items-center gap-2">
            {activeLayer !== 'ALL' && (
              <button
                type="button"
                onClick={() => onSelectLayer('ALL')}
                className="text-[10px] font-mono text-cyan-300 hover:text-white underline cursor-pointer"
              >
                Reset Filter
              </button>
            )}
            <span className="text-[9.5px] font-mono text-slate-500">TAP TO FILTER</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {SPATIAL_LAYERS.map((layer) => {
            const isSelected = activeLayer === layer.id;

            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => onSelectLayer(isSelected ? 'ALL' : layer.id)}
                className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-2 relative z-10 ${
                  isSelected
                    ? 'bg-slate-900/95 border-cyan-400 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-400/40'
                    : 'bg-slate-950/75 hover:bg-slate-900/80 border-slate-800/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-colors"
                    style={{
                      backgroundColor: `${layer.color}15`,
                      borderColor: `${layer.color}40`,
                    }}
                  >
                    {layer.icon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-mono font-bold text-slate-400">
                        L{layer.number}
                      </span>
                      <span className="text-[10.5px] font-bold text-white tracking-wide truncate">
                        {layer.name}
                      </span>
                    </div>
                    <div className="text-[9.5px] text-slate-400 truncate">
                      {layer.metrics}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isSelected ? (
                    <div className="w-3.5 h-3.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-400/60 flex items-center justify-center text-[9px]">
                      <Check className="w-2 h-2" />
                    </div>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 max-w-xs sm:max-w-sm ${className}`}>
      <div className="flex items-center justify-between pb-1 px-1">
        <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-cyan-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          SPATIAL DATA STACK
        </span>
        <span className="text-[9.5px] font-mono text-slate-500">5 ACTIVE DEPTH LAYERS</span>
      </div>

      <div className="space-y-1.5">
        {SPATIAL_LAYERS.map((layer, index) => {
          const isActive = activeLayer === layer.id || activeLayer === 'ALL';
          const isSelected = activeLayer === layer.id;

          return (
            <div key={layer.id} className="relative group">
              {/* Connector line to next layer */}
              {index < SPATIAL_LAYERS.length - 1 && (
                <div className="absolute left-5 top-full w-[1px] h-1.5 bg-cyan-500/20 z-0" />
              )}

              <button
                type="button"
                onClick={() => onSelectLayer(isSelected ? 'ALL' : layer.id)}
                className={`w-full p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 relative z-10 ${
                  isSelected
                    ? 'bg-slate-900/95 border-cyan-400/80 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/40'
                    : 'bg-slate-950/75 hover:bg-slate-900/80 border-slate-800/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-colors"
                    style={{
                      backgroundColor: `${layer.color}15`,
                      borderColor: `${layer.color}40`,
                    }}
                  >
                    {layer.icon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9.5px] font-mono font-bold text-slate-400">
                        L{layer.number}
                      </span>
                      <span className="text-[11px] font-bold text-white tracking-wide truncate">
                        {layer.name}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {layer.metrics}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center">
                  {isSelected ? (
                    <div className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-400/60 flex items-center justify-center text-[10px]">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-700 group-hover:bg-cyan-500/60 transition-colors" />
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
