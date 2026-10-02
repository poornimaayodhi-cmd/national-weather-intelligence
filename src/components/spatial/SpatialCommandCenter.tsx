import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Activity,
  Layers,
  Radio,
  ExternalLink,
  ChevronRight,
  Info,
  Clock,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import {
  SpatialAtmosphericCanvas,
  SpatialEventNode,
  GlobeViewMode,
  SPATIAL_EVENT_NODES,
} from './SpatialAtmosphericCanvas.tsx';
import { SpatialLayerSelector, SPATIAL_LAYERS } from './SpatialLayerSelector.tsx';
import { RadialThreatIndicator } from './RadialThreatIndicator.tsx';
import { SourceCorrelationStream } from './SourceCorrelationStream.tsx';
import { CircularRadar3D } from './CircularRadar3D.tsx';
import { EventIntelligenceDossier } from './EventIntelligenceDossier.tsx';
import {
  WeatherTimelineSlider,
  TimelinePoint,
  TIMELINE_OPTIONS,
} from './WeatherTimelineSlider.tsx';
import { IndiaStateRegion } from './stateGeometries.ts';
import { IngestionStats } from '../../types.ts';
import { FocusTargetCoords } from './SpatialAtmosphericCanvas.tsx';

interface SpatialCommandCenterProps {
  stats: IngestionStats | null;
  onExploreLiveWeather: () => void;
  onNavigateToModule1: () => void;
  onNavigateToModule2: () => void;
  onNavigateToModule3: () => void;
  onNavigateToModule4: (eventId?: string) => void;
  onAskBot: (query: string) => void;
  onOpenCopilot?: () => void;
  onOpenAlerts?: () => void;
  onOpenEventsDirectory?: () => void;
  focusTarget?: FocusTargetCoords | null;
}

