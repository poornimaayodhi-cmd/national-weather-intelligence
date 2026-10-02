import React, { useState } from 'react';
import {
  Layers,
  CloudRain,
  Flame,
  AlertTriangle,
  Zap,
  ShieldCheck,
  Eye,
  Radio,
  Navigation,
  ExternalLink,
  ChevronRight,
  Maximize2,
} from 'lucide-react';

export interface MapEventMarker {
  id: string;
  title: string;
  category: 'RAINFALL' | 'HEATWAVE' | 'SEVERE' | 'THUNDERSTORM' | 'VERIFIED';
  location: string;
  state: string;
  x: number; // percentage coordinates on India map SVG (0 to 100)
  y: number;
  rainfall_mm?: number;
  temperature_c?: number;
  wind_kmh?: number;
  confidence: number;
  sources_count: number;
  status: 'VERIFIED' | 'MONITORING' | 'ACTION_REQUIRED';
  timestamp: string;
  description: string;
}

const SAMPLE_MAP_MARKERS: MapEventMarker[] = [
  {
    id: 'EVT-CHE-2026-001',
    title: 'Severe Flash Inundation — Maraimalai Adigal Bridge',
    category: 'SEVERE',
    location: 'Chennai (Saidapet)',
    state: 'Tamil Nadu',
    x: 58,
    y: 77,
    rainfall_mm: 124.5,
    temperature_c: 28.5,
    wind_kmh: 42,
    confidence: 92,
    sources_count: 7,
    status: 'ACTION_REQUIRED',
    timestamp: '10 mins ago',
    description: '4.2ft waterlogged under subway, Adyar river gauge 1.1m above danger mark. NDRF dispatched.',
  },
  {
    id: 'EVT-CHE-2026-002',
    title: 'Active Monsoon Convective Rain Band',
    category: 'RAINFALL',
    location: 'Chennai (Meenambakkam)',
    state: 'Tamil Nadu',
    x: 60,
    y: 80,
    rainfall_mm: 88.0,
    temperature_c: 27.2,
    wind_kmh: 36,
    confidence: 96,
    sources_count: 5,
    status: 'VERIFIED',
    timestamp: '18 mins ago',
    description: 'Continuous torrential showers recorded by IMD dual-frequency radar and ground tipping bucket.',
  },
  {
    id: 'EVT-MUM-2026-003',
    title: 'Coastal Squall & High Sea Swells',
    category: 'THUNDERSTORM',
    location: 'Mumbai (Colaba)',
    state: 'Maharashtra',
    x: 32,
    y: 56,
    rainfall_mm: 45.2,
    temperature_c: 29.8,
    wind_kmh: 58,
    confidence: 88,
    sources_count: 8,
    status: 'VERIFIED',
    timestamp: '25 mins ago',
    description: 'Gusty squall line detected over Arabian Sea approach with 3.5m wave height bulletin.',
  },
  {
    id: 'EVT-DEL-2026-004',
    title: 'Surface Temperature & Particulate Inversion',
    category: 'VERIFIED',
    location: 'New Delhi (Safdarjung)',
    state: 'Delhi (NCT)',
    x: 42,
    y: 28,
    temperature_c: 33.6,
    wind_kmh: 12,
    confidence: 98,
    sources_count: 14,
    status: 'VERIFIED',
    timestamp: '5 mins ago',
    description: 'Safdarjung Observatory baseline verified; relative humidity 54%, barometric pressure 1012 hPa.',
  },
  {
    id: 'EVT-RAJ-2026-005',
    title: 'Dry Thermal Heat Surge',
    category: 'HEATWAVE',
    location: 'Jodhpur / Barmer',
    state: 'Rajasthan',
    x: 28,
    y: 35,
    temperature_c: 42.4,
    wind_kmh: 18,
    confidence: 89,
    sources_count: 6,
    status: 'MONITORING',
    timestamp: '40 mins ago',
    description: 'Extreme daytime radiative heating; IMD yellow alert active for western desert districts.',
  },
  {
    id: 'EVT-ODI-2026-006',
    title: 'Coastal Thunderstorm & Cloud-to-Ground Lightning',
    category: 'THUNDERSTORM',
    location: 'Balasore / Paradip',
    state: 'Odisha',
    x: 69,
    y: 51,
    rainfall_mm: 62.0,
    temperature_c: 28.0,
    wind_kmh: 50,
    confidence: 91,
    sources_count: 9,
    status: 'VERIFIED',
    timestamp: '32 mins ago',
    description: 'Intense mesoscale convective cluster advancing inland from north-west Bay of Bengal.',
  },
  {
    id: 'EVT-ASM-2026-007',
    title: 'Brahmaputra Basin Riverine Flood Watch',
    category: 'RAINFALL',
    location: 'Guwahati',
    state: 'Assam',
    x: 84,
    y: 36,
    rainfall_mm: 74.0,
    temperature_c: 26.5,
    wind_kmh: 22,
    confidence: 87,
    sources_count: 11,
    status: 'MONITORING',
    timestamp: '1 hour ago',
    description: 'Catchment precipitation exceeding 70mm in upper Arunachal foothills; CWC water gauges normal to high.',
  },
  {
    id: 'EVT-BLR-2026-008',
    title: 'Urban Convective Showers',
    category: 'VERIFIED',
    location: 'Bengaluru (Central)',
    state: 'Karnataka',
    x: 48,
    y: 74,
    rainfall_mm: 31.0,
    temperature_c: 24.2,
    wind_kmh: 20,
    confidence: 94,
    sources_count: 6,
    status: 'VERIFIED',
    timestamp: '15 mins ago',
    description: 'Post-afternoon thermodynamic convection across Koramangala and Bellandur catchment basins.',
  },
];

