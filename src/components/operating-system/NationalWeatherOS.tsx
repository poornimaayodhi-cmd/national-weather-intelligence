import React, { useState } from 'react';
import {
  Compass,
  Radio,
  MapPin,
  RefreshCw,
  Crosshair,
  ShieldAlert,
  ArrowRight,
  Layers,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { IndiaWeatherIntelligenceMap, OSMapMode } from './IndiaWeatherIntelligenceMap.tsx';
import { WeatherCopilotPanel } from './WeatherCopilotPanel.tsx';
import { EventIntelligenceDossierPanel } from './EventIntelligenceDossierPanel.tsx';
import { WhatsHappeningFeed } from './WhatsHappeningFeed.tsx';
import { RadialThreatGauge } from './RadialThreatGauge.tsx';
import { DataSourceStreamModule } from './DataSourceStreamModule.tsx';
import { WeatherTimelineSlider, TimelinePoint } from '../spatial/WeatherTimelineSlider.tsx';
import { MapWeatherEvent, REALTIME_WEATHER_EVENTS } from './osData.ts';
import { useLocation } from '../../context/LocationContext.tsx';
import { LocationSelectorModal } from '../LocationSelectorModal.tsx';
import { IngestionStats } from '../../types.ts';

interface NationalWeatherOSProps {
  stats: IngestionStats | null;
  onExploreLiveWeather: () => void;
  onNavigateToModule1: () => void;
  onNavigateToModule2: () => void;
  onNavigateToModule3: () => void;
  onNavigateToModule4: (eventId?: string) => void;
}

export const NationalWeatherOS: React.FC<NationalWeatherOSProps> = ({
  stats,
  onExploreLiveWeather,
  onNavigateToModule1,
  onNavigateToModule2,
  onNavigateToModule3,
  onNavigateToModule4,
}) => {
  const {
    location,
    isGpsPending,
    retryGps,
    isSelectorModalOpen,
    openSelectorModal,
    closeSelectorModal,
  } = useLocation();

  // Active selected weather event
  const [selectedEvent, setSelectedEvent] = useState<MapWeatherEvent | null>(REALTIME_WEATHER_EVENTS[0]);
  const [mapMode, setMapMode] = useState<OSMapMode>('WEATHER');
  const [timelinePoint, setTimelinePoint] = useState<TimelinePoint>('NOW');
  const [cameraFocus, setCameraFocus] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);

  // Handling Map Actions triggered by AI Weather Copilot (Requirement 6)
  const handleCopilotMapAction = (action: {
    type: 'FOCUS_LOCATION' | 'SHOW_SEVERE' | 'OPEN_EVENT' | 'SET_MODE';
    lat?: number;
    lng?: number;
    zoom?: number;
    eventId?: string;
    mode?: any;
    label?: string;
  }) => {
    if (action.type === 'FOCUS_LOCATION' && action.lat && action.lng) {
      setCameraFocus({ lat: action.lat, lng: action.lng, zoom: action.zoom || 1.35 });
    } else if (action.type === 'SHOW_SEVERE') {
      setMapMode('THREAT');
      if (action.lat && action.lng) {
        setCameraFocus({ lat: action.lat, lng: action.lng, zoom: 1.35 });
      }
    } else if (action.type === 'OPEN_EVENT' && action.eventId) {
      const found = REALTIME_WEATHER_EVENTS.find((e) => e.id === action.eventId);
      if (found) {
        setSelectedEvent(found);
        setCameraFocus({ lat: found.lat, lng: found.lng, zoom: 1.45 });
      }
    }
  };

  // Center map on user location
  const handleCenterOnUser = () => {
    setCameraFocus({
      lat: location.latitude,
      lng: location.longitude,
      zoom: 1.45,
    });
  };

  // Threat level click: highlights high risk areas on map
  const handleThreatHighlight = () => {
    setMapMode('THREAT');
    setCameraFocus({
      lat: 13.0827,
      lng: 80.2707,
      zoom: 1.35,
    });
  };

  const levelTag =
    location.level === 'GPS'
      ? 'GPS'
      : location.level === 'APPROXIMATE'
      ? 'Approximate'
      : 'Manual';

  return (
    <div className="space-y-4 relative z-10 pb-20 select-none">
      {/* ========================================================================= */}
      {/* 1. TOP LIVE SYSTEM HEADER (Requirement 17, 7, 8)                          */}
      {/* ========================================================================= */}
      <header className="p-3 rounded-2xl bg-slate-950/90 border border-cyan-500/25 backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* System Online & Source Metrics */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <strong className="text-white tracking-wider">SYSTEM ONLINE</strong>
          </div>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-slate-300">
            24 DATA SOURCES
          </span>
          <span className="text-slate-600 hidden md:inline">•</span>
          <span className="text-slate-300">
            128 ACTIVE EVENTS
          </span>
          <span className="text-slate-600 hidden lg:inline">•</span>
          <span className="text-slate-400 hidden lg:inline">
            LAST SYNC 21:42:08 IST
          </span>
          <span className="text-slate-600 hidden lg:inline">•</span>
          <span className="text-slate-400 hidden lg:inline">
            LATENCY 14ms
          </span>
        </div>

        {/* Location & Center on Me Button */}
        <div className="flex items-center gap-2">
          {/* Non-Blocking Location Indicator */}
          <button
            type="button"
            onClick={openSelectorModal}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-750 text-slate-200 text-xs transition-colors cursor-pointer"
            title="Click to search or manually select city/state"
          >
            <span className="text-amber-400 text-xs">📍</span>
            <span className="font-bold text-white uppercase">
              {location.city}, {location.state}
            </span>
            <span className="text-[10px] text-cyan-400">
              • {levelTag}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Retry GPS option */}
          <button
            type="button"
            onClick={() => retryGps()}
            disabled={isGpsPending}
            className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
            title="Retry browser GPS coordinates"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGpsPending ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Center Map on Me Button */}
          <button
            type="button"
            onClick={handleCenterOnUser}
            className="px-2.5 py-1 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
            title="Center Map on Active GPS Location"
          >
            <Crosshair className="w-3 h-3" />
            <span className="hidden sm:inline text-[11px]">CENTER MAP ON ME</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. CORE WORKSPACE: 3-COLUMN CONNECTED OPERATING SYSTEM                     */}
      {/* LEFT: 20-22% | CENTER: 55-60% (MAP) | RIGHT: 22-25% (COPILOT & DOSSIER)   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: Intelligence Feed + Threat Index + Source Orbit (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <WhatsHappeningFeed
            selectedEventId={selectedEvent?.id}
            onSelectEvent={(evt) => {
              setSelectedEvent(evt);
              setCameraFocus({ lat: evt.lat, lng: evt.lng, zoom: 1.45 });
            }}
          />

          <RadialThreatGauge onHighlightRegions={handleThreatHighlight} />

          <DataSourceStreamModule />
        </div>

        {/* CENTER COLUMN: Central India Weather Intelligence Map (6 Cols ~ 55-60% width) */}
        <div className="lg:col-span-6 space-y-3">
          <IndiaWeatherIntelligenceMap
            selectedEvent={selectedEvent}
            onSelectEvent={(evt) => setSelectedEvent(evt)}
            userCoords={{ latitude: location.latitude, longitude: location.longitude }}
            focusCoords={cameraFocus}
            activeMode={mapMode}
            onModeChange={(m) => setMapMode(m)}
          />

          {/* Weather Replay Timeline at bottom of map */}
          <WeatherTimelineSlider
            currentPoint={timelinePoint}
            onChangePoint={(pt) => setTimelinePoint(pt)}
          />
        </div>

        {/* RIGHT COLUMN: AI Weather Copilot + Event Intelligence Dossier (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <WeatherCopilotPanel
            onTriggerMapAction={handleCopilotMapAction}
            selectedEvent={selectedEvent}
            userCity={location.city}
          />

          <EventIntelligenceDossierPanel
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onOpenDecisionPlan={(eventId) => onNavigateToModule4(eventId)}
          />
        </div>
      </div>

      {/* Non-Blocking Location Selector Modal */}
      <LocationSelectorModal
        isOpen={isSelectorModalOpen}
        onClose={closeSelectorModal}
      />
    </div>
  );
};
