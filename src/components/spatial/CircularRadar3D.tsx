import React, { useState } from 'react';
import {
  Radio,
  Eye,
  Crosshair,
  ShieldCheck,
  AlertTriangle,
  CloudRain,
  ExternalLink,
} from 'lucide-react';

interface RadarEvent {
  id: string;
  name: string;
  distanceKm: number;
  bearingDeg: number;
  dBZ: number; // Doppler reflectivity
  category: 'SEVERE' | 'HEAVY' | 'MODERATE' | 'CLEAR';
  confidence: number;
  city: string;
}

const RADAR_TARGETS: RadarEvent[] = [
  {
    id: 'TGT-01',
    name: 'Saidapet Subway Inundation Core',
    distanceKm: 85,
    bearingDeg: 135,
    dBZ: 54,
    category: 'SEVERE',
    confidence: 91,
    city: 'Chennai (Saidapet)',
  },
  {
    id: 'TGT-02',
    name: 'Meenambakkam Convective Cell',
    distanceKm: 120,
    bearingDeg: 210,
    dBZ: 46,
    category: 'HEAVY',
    confidence: 96,
    city: 'Chennai (Airport AWS)',
  },
  {
    id: 'TGT-03',
    name: 'Adyar Estuary Water Gauge',
    distanceKm: 65,
    bearingDeg: 80,
    dBZ: 42,
    category: 'HEAVY',
    confidence: 94,
    city: 'Adyar Delta',
  },
  {
    id: 'TGT-04',
    name: 'Sriperumbudur Cloudburst Band',
    distanceKm: 190,
    bearingDeg: 275,
    dBZ: 38,
    category: 'MODERATE',
    confidence: 88,
    city: 'Kanchipuram Basin',
  },
  {
    id: 'TGT-05',
    name: 'Ennore Maritime Squall Line',
    distanceKm: 160,
    bearingDeg: 35,
    dBZ: 49,
    category: 'SEVERE',
    confidence: 92,
    city: 'North Chennai Port',
  },
];

interface CircularRadar3DProps {
  onSelectTarget?: (target: RadarEvent) => void;
}