interface NationalWeatherMapProps {
  onSelectEvent?: (eventId: string) => void;
  onViewLiveTelemetry?: () => void;
}

export const NationalWeatherMap: React.FC<NationalWeatherMapProps> = ({
  onSelectEvent,
  onViewLiveTelemetry,
}) => {
  const [selectedMarker, setSelectedMarker] = useState<MapEventMarker | null>(SAMPLE_MAP_MARKERS[0]);
  const [activeLayer, setActiveLayer] = useState<'ALL' | 'RAINFALL' | 'SEVERE' | 'THUNDERSTORM'>('ALL');
  const [showRadarSweep, setShowRadarSweep] = useState(true);

  const filteredMarkers = SAMPLE_MAP_MARKERS.filter((m) => {
    if (activeLayer === 'ALL') return true;
    return m.category === activeLayer;
  });

  const getMarkerBadgeColor = (category: MapEventMarker['category']) => {
    switch (category) {
      case 'RAINFALL':
        return 'bg-blue-500 text-white border-blue-400 ring-blue-500/30';
      case 'HEATWAVE':
        return 'bg-amber-500 text-white border-amber-400 ring-amber-500/30';
      case 'SEVERE':
        return 'bg-rose-600 text-white border-rose-400 ring-rose-500/40 animate-pulse';
      case 'THUNDERSTORM':
        return 'bg-purple-600 text-white border-purple-400 ring-purple-500/30';
      case 'VERIFIED':
        return 'bg-emerald-500 text-white border-emerald-400 ring-emerald-500/30';
    }
  };

  const getCategoryIcon = (category: MapEventMarker['category']) => {
    switch (category) {
      case 'RAINFALL':
        return <CloudRain className="w-3 h-3" />;
      case 'HEATWAVE':
        return <Flame className="w-3 h-3" />;
      case 'SEVERE':
        return <AlertTriangle className="w-3 h-3" />;
      case 'THUNDERSTORM':
        return <Zap className="w-3 h-3" />;
      case 'VERIFIED':
        return <ShieldCheck className="w-3 h-3" />;
    }
  };

  return (
    <div className="relative rounded-2xl bg-slate-900/60 border border-slate-750 backdrop-blur-md overflow-hidden shadow-2xl flex flex-col">
      {/* Map Card Header Strip */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <span>NATIONAL GEOSPATIAL WEATHER INTELLIGENCE</span>
            <span className="text-[10px] font-mono text-cyan-400 font-normal px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 hidden sm:inline">
              LIVE RADAR & AWS GRID
            </span>
          </h3>
        </div>

        {/* Layer Filters */}
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveLayer('ALL')}
            className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
              activeLayer === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Layers
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('SEVERE')}
            className={`px-2.5 py-1 rounded-md transition-colors font-medium flex items-center gap-1 ${
              activeLayer === 'SEVERE'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-rose-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            Severe
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('RAINFALL')}
            className={`px-2.5 py-1 rounded-md transition-colors font-medium flex items-center gap-1 ${
              activeLayer === 'RAINFALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-blue-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            Rainfall
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('THUNDERSTORM')}
            className={`px-2.5 py-1 rounded-md transition-colors font-medium flex items-center gap-1 ${
              activeLayer === 'THUNDERSTORM'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-purple-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            Storms
          </button>
        </div>
      </div>

      {/* Main Map View Area */}
      <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[520px] bg-[#050C1B] overflow-hidden flex items-center justify-center select-none">
        {/* Radar Range Rings Grid */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[300px] h-[300px] rounded-full border border-cyan-500/40" />
          <div className="absolute w-[500px] h-[500px] rounded-full border border-cyan-500/30 border-dashed" />
          <div className="absolute w-[700px] h-[700px] rounded-full border border-cyan-500/20" />
          <div className="absolute w-full h-[1px] bg-cyan-500/20" />
          <div className="absolute h-full w-[1px] bg-cyan-500/20" />
        </div>

        {/* Animated Radar Sweep Beam */}
        {showRadarSweep && (
          <div className="absolute w-[600px] h-[600px] pointer-events-none rounded-full origin-center animate-[spin_10s_linear_infinite] opacity-35 bg-[conic-gradient(from_0deg,transparent_0deg,transparent_310deg,rgba(6,182,212,0.22)_350deg,rgba(56,189,248,0.45)_360deg)]" />
        )}

        {/* Detailed SVG Map of India Outline with Maritime Basins */}
        <svg
          viewBox="0 0 800 850"
          className="w-full h-full max-w-[620px] max-h-[500px] filter drop-shadow-[0_0_25px_rgba(6,182,212,0.15)]"
        >
          {/* Atmospheric pressure contours / isobars */}
          <path
            d="M 180,420 Q 320,490 560,430 T 740,510"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="0.8"
            strokeDasharray="4,6"
            opacity="0.3"
          />
          <path
            d="M 220,540 Q 380,590 540,560 T 680,630"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="0.8"
            strokeDasharray="3,5"
            opacity="0.25"
          />

          {/* India Boundary Polygonal Representation */}
          <path
            d="M 330,80
               C 350,90 380,95 400,105
               C 420,115 445,140 435,160
               C 425,180 460,200 480,210
               C 505,225 540,240 590,230
               C 620,225 650,230 670,245
               C 690,260 705,275 695,295
               C 685,315 650,330 625,320
               C 600,310 575,320 560,340
               C 545,360 525,370 515,390
               C 505,410 535,430 550,460
               C 565,490 560,520 545,550
               C 530,580 500,620 480,660
               C 460,700 440,735 430,760
               C 420,775 410,770 405,750
               C 400,720 380,680 365,640
               C 350,600 325,560 310,520
               C 295,480 270,450 250,430
               C 230,410 220,380 230,350
               C 240,320 270,300 290,270
               C 310,240 315,200 320,160
               Z"
            fill="#091830"
            stroke="#1E4976"
            strokeWidth="1.8"
            className="transition-colors hover:stroke-cyan-500/60"
          />

          {/* Coastal Internal Terrain Shading */}
          <path
            d="M 330,80
               C 350,90 380,95 400,105
               C 420,115 445,140 435,160
               C 425,180 460,200 480,210
               L 470,250 L 400,320 L 370,420 L 380,600 L 420,750
               Z"
            fill="#0B203E"
            opacity="0.3"
          />

          {/* Sri Lanka Silhouette */}
          <path
            d="M 445,770 C 455,775 460,790 455,805 C 450,815 440,810 435,795 Z"
            fill="#0A182E"
            stroke="#1E4976"
            strokeWidth="1.2"
          />

          {/* Water Bodies Labels */}
          <text x="130" y="580" fill="#38BDF8" opacity="0.3" fontSize="12" letterSpacing="3" fontFamily="monospace">
            ARABIAN SEA
          </text>
          <text x="590" y="580" fill="#38BDF8" opacity="0.3" fontSize="12" letterSpacing="3" fontFamily="monospace">
            BAY OF BENGAL
          </text>
          <text x="360" y="820" fill="#38BDF8" opacity="0.3" fontSize="11" letterSpacing="2" fontFamily="monospace">
            INDIAN OCEAN
          </text>

          {/* Meteorological Stations Grid Points */}
          <circle cx="430" cy="760" r="3" fill="#06B6D4" opacity="0.8" />
          <circle cx="330" cy="560" r="2.5" fill="#06B6D4" opacity="0.6" />
          <circle cx="380" cy="220" r="2.5" fill="#06B6D4" opacity="0.6" />
          <circle cx="560" cy="380" r="2.5" fill="#06B6D4" opacity="0.6" />
        </svg>

        {/* Dynamic Interactive Event Markers Layer */}
        <div className="absolute inset-0 pointer-events-auto">
          {filteredMarkers.map((marker) => {
            const isSelected = selectedMarker?.id === marker.id;
            return (
              <div
                key={marker.id}
                style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                onClick={() => setSelectedMarker(marker)}
              >
                {/* Outer Glow Halo */}
                <div
                  className={`w-7 h-7 -top-1 -left-1 absolute rounded-full opacity-60 animate-ping ${
                    marker.category === 'SEVERE'
                      ? 'bg-rose-500'
                      : marker.category === 'RAINFALL'
                      ? 'bg-blue-400'
                      : marker.category === 'THUNDERSTORM'
                      ? 'bg-purple-500'
                      : 'bg-emerald-400'
                  }`}
                />

                {/* Core Marker Pin */}
                <div
                  className={`relative flex items-center justify-center w-6 h-6 rounded-full border shadow-lg ring-2 transition-transform duration-200 group-hover:scale-125 ${
                    isSelected ? 'scale-125 ring-white' : ''
                  } ${getMarkerBadgeColor(marker.category)}`}
                  title={`${marker.title} (${marker.location})`}
                >
                  {getCategoryIcon(marker.category)}
                </div>

                {/* Small City Name Label */}
                <span className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9.5px] font-semibold text-slate-200 bg-slate-950/85 px-1.5 py-0.2 rounded border border-slate-800 shadow-md pointer-events-none group-hover:text-white group-hover:border-cyan-500/40 transition-colors">
                  {marker.location.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected Event Popup Card Overlay */}
        {selectedMarker && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-96 p-3.5 rounded-xl bg-slate-950/95 border border-cyan-500/30 backdrop-blur-md shadow-2xl text-xs text-slate-200 animate-in fade-in slide-in-from-bottom-2 z-20">
            <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider ${
                      selectedMarker.category === 'SEVERE'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : selectedMarker.category === 'RAINFALL'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    }`}
                  >
                    {getCategoryIcon(selectedMarker.category)}
                    {selectedMarker.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">• {selectedMarker.timestamp}</span>
                </div>
                <h4 className="font-bold text-white text-xs leading-snug">{selectedMarker.title}</h4>
                <p className="text-[11px] text-cyan-300 font-medium">{selectedMarker.location}, {selectedMarker.state}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMarker(null)}
                className="text-slate-500 hover:text-slate-300 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
              {selectedMarker.description}
            </p>

            {/* Telemetry Metrics Grid */}
            <div className="grid grid-cols-3 gap-1.5 mb-3 text-center">
              {selectedMarker.rainfall_mm !== undefined && (
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[9.5px] text-slate-400">Rainfall</div>
                  <div className="font-mono font-bold text-cyan-300 text-xs">{selectedMarker.rainfall_mm} mm</div>
                </div>
              )}
              {selectedMarker.temperature_c !== undefined && (
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[9.5px] text-slate-400">Temp</div>
                  <div className="font-mono font-bold text-amber-300 text-xs">{selectedMarker.temperature_c}°C</div>
                </div>
              )}
              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[9.5px] text-slate-400">Confidence</div>
                <div className="font-mono font-bold text-emerald-400 text-xs">{selectedMarker.confidence}%</div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400">
                Correlated from <strong className="text-white">{selectedMarker.sources_count}</strong> sources
              </span>
              <div className="flex items-center gap-1.5">
                {onSelectEvent && (
                  <button
                    type="button"
                    onClick={() => onSelectEvent(selectedMarker.id)}
                    className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[10.5px] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>Inspect Event</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Radar sweep toggle in bottom-right corner */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          <button
            type="button"
            onClick={() => setShowRadarSweep(!showRadarSweep)}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono border transition-colors flex items-center gap-1 ${
              showRadarSweep
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60'
                : 'bg-slate-900/80 text-slate-400 border-slate-800'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>Radar Sweep {showRadarSweep ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Map Legend Strip */}
      <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300">
          <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">Legend:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-xs shadow-blue-500/50" />
            <span>Rainfall</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs shadow-amber-500/50" />
            <span>Heatwave</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shadow-xs shadow-rose-600/50" />
            <span>Severe Inundation</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shadow-xs shadow-purple-600/50" />
            <span>Thunderstorm</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
            <span>Verified Station</span>
          </span>
        </div>

        <div className="text-[10px] text-slate-500 font-mono hidden md:inline">
          ISRO INSAT-3DR / DWR IMD Ground Radars Active
        </div>
      </div>
    </div>
  );
};
