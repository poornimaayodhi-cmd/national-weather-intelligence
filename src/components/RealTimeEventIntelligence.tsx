import React, { useState } from 'react';
import {
  CloudRain,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Flame,
  Radio,
  Eye,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export interface WeatherEventItem {
  id: string;
  eventType: string;
  location: string;
  state: string;
  timeIST: string;
  sourcesCount: number;
  confidenceScore: number;
  status: 'VERIFIED' | 'PROVISIONAL' | 'ACTION_REQUIRED' | 'DISPUTED';
  hazardCategory: 'FLOOD' | 'RAIN' | 'STORM' | 'HEAT' | 'WIND';
  summary: string;
  keyMetric: string;
}

const DEFAULT_EVENT_INTELLIGENCE: WeatherEventItem[] = [
  {
    id: 'EVT-CHE-2026-001',
    eventType: 'Severe Flash Inundation & Subway Flooding',
    location: 'Chennai (Saidapet / Maraimalai Adigal)',
    state: 'Tamil Nadu',
    timeIST: '14:32 IST',
    sourcesCount: 12,
    confidenceScore: 91,
    status: 'VERIFIED',
    hazardCategory: 'FLOOD',
    summary: '4.2ft waterlogged under subway, Adyar river gauge trending 1.1m above danger mark. Multi-source agreement verified.',
    keyMetric: 'Rainfall 124.5mm • Water Depth 4.2ft',
  },
  {
    id: 'EVT-CHE-2026-002',
    eventType: 'Monsoon Heavy Convective Cloudburst Band',
    location: 'Chennai (Meenambakkam & Guindy)',
    state: 'Tamil Nadu',
    timeIST: '14:15 IST',
    sourcesCount: 8,
    confidenceScore: 95,
    status: 'VERIFIED',
    hazardCategory: 'RAIN',
    summary: 'Continuous torrential rainfall detected by IMD Doppler radar and 4 ground tipping buckets.',
    keyMetric: 'Precipitation Rate 48mm/hr',
  },
  {
    id: 'EVT-MUM-2026-003',
    eventType: 'Coastal Squall & High Sea Swells',
    location: 'Mumbai (Colaba & Marine Drive)',
    state: 'Maharashtra',
    timeIST: '13:50 IST',
    sourcesCount: 9,
    confidenceScore: 88,
    status: 'VERIFIED',
    hazardCategory: 'STORM',
    summary: 'High wind gusts up to 58 km/h recorded; Arabian Sea wave height advisory issued for small fishing crafts.',
    keyMetric: 'Gusts 58 km/h • Wave 3.5m',
  },
  {
    id: 'EVT-ODI-2026-004',
    eventType: 'Severe Thunderstorm & Mesoscale Lightning Line',
    location: 'Balasore / Paradip Coast',
    state: 'Odisha',
    timeIST: '13:20 IST',
    sourcesCount: 7,
    confidenceScore: 86,
    status: 'PROVISIONAL',
    hazardCategory: 'STORM',
    summary: 'Doppler radar reflectivity exceeding 52 dBZ moving westward across coastal districts.',
    keyMetric: 'Reflectivity 52 dBZ',
  },
  {
    id: 'EVT-ASM-2026-005',
    eventType: 'Riverine Water Level Surge Watch',
    location: 'Guwahati (Brahmaputra Valley)',
    state: 'Assam',
    timeIST: '12:45 IST',
    sourcesCount: 11,
    confidenceScore: 89,
    status: 'ACTION_REQUIRED',
    hazardCategory: 'FLOOD',
    summary: 'Continuous tributary inflows from upper catchment basins; warning alerts issued to low-lying islands.',
    keyMetric: 'River Level +1.4m',
  },
];

interface RealTimeEventIntelligenceProps {
  onSelectEvent?: (eventId: string) => void;
  onNavigateToModule2?: () => void;
  onNavigateToModule4?: () => void;
}

export const RealTimeEventIntelligence: React.FC<RealTimeEventIntelligenceProps> = ({
  onSelectEvent,
  onNavigateToModule2,
  onNavigateToModule4,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredEvents = DEFAULT_EVENT_INTELLIGENCE.filter((e) => {
    if (selectedCategory === 'ALL') return true;
    return e.hazardCategory === selectedCategory;
  });

  const getStatusBadge = (status: WeatherEventItem['status']) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            VERIFIED
          </span>
        );
      case 'ACTION_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            ACTION REQUIRED
          </span>
        );
      case 'PROVISIONAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3 text-amber-400" />
            PROVISIONAL
          </span>
        );
      case 'DISPUTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">
            DISPUTED
          </span>
        );
    }
  };

  const getHazardIcon = (cat: WeatherEventItem['hazardCategory']) => {
    switch (cat) {
      case 'FLOOD':
        return <CloudRain className="w-4 h-4 text-blue-400" />;
      case 'RAIN':
        return <CloudRain className="w-4 h-4 text-cyan-400" />;
      case 'STORM':
        return <Zap className="w-4 h-4 text-purple-400" />;
      case 'HEAT':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'WIND':
        return <Radio className="w-4 h-4 text-teal-400" />;
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-750 backdrop-blur-md p-5 shadow-2xl">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
              REAL-TIME EVENT INTELLIGENCE
            </h3>
            <p className="text-[11px] text-slate-400">
              Correlated multi-source meteorological incidents ready for operational assessment
            </p>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Incidents
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('FLOOD')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedCategory === 'FLOOD'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Inundation & Floods
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('RAIN')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedCategory === 'RAIN'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Heavy Rainfall
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('STORM')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedCategory === 'STORM'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Thunderstorms
          </button>
        </div>
      </div>

      {/* Horizontal Cards List */}
      <div className="space-y-3">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="group p-4 rounded-xl bg-slate-950/70 hover:bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all duration-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            {/* Left: Icon, Title, Location, Summary */}
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 shrink-0 mt-0.5 group-hover:border-cyan-500/30 transition-colors">
                {getHazardIcon(evt.hazardCategory)}
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-bold text-white text-xs sm:text-sm tracking-tight truncate">
                    {evt.eventType} — <span className="text-cyan-300 font-semibold">{evt.location}</span>
                  </h4>
                  {getStatusBadge(evt.status)}
                </div>

                <p className="text-xs text-slate-300/90 line-clamp-1">
                  {evt.summary}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {evt.timeIST}
                  </span>
                  <span>•</span>
                  <span>
                    Sources: <strong className="text-white">{evt.sourcesCount}</strong> correlated
                  </span>
                  <span>•</span>
                  <span>{evt.keyMetric}</span>
                </div>
              </div>
            </div>

            {/* Right: Confidence Score Badge & Action Button */}
            <div className="flex items-center gap-4 shrink-0 border-t lg:border-t-0 border-slate-800/80 pt-2 lg:pt-0 justify-between lg:justify-end">
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Confidence</div>
                  <div className="text-sm font-bold font-mono text-emerald-400">{evt.confidenceScore}%</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-xs text-emerald-300 font-mono">
                  {evt.confidenceScore}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {onSelectEvent && (
                  <button
                    type="button"
                    onClick={() => onSelectEvent(evt.id)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <span>Audit Evidence</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
