import React, { useState } from 'react';
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
  CheckCircle2,
  Lock,
  ChevronRight,
  Eye,
  Shield,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { SpatialAtmosphericCanvas, SpatialEventNode, SPATIAL_EVENT_NODES } from '../spatial/SpatialAtmosphericCanvas.tsx';
import { SpatialLayerSelector } from '../spatial/SpatialLayerSelector.tsx';
import { EventIntelligenceDossier } from '../spatial/EventIntelligenceDossier.tsx';

interface LandingPageProps {
  onExplore: () => void;
  onOpenAuth: (mode: 'SIGN_IN' | 'SIGN_UP') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onExplore,
  onOpenAuth,
}) => {
  const [activeLayer, setActiveLayer] = useState<string>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<SpatialEventNode | null>(null);

  return (
    <div className="min-h-screen text-slate-100 relative overflow-x-hidden">
      {/* ========================================================================= */}
      {/* 1. TOP SYSTEM STATUS STRIP (Requirement 2)                                */}
      {/* ========================================================================= */}
      <div className="bg-[#020612]/90 border-b border-cyan-500/20 backdrop-blur-md px-3 sm:px-6 py-2 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SYSTEM ONLINE
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-300">
              <strong className="text-cyan-300">24</strong> DATA SOURCES
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-300">
              <strong className="text-white">128</strong> ACTIVE EVENTS
            </span>
            <span className="text-slate-600 hidden md:inline">•</span>
            <span className="text-slate-300 hidden md:inline">
              <strong className="text-purple-300">89%</strong> AVG CONFIDENCE
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenAuth('SIGN_IN')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold text-cyan-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('SIGN_UP')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. HERO EXPERIENCE: 3D EARTH / INDIA SPATIAL STAGE                        */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
        <section className="relative rounded-3xl bg-[#020612]/95 border border-cyan-500/25 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Top Tag */}
          <div className="absolute top-4 left-4 sm:left-6 z-20 pointer-events-none">
            <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>NATIONAL BIG DATA ANALYTICS PLATFORM • LIVE GEOSPATIAL INTELLIGENCE</span>
            </div>
          </div>

          {/* 3D Atmospheric Earth */}
          <SpatialAtmosphericCanvas
            onSelectEvent={(evt) => setSelectedEvent(evt)}
            selectedEventId={selectedEvent?.id}
            activeLayerFilter={activeLayer}
          />

          {/* Floating Left Hero Box */}
          <div className="absolute top-14 left-4 sm:left-6 z-20 max-w-sm sm:max-w-md pointer-events-none">
            <div className="pointer-events-auto space-y-4">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none uppercase">
                  NATIONAL WEATHER
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 mt-1">
                    INTELLIGENCE
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-sans mt-2 leading-relaxed">
                  Real-time multi-source weather intelligence for India. Fusing IMD Doppler radar, automated IoT weather stations, citizen eyewitness spotters, social media streams, and CWC river gauges into verified decision support.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onExplore}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-950/60 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>EXPLORE LIVE WEATHER</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('SIGN_IN')}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  SIGN IN
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('SIGN_UP')}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer hidden sm:inline-block"
                >
                  CREATE ACCOUNT
                </button>
              </div>

              {/* Spatial Data Stack */}
              <div className="pt-2">
                <SpatialLayerSelector
                  activeLayer={activeLayer}
                  onSelectLayer={(l) => setActiveLayer(l)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. CORE ARCHITECTURE PILLARS (5 Spatial Data Layers)                      */}
        {/* ========================================================================= */}
        <div className="mt-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                INTELLIGENCE PIPELINE ARCHITECTURE
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-0.5">
                Multi-Source Big Data Ingestion → AI Verification
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              STRICT CROSS-CHANNEL CONSENSUS ENGINE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* L01 */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between text-cyan-400 mb-2 font-mono text-xs font-bold">
                <span>L01 • LIVE WEATHER</span>
                <Radio className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Doppler & Surface AWS</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                550+ IMD automated weather stations, dual-frequency Doppler radar reflectivity, and real-time atmospheric isobar contours.
              </p>
              <div className="mt-3 text-[10px] font-mono text-cyan-300 font-bold">
                ● 14ms RECEPTION LATENCY
              </div>
            </div>

            {/* L02 */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-sky-500/30 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between text-sky-400 mb-2 font-mono text-xs font-bold">
                <span>L02 • MULTI-SOURCE</span>
                <Database className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Omnichannel Reports</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Continuous ingestion from Twitter/X geotags, citizen weather spotters, public APIs, CWC river sensors, and highway CCTV feeds.
              </p>
              <div className="mt-3 text-[10px] font-mono text-sky-300 font-bold">
                ● 128 ACTIVE STREAMS
              </div>
            </div>

            {/* L03 */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between text-purple-400 mb-2 font-mono text-xs font-bold">
                <span>L03 • CORRELATION</span>
                <Activity className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Evidence Clustering</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Automated spatio-temporal clustering within ≤15km radius and Δt ≤60 min. Deduplication and semantic incident grouping.
              </p>
              <div className="mt-3 text-[10px] font-mono text-purple-300 font-bold">
                ● 312 CORRELATED CLUSTERS
              </div>
            </div>

            {/* L04 */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between text-emerald-400 mb-2 font-mono text-xs font-bold">
                <span>L04 • AI VERIFICATION</span>
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">9-Factor Audit</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Mathematical multi-source cross-corroboration. Resolves conflicts, rejects false social media rumors, and computes confidence.
              </p>
              <div className="mt-3 text-[10px] font-mono text-emerald-300 font-bold">
                ● 91.4% CONSENSUS THRESHOLD
              </div>
            </div>

            {/* L05 */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-rose-500/30 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between text-rose-400 mb-2 font-mono text-xs font-bold">
                <span>L05 • THREAT INTEL</span>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Emergency Escalation</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Translates verified intelligence into NDMA/SDMA 5-level action thresholds, evacuation routes, and rapid civic dispatch directives.
              </p>
              <div className="mt-3 text-[10px] font-mono text-rose-300 font-bold">
                ● LEVEL 4 SEVERE DISPATCH
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. CALL TO ACTION FOOTER                                                  */}
        {/* ========================================================================= */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-cyan-950/60 via-slate-950/90 to-purple-950/60 border border-cyan-500/30 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-widest mb-1">
              SMART INDIA HACKATHON 2026 EVALUATION READY
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
              Enter National Weather Command Center
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Monitor real-time weather stations, interact with the 3D geospatial Earth, inspect AI-corroborated evidence dossiers, or access administrative management.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onExplore}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-950/60 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>LAUNCH DASHBOARD</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('SIGN_IN')}
              className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              ADMIN PORTAL
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Dossier if an event was clicked on Landing Earth */}
      {selectedEvent && (
        <EventIntelligenceDossier
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onNavigateToModule4={() => onExplore()}
          onAskBot={() => onExplore()}
        />
      )}
    </div>
  );
};