export const SpatialCommandCenter: React.FC<SpatialCommandCenterProps> = ({
  stats,
  onExploreLiveWeather,
  onNavigateToModule1,
  onNavigateToModule2,
  onNavigateToModule3,
  onNavigateToModule4,
  onAskBot,
  onOpenCopilot,
  onOpenAlerts,
  onOpenEventsDirectory,
  focusTarget,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<SpatialEventNode | null>(null);
  const [activeLayer, setActiveLayer] = useState<string>('ALL');
  const [timelinePoint, setTimelinePoint] = useState<TimelinePoint>('NOW');
  const [viewMode, setViewMode] = useState<GlobeViewMode>('RADAR');
  const [selectedState, setSelectedState] = useState<IndiaStateRegion | null>(null);

  // Derive dynamic metrics based on timeline selection
  const activeTimelineOption =
    TIMELINE_OPTIONS.find((t) => t.key === timelinePoint) || TIMELINE_OPTIONS[0];

  const totalEvents = activeTimelineOption.activeEventsCount;
  const verifiedCount = Math.round(totalEvents * 0.74);
  const highRiskCount = activeTimelineOption.threatLevel === 'SEVERE' ? 17 : 9;
  const avgConfidence = 89;

  return (
    <div className="space-y-8 relative z-10 pb-16">
      {/* ========================================================================= */}
      {/* LIVE OPERATIONAL SYSTEM STATUS STRIP (Requirement 15)                     */}
      {/* ========================================================================= */}
      <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/85 border border-cyan-500/25 backdrop-blur-md shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <strong className="text-white tracking-wider">SYSTEM ONLINE</strong>
          </div>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-slate-300">
            DATA STREAMS: <strong className="text-cyan-300 font-bold">24</strong>
          </span>
          <span className="text-slate-600 hidden md:inline">•</span>
          <span className="text-slate-300 hidden md:inline">
            LAST SYNC: <strong className="text-white">21:42:08 IST</strong>
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-slate-400 hidden lg:inline">
            LATENCY: <strong className="text-emerald-400">14ms</strong>
          </span>
          <span className="text-slate-600 hidden lg:inline">•</span>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              LIVE
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              SYNCED
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700/60 font-bold hidden sm:inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              VERIFIED
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO EXPERIENCE: 3D EARTH / INDIA SPATIAL STAGE                        */}
      {/* ========================================================================= */}
      <section className="relative rounded-3xl bg-[#020612]/95 border border-cyan-500/25 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Subtle Cyber Grid Coordinates Overlay in Canvas Border */}
        <div className="absolute top-3 left-4 z-20 pointer-events-none">
          <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>NATIONAL WEATHER INTELLIGENCE ENGINE • 3D SPATIAL ORBIT</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
            POLAR ORBIT: INDIA 21°N, 78°E • TIME OFFSET: {timelinePoint}
          </div>
        </div>

        {/* 3D Earth / India Atmospheric Canvas with Interactive Modes */}
        <SpatialAtmosphericCanvas
          onSelectEvent={(evt) => setSelectedEvent(evt)}
          selectedEventId={selectedEvent?.id}
          activeLayerFilter={activeLayer}
          timeOffset={timelinePoint}
          viewMode={viewMode}
          onViewModeChange={(m) => setViewMode(m)}
          onStateSelect={(st) => setSelectedState(st)}
          focusTarget={focusTarget}
        />

        {/* Floating Spatial Left Overlay: Minimal Hero Title & Spatial Layers */}
        <div className="absolute top-14 left-4 sm:left-6 z-20 max-w-sm sm:max-w-md pointer-events-none">
          <div className="pointer-events-auto space-y-3.5">
            {/* Clean, Bold, Minimal Title per Prompt */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-none uppercase">
                NATIONAL WEATHER
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 mt-1">
                  INTELLIGENCE
                </span>
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-300 font-mono mt-1.5 tracking-wide">
                LIVE / INDIA / {activeTimelineOption.timeIST} • SOURCE_COUNT: 24 • CONFIDENCE: 91.4%
              </p>
            </div>

            {/* Spatial Layers Floating Stack */}
            <SpatialLayerSelector
              activeLayer={activeLayer}
              onSelectLayer={(layerId) => setActiveLayer(layerId)}
            />
          </div>
        </div>

        {/* Interactive Layer Detail Banner when a Layer is selected */}
        {activeLayer !== 'ALL' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 max-w-lg w-auto p-2 px-3 rounded-xl bg-slate-950/90 border border-cyan-400/50 backdrop-blur-md shadow-xl text-xs text-white flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-mono text-cyan-300 font-bold uppercase text-[10.5px]">
                {activeLayer === 'LAYER_01'
                  ? 'LAYER 01: SURFACE AWS TELEMETRY & DOPPLER ISOBAR VECTORS (550+ STATIONS)'
                  : activeLayer === 'LAYER_02'
                  ? 'LAYER 02: MULTI-SOURCE INGESTION (128 ACTIVE FEEDS • 24 AGENCIES)'
                  : activeLayer === 'LAYER_03'
                  ? 'LAYER 03: SPATIO-TEMPORAL CLUSTERING & EVIDENCE CORRELATION (≤15km, Δt ≤60m)'
                  : activeLayer === 'LAYER_04'
                  ? 'LAYER 04: AI CROSS-SOURCE CORROBORATION & CONFLICT RESOLUTION (91.4% THRESHOLD)'
                  : activeLayer === 'LAYER_05'
                  ? 'LAYER 05: NDMA/SDMA ALGORITHMIC THREAT DISPATCH & DANGER ZONES'
                  : `FILTER ACTIVE: ${activeLayer}`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveLayer('ALL')}
              className="text-[10.5px] font-mono text-slate-400 hover:text-white underline cursor-pointer ml-2"
            >
              Reset
            </button>
          </div>
        )}

        {/* State Selected Detail Card Overlay */}
        {selectedState && (
          <div className="absolute bottom-5 left-4 sm:left-6 z-20 p-3.5 rounded-2xl bg-slate-950/95 border border-cyan-500/40 backdrop-blur-md shadow-2xl text-xs text-slate-200 max-w-xs animate-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
              <div>
                <span className="text-[9.5px] font-mono text-cyan-400 font-bold uppercase">STATE TELEMETRY FOCUS</span>
                <h4 className="font-bold text-white text-sm">{selectedState.name}</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedState(null)}
                className="text-slate-400 hover:text-white p-1 text-xs"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1 font-mono text-[11px] mb-2.5">
              <div className="flex justify-between">
                <span className="text-slate-400">ACTIVE EVENTS:</span>
                <span className="font-bold text-white">{selectedState.activeEvents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">VERIFIED:</span>
                <span className="font-bold text-emerald-400">{selectedState.verified}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">HIGH RISK:</span>
                <span className="font-bold text-rose-400">{selectedState.highRisk}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">AVG CONFIDENCE:</span>
                <span className="font-bold text-cyan-300">{selectedState.avgConfidence}%</span>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-850">
                DOMINANT: <strong className="text-white">{selectedState.dominantEvent}</strong>
              </div>
            </div>
            <button
              type="button"
              onClick={onExploreLiveWeather}
              className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-[10.5px] font-bold uppercase transition-colors cursor-pointer text-center"
            >
              Inspect State Stations
            </button>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 2. WEATHER TIMELINE REPLAY SLIDER (Requirement 09)                        */}
      {/* ========================================================================= */}
      <section>
        <WeatherTimelineSlider
          currentPoint={timelinePoint}
          onChangePoint={(pt) => setTimelinePoint(pt)}
        />
      </section>

      {/* ========================================================================= */}
      {/* 3. FLOATING INTELLIGENCE INDICATORS                                       */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div
          onClick={onNavigateToModule1}
          className="group p-4 sm:p-5 rounded-2xl bg-slate-950/80 hover:bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 backdrop-blur-md shadow-xl transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-cyan-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              01 • STREAM
            </span>
            <Activity className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
            {totalEvents}
          </div>
          <div className="text-[11px] font-bold font-mono text-slate-200 uppercase tracking-wider mt-1">
            ACTIVE EVENTS
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            +14 IN LAST 60 MIN • ● LIVE
          </div>
        </div>

        {/* Metric 2 */}
        <div
          onClick={onNavigateToModule2}
          className="group p-4 sm:p-5 rounded-2xl bg-slate-950/80 hover:bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 backdrop-blur-md shadow-xl transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              02 • AUDIT
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-300 tracking-tight">
            {verifiedCount}
          </div>
          <div className="text-[11px] font-bold font-mono text-slate-200 uppercase tracking-wider mt-1">
            VERIFIED INCIDENTS
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            92% CROSS-SOURCE MATCH • ● SYNCED
          </div>
        </div>

        {/* Metric 3 */}
        <div
          onClick={() => onNavigateToModule4()}
          className="group p-4 sm:p-5 rounded-2xl bg-slate-950/80 hover:bg-slate-900/90 border border-slate-800 hover:border-rose-500/40 backdrop-blur-md shadow-xl transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-rose-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              03 • ALERT
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono text-rose-400 tracking-tight">
            {highRiskCount}
          </div>
          <div className="text-[11px] font-bold font-mono text-slate-200 uppercase tracking-wider mt-1">
            HIGH RISK INCIDENTS
          </div>
          <div className="text-[10px] text-rose-300/80 font-mono mt-0.5">
            URGENT ESCALATION REQUIRED • ● PROCESSING
          </div>
        </div>

        {/* Metric 4 */}
        <div
          onClick={onNavigateToModule3}
          className="group p-4 sm:p-5 rounded-2xl bg-slate-950/80 hover:bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 backdrop-blur-md shadow-xl transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-purple-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              04 • CONFIDENCE
            </span>
            <Sparkles className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono text-purple-300 tracking-tight">
            {avgConfidence}%
          </div>
          <div className="text-[11px] font-bold font-mono text-slate-200 uppercase tracking-wider mt-1">
            AVG CONFIDENCE SCORE
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            9-FACTOR MATHEMATICAL AUDIT • ● VERIFIED
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. MULTI-SOURCE CORRELATION STREAM (SIGNATURE VISUAL ELEMENT)              */}
      {/* ========================================================================= */}
      <section>
        <SourceCorrelationStream />
      </section>

      {/* ========================================================================= */}
      {/* 5. RADIAL THREAT INDICATOR & 3D DOPPLER RADAR GRID                        */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Radial Threat Gauge (5 Cols) */}
        <div className="lg:col-span-5">
          <RadialThreatIndicator
            onOpenDecisionPanel={() => onNavigateToModule4()}
          />
        </div>

        {/* 3D Circular Radar Scope (7 Cols) */}
        <div className="lg:col-span-7">
          <CircularRadar3D
            onSelectTarget={(tgt) => {
              const matched = SPATIAL_EVENT_NODES.find((n) =>
                n.city.includes(tgt.city.split(' ')[0])
              );
              if (matched) setSelectedEvent(matched);
            }}
          />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. EVENT INTELLIGENCE DOSSIER SIDE SLIDE-OVER                              */}
      {/* ========================================================================= */}
      <EventIntelligenceDossier
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onNavigateToModule4={(eventId) => onNavigateToModule4(eventId)}
        onAskBot={(q) => onAskBot(q)}
      />
    </div>
  );
};
