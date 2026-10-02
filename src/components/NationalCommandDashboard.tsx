import React, { useRef } from 'react';
import {
  CloudRain,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Radio,
  Zap,
  Globe,
  Database,
  Share2,
  Users,
  Compass,
} from 'lucide-react';
import { NationalWeatherMap } from './NationalWeatherMap.tsx';
import { MultiSourceCorrelationFlow } from './MultiSourceCorrelationFlow.tsx';
import { NationalThreatAndConfidencePanel } from './NationalThreatAndConfidencePanel.tsx';
import { RealTimeEventIntelligence } from './RealTimeEventIntelligence.tsx';
import { IngestionStats } from '../types.ts';

interface NationalCommandDashboardProps {
  stats: IngestionStats | null;
  onExploreLiveWeather: () => void;
  onSelectEvent: (eventId: string) => void;
  onNavigateToModule1: () => void;
  onNavigateToModule2: () => void;
  onNavigateToModule3: () => void;
  onNavigateToModule4: () => void;
}

export const NationalCommandDashboard: React.FC<NationalCommandDashboardProps> = ({
  stats,
  onExploreLiveWeather,
  onSelectEvent,
  onNavigateToModule1,
  onNavigateToModule2,
  onNavigateToModule3,
  onNavigateToModule4,
}) => {
  const eventsSectionRef = useRef<HTMLDivElement>(null);
  const mapSectionRef = useRef<HTMLDivElement>(null);

  const scrollToEvents = () => {
    eventsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMap = () => {
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Live counts calculated or defaulted gracefully
  const totalReportsCount = stats?.total_reports ?? 128;
  const verifiedCount = 94;
  const highRiskCount = 17;
  const avgConfidence = 89;

  return (
    <div className="space-y-8 relative z-10">
      {/* ========================================================================= */}
      {/* 1. HERO / HEADER AREA                                                     */}
      {/* ========================================================================= */}
      <section className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-cyan-500/20 backdrop-blur-xl p-6 sm:p-8 lg:p-10 shadow-2xl overflow-hidden">
        {/* Subtle Ambient Decorative India Silhouette & Radar Contours in Hero */}
        <div className="absolute top-0 right-0 w-full sm:w-2/3 h-full pointer-events-none opacity-20 overflow-hidden">
          <svg
            className="w-full h-full"
            viewBox="0 0 600 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Concentric radar range circles */}
            <circle cx="450" cy="200" r="80" stroke="#06B6D4" strokeWidth="1" strokeDasharray="3,6" />
            <circle cx="450" cy="200" r="160" stroke="#06B6D4" strokeWidth="0.8" strokeDasharray="4,8" />
            <circle cx="450" cy="200" r="240" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="6,12" />
            {/* Latitude / longitude gridlines */}
            <line x1="100" y1="200" x2="600" y2="200" stroke="#0ea5e9" strokeWidth="0.8" strokeDasharray="2,4" />
            <line x1="450" y1="0" x2="450" y2="400" stroke="#0ea5e9" strokeWidth="0.8" strokeDasharray="2,4" />
            {/* Atmospheric particles */}
            <circle cx="380" cy="140" r="2.5" fill="#38BDF8" className="animate-ping" />
            <circle cx="480" cy="220" r="2" fill="#22D3EE" />
            <circle cx="430" cy="260" r="2" fill="#06B6D4" />
            <circle cx="510" cy="180" r="3" fill="#0EA5E9" />
          </svg>
        </div>

        {/* Hero Content */}
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold mb-4 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="tracking-wider uppercase font-mono text-[11px]">
              NATIONAL BIG DATA ANALYTICS COMMAND
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] mb-4">
            NATIONAL WEATHER{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400">
              INTELLIGENCE PLATFORM
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed font-normal max-w-2xl mb-7">
            Real-time multi-source weather intelligence for faster verification, situational awareness and decision support. Fusing Doppler radar telemetry, crowd spotters, social media dispatches, and sensory streams into explainable operational events.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onExploreLiveWeather}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-cyan-900/30 flex items-center gap-2 transition-all duration-200 cursor-pointer active:scale-95"
            >
              <span>EXPLORE LIVE WEATHER</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={scrollToEvents}
              className="px-5 py-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-750 font-semibold text-xs sm:text-sm tracking-wide transition-colors cursor-pointer"
            >
              VIEW EVENTS
            </button>

            <button
              type="button"
              onClick={scrollToMap}
              className="px-4 py-3 rounded-xl text-cyan-400 hover:text-cyan-300 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Interactive Map</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. LIVE DATA SOURCES STRIP                                                */}
      {/* ========================================================================= */}
      <section className="rounded-xl bg-slate-900/50 border border-slate-800/80 px-4 py-2.5 backdrop-blur-sm shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            LIVE DATA SOURCES:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 font-mono text-[11px]">
          <span className="inline-flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>IMD AWS</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="inline-flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>SOCIAL MEDIA</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="inline-flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span>CITIZEN SPOTTERS</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="inline-flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>GLOBAL APIS</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="inline-flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span>DATASETS</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="inline-flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>RIVER SENSORS</span>
          </span>
        </div>

        <div className="text-[10px] text-cyan-400 font-mono hidden xl:inline">
          LATENCY: 14ms • TELEMETRY SYNCED
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. LIVE WEATHER INTELLIGENCE METRIC CARDS                                 */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: LIVE EVENTS */}
        <div className="group p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-850/80 border border-slate-750 hover:border-cyan-500/40 backdrop-blur-md shadow-xl transition-all duration-200 cursor-pointer hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-[10.5px] font-mono font-semibold text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
              +14 Last Hour
            </span>
          </div>
          <div className="text-3xl font-black text-white font-mono tracking-tight mb-1">
            {totalReportsCount}
          </div>
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wide">
            LIVE EVENTS
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Active weather reports across all streams
          </div>
        </div>

        {/* Card 2: VERIFIED EVENTS */}
        <div className="group p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-850/80 border border-slate-750 hover:border-emerald-500/40 backdrop-blur-md shadow-xl transition-all duration-200 cursor-pointer hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-[10.5px] font-mono font-semibold text-emerald-300 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
              92% Accuracy
            </span>
          </div>
          <div className="text-3xl font-black text-white font-mono tracking-tight mb-1">
            {verifiedCount}
          </div>
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wide">
            VERIFIED EVENTS
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Cross-source corroborated incidents
          </div>
        </div>

        {/* Card 3: HIGH-RISK EVENTS */}
        <div className="group p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-850/80 border border-slate-750 hover:border-rose-500/40 backdrop-blur-md shadow-xl transition-all duration-200 cursor-pointer hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
            </div>
            <span className="text-[10.5px] font-mono font-semibold text-rose-300 px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/60">
              Active Alerts
            </span>
          </div>
          <div className="text-3xl font-black text-rose-300 font-mono tracking-tight mb-1">
            {highRiskCount}
          </div>
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wide">
            HIGH-RISK EVENTS
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Requiring urgent operational attention
          </div>
        </div>

        {/* Card 4: AVG CONFIDENCE */}
        <div className="group p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-850/80 border border-slate-750 hover:border-indigo-500/40 backdrop-blur-md shadow-xl transition-all duration-200 cursor-pointer hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-[10.5px] font-mono font-semibold text-indigo-300 px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/60">
              High Threshold
            </span>
          </div>
          <div className="text-3xl font-black text-cyan-300 font-mono tracking-tight mb-1">
            {avgConfidence}%
          </div>
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wide">
            AVG CONFIDENCE
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Evidence-based mathematical confidence
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. LIVE WEATHER GEOSPATIAL MAP SECTION                                    */}
      {/* ========================================================================= */}
      <section ref={mapSectionRef} className="scroll-mt-20">
        <NationalWeatherMap
          onSelectEvent={onSelectEvent}
          onViewLiveTelemetry={onExploreLiveWeather}
        />
      </section>

      {/* ========================================================================= */}
      {/* 5. NATIONAL WEATHER THREAT LEVEL & CONFIDENCE PANEL                       */}
      {/* ========================================================================= */}
      <section>
        <NationalThreatAndConfidencePanel
          onNavigateToDecision={onNavigateToModule4}
          onNavigateToVerification={onNavigateToModule3}
        />
      </section>

      {/* ========================================================================= */}
      {/* 6. MULTI-SOURCE CORRELATION CONNECTED-NODE FLOW                           */}
      {/* ========================================================================= */}
      <section>
        <MultiSourceCorrelationFlow />
      </section>

      {/* ========================================================================= */}
      {/* 7. REAL-TIME EVENT INTELLIGENCE HORIZONTAL CARDS                          */}
      {/* ========================================================================= */}
      <section ref={eventsSectionRef} className="scroll-mt-20">
        <RealTimeEventIntelligence
          onSelectEvent={onSelectEvent}
          onNavigateToModule2={onNavigateToModule2}
          onNavigateToModule4={onNavigateToModule4}
        />
      </section>
    </div>
  );
};