export const CircularRadar3D: React.FC<CircularRadar3DProps> = ({
  onSelectTarget,
}) => {
  const [activeTarget, setActiveTarget] = useState<RadarEvent | null>(RADAR_TARGETS[0]);
  const [sweepActive, setSweepActive] = useState<boolean>(true);

  // Convert polar coordinates (distanceKm, bearingDeg) to SVG percentage positions (0 to 100)
  // Max radar range = 250km
  const getCoordinates = (distKm: number, bearingDeg: number) => {
    const rad = ((bearingDeg - 90) * Math.PI) / 180;
    const normalizedRadius = (distKm / 250) * 44; // max radius 44% of container
    const x = 50 + normalizedRadius * Math.cos(rad);
    const y = 50 + normalizedRadius * Math.sin(rad);
    return { x, y };
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-950/85 border border-slate-800 backdrop-blur-md shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          <div>
            <h3 className="text-xs sm:text-sm font-bold font-mono tracking-widest text-white uppercase">
              3D DOPPLER WEATHER RADAR GRID
            </h3>
            <p className="text-[11px] text-slate-400">
              Chennai S-Band Polarimetric Radar (DWR) • 250km Surveillance Radius
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => setSweepActive(!sweepActive)}
            className={`px-2.5 py-1 rounded-lg border transition-colors ${
              sweepActive
                ? 'bg-cyan-950 text-cyan-300 border-cyan-700/60'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            BEAM SWEEP: {sweepActive ? 'ACTIVE' : 'PAUSED'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Radar Circular Scope (7 Cols) */}
        <div className="lg:col-span-7 flex items-center justify-center">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full bg-[#030917] border border-cyan-500/40 shadow-inner overflow-hidden flex items-center justify-center select-none">
            {/* Range Rings: 50km, 100km, 175km, 250km */}
            <div className="absolute w-[20%] h-[20%] rounded-full border border-cyan-500/25 border-dashed" />
            <div className="absolute w-[40%] h-[40%] rounded-full border border-cyan-500/30" />
            <div className="absolute w-[65%] h-[65%] rounded-full border border-cyan-500/25 border-dashed" />
            <div className="absolute w-[88%] h-[88%] rounded-full border border-cyan-500/40" />

            {/* Crosshairs & Bearing Axes */}
            <div className="absolute w-full h-[1px] bg-cyan-500/25" />
            <div className="absolute h-full w-[1px] bg-cyan-500/25" />
            <div className="absolute w-full h-[1px] bg-cyan-500/10 rotate-45" />
            <div className="absolute w-full h-[1px] bg-cyan-500/10 -rotate-45" />

            {/* Bearing Labels */}
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-cyan-400/80 font-bold">000° N</span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-cyan-400/80 font-bold">090° E</span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-cyan-400/80 font-bold">180° S</span>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-cyan-400/80 font-bold">270° W</span>

            {/* Moving Radar Sweep Beam */}
            {sweepActive && (
              <div className="absolute inset-0 rounded-full pointer-events-none animate-[spin_8s_linear_infinite] origin-center opacity-40 bg-[conic-gradient(from_0deg,transparent_0deg,transparent_290deg,rgba(6,182,212,0.18)_340deg,rgba(34,211,238,0.55)_360deg)]" />
            )}

            {/* Radar Reflectivity Clouds (dBZ Simulated Heat Clusters) */}
            <div className="absolute w-24 h-24 rounded-full bg-blue-500/20 blur-xl translate-x-8 translate-y-10 pointer-events-none" />
            <div className="absolute w-16 h-16 rounded-full bg-rose-500/25 blur-lg translate-x-10 translate-y-12 pointer-events-none" />
            <div className="absolute w-20 h-20 rounded-full bg-purple-500/20 blur-xl -translate-x-12 translate-y-6 pointer-events-none" />

            {/* Interactive Radar Event Targets */}
            {RADAR_TARGETS.map((tgt) => {
              const { x, y } = getCoordinates(tgt.distanceKm, tgt.bearingDeg);
              const isSelected = activeTarget?.id === tgt.id;

              return (
                <div
                  key={tgt.id}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                  onClick={() => {
                    setActiveTarget(tgt);
                    if (onSelectTarget) onSelectTarget(tgt);
                  }}
                >
                  <div
                    className={`w-6 h-6 -top-1 -left-1 absolute rounded-full opacity-60 animate-ping ${
                      tgt.category === 'SEVERE' ? 'bg-rose-500' : 'bg-cyan-400'
                    }`}
                  />
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-transform group-hover:scale-125 ${
                      isSelected
                        ? 'bg-rose-500 border-white ring-2 ring-rose-400 scale-125'
                        : tgt.category === 'SEVERE'
                        ? 'bg-rose-600 border-rose-400 text-white'
                        : 'bg-cyan-500 border-cyan-300 text-white'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  {/* Tooltip on hover */}
                  <div className="hidden group-hover:block absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap bg-slate-950 px-2 py-1 rounded border border-cyan-500/40 text-[10px] text-white shadow-xl z-20 font-mono">
                    {tgt.city} • {tgt.dBZ} dBZ
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Target Details Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span>RADAR ECHO TELEMETRY</span>
          </div>

          {activeTarget ? (
            <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs space-y-3">
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800">
                <div>
                  <span
                    className={`text-[9.5px] font-bold font-mono px-2 py-0.5 rounded uppercase tracking-wider ${
                      activeTarget.category === 'SEVERE'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    }`}
                  >
                    {activeTarget.category} ECHO
                  </span>
                  <h4 className="font-bold text-white text-sm mt-1">{activeTarget.name}</h4>
                  <div className="text-[11px] text-cyan-300 font-mono">{activeTarget.city}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black font-mono text-cyan-300">{activeTarget.dBZ}</div>
                  <div className="text-[9.5px] font-mono text-slate-400">dBZ REFLECTIVITY</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">Radial Distance</div>
                  <div className="font-bold font-mono text-white text-xs mt-0.5">{activeTarget.distanceKm} km</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">Radar Bearing</div>
                  <div className="font-bold font-mono text-white text-xs mt-0.5">{activeTarget.bearingDeg}° Azimuth</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-300">
                <span>Correlation Confidence:</span>
                <span className="font-bold font-mono text-emerald-400">{activeTarget.confidence}% VERIFIED</span>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 text-xs">
              Click a target marker on the radar screen to inspect Doppler echoes.
            </div>
          )}

          {/* Radar Reflectivity Scale Legend */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[10px] font-mono space-y-1">
            <div className="text-slate-400 font-bold uppercase">Precipitation Intensity (dBZ):</div>
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-200">20 Light</span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-200">35 Moderate</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-200">45 Heavy</span>
              <span className="px-1.5 py-0.5 rounded bg-rose-900/80 text-rose-200 font-bold">55+ Extreme</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
