import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  CloudRain,
  Radio,
  Layers,
  Sparkles,
  RefreshCw,
  Share2,
  CloudLightning,
  Database,
  Globe,
  ShieldCheck,
  ShieldAlert,
  CloudSun,
  MapPin,
  Bot,
  Crosshair,
  AlertTriangle,
  CheckCircle2,
  Compass,
  Bookmark,
  Bell,
  User,
  Sliders,
  Shield,
  LogOut,
  ChevronDown,
  Navigation,
} from 'lucide-react';
import { WeatherReport, IngestionStats, SourceType, DuplicateStatus } from './types.ts';
import { ReportCard } from './components/ReportCard.tsx';
import { StatsBar } from './components/StatsBar.tsx';
import { FeedFilters } from './components/FeedFilters.tsx';
import { ReportDetailModal } from './components/ReportDetailModal.tsx';
import { IngestModal } from './components/IngestModal.tsx';
import { Module2View } from './components/Module2View.tsx';
import { Module3View } from './components/Module3View.tsx';
import { Module4View } from './components/Module4View.tsx';
import { LiveWeatherView } from './components/LiveWeatherView.tsx';
import { SpatialCommandCenter } from './components/spatial/SpatialCommandCenter.tsx';
import { AtmosphericGeospatialBackground } from './components/AtmosphericGeospatialBackground.tsx';
import { LocationProvider, useLocation } from './context/LocationContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { LocationStatusIndicator } from './components/LocationStatusIndicator.tsx';
import { WeatherBotModal } from './components/WeatherBotModal.tsx';
import { WeatherBotWidget } from './components/WeatherBotWidget.tsx';

// New Architecture Modules
import { LandingPage } from './components/landing/LandingPage.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { WeatherCopilotPanel } from './components/copilot/WeatherCopilotPanel.tsx';
import { EventsDirectoryView } from './components/events/EventsDirectoryView.tsx';
import { SavedEventsView } from './components/saved/SavedEventsView.tsx';
import { UserAlertsView } from './components/alerts/UserAlertsView.tsx';
import { UserProfileView } from './components/profile/UserProfileView.tsx';
import { UserSettingsView } from './components/settings/UserSettingsView.tsx';
import { AdminCommandCenter } from './components/admin/AdminCommandCenter.tsx';
import { EventIntelligenceDossier } from './components/spatial/EventIntelligenceDossier.tsx';
import {
  SPATIAL_EVENT_NODES,
  SpatialEventNode,
  FocusTargetCoords,
} from './components/spatial/SpatialAtmosphericCanvas.tsx';

export type NavigationModule =
  | 'LANDING'
  | 'COMMAND_CENTER' // OVERVIEW
  | 'LIVE_WEATHER'
  | 'EVENTS'
  | 'SAVED'
  | 'ALERTS'
  | 'PROFILE'
  | 'SETTINGS'
  | 'ADMIN_CONSOLE'
  | 'MODULE_1'
  | 'MODULE_2'
  | 'MODULE_3'
  | 'MODULE_4';

function MainDashboard() {
  const { location, retryGps } = useLocation();
  const { currentUser, isAuthenticated, role, signOut, unreadAlertsCount } = useAuth();

  const [currentModule, setCurrentModule] = useState<NavigationModule>('COMMAND_CENTER');
  const [targetEventId, setTargetEventId] = useState<string | null>(null);

  // Copilot & Dossier Modals
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'SIGN_IN' | 'SIGN_UP'>('SIGN_IN');
  const [selectedEventNode, setSelectedEventNode] = useState<SpatialEventNode | null>(null);
  const [focusTarget, setFocusTarget] = useState<FocusTargetCoords | null>(null);

  // Weather Bot State
  const [isBotModalOpen, setIsBotModalOpen] = useState(false);
  const [botInitialQuery, setBotInitialQuery] = useState('');

  // User Profile Dropdown Menu in Top Bar
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const [reports, setReports] = useState<WeatherReport[]>([]);
  const [stats, setStats] = useState<IngestionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isIngestingSample, setIsIngestingSample] = useState(false);
  const [selectedReport, setSelectedReport] = useState<WeatherReport | null>(null);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);

  // Filters
  const [selectedSourceType, setSelectedSourceType] = useState<SourceType | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [duplicateFilter, setDuplicateFilter] = useState<DuplicateStatus | 'ALL'>('ALL');

  // Fetch reports from Ingestion API
  const fetchReports = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedSourceType !== 'ALL') params.append('source_type', selectedSourceType);
      if (selectedCategory !== 'ALL') params.append('event_category', selectedCategory);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (duplicateFilter !== 'ALL') params.append('duplicate_status', duplicateFilter);

      const [reportsRes, statsRes] = await Promise.all([
        fetch(`/api/reports?${params.toString()}`),
        fetch('/api/stats'),
      ]);

      const reportsData = await reportsRes.json();
      const statsData = await statsRes.json();

      if (reportsData.success) {
        setReports(reportsData.reports);
      }
      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (err) {
      console.error('Failed to load reports from ingestion API:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedSourceType, selectedCategory, searchQuery, duplicateFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Periodic polling for live feed update simulation (every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchReports();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchReports]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchReports();
  };

  const handleTriggerSampleIngest = async (sourceType?: SourceType) => {
    setIsIngestingSample(true);
    try {
      const res = await fetch('/api/ingest/sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sourceType ? { source_type: sourceType } : {}),
      });
      const data = await res.json();
      if (data.success) {
        fetchReports();
      }
    } catch (err) {
      console.error('Failed to ingest sample:', err);
    } finally {
      setIsIngestingSample(false);
    }
  };

  const handleResetSeedData = async () => {
    if (window.confirm('Reset storage and re-seed with standard multi-source test reports?')) {
      try {
        setIsLoading(true);
        await fetch('/api/reports/reset', { method: 'POST' });
        fetchReports();
      } catch (err) {
        console.error('Failed to reset storage:', err);
      }
    }
  };

  // Helper to focus on User's Location on 3D Earth
  const handleFocusOnMe = () => {
    const lat = location.latitude || 13.0827;
    const lng = location.longitude || 80.2707;
    setFocusTarget({ lat, lng, zoom: 1.45, timestamp: Date.now() });
    setCurrentModule('COMMAND_CENTER');
  };

  const categories = stats ? Object.keys(stats.by_event_category) : [];

  // If user is on the Landing Page, render Landing Page directly
  if (currentModule === 'LANDING') {
    return (
      <div className="min-h-screen bg-[#050C1B] text-slate-100 font-sans overflow-x-hidden relative">
        <AtmosphericGeospatialBackground />
        <LandingPage
          onExplore={() => setCurrentModule('COMMAND_CENTER')}
          onOpenAuth={(mode) => {
            setAuthModalMode(mode);
            setIsAuthModalOpen(true);
          }}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050C1B] text-slate-100 font-sans overflow-x-hidden relative">
      {/* Subtle Atmospheric Geospatial Background */}
      <AtmosphericGeospatialBackground />

      {/* Top Navigation Bar */}
      <header className="bg-slate-900/90 border-b border-slate-800/90 backdrop-blur-md sticky top-0 z-30 shadow-lg">
        <div className="w-full max-w-[1536px] mx-auto px-2 sm:px-3 lg:px-4 h-13 sm:h-14 flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Logo / System Identity */}
          <div
            onClick={() => setCurrentModule('COMMAND_CENTER')}
            className="flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer"
            title="National Weather Big Data Analytics Platform"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-cyan-950/40 shrink-0 border border-cyan-400/30">
              <CloudRain className="w-4 h-4 text-cyan-200" />
            </div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-sm font-bold text-white leading-tight whitespace-nowrap">
                NATIONAL WEATHER BIG DATA
              </h1>
              <span className="text-[9px] font-semibold bg-cyan-950/80 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800/60 whitespace-nowrap hidden 2xl:inline-block">
                INTELLIGENCE PLATFORM
              </span>
            </div>
          </div>

          {/* Navigation Bar: Zero-scroll compact command tabs */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink min-w-0">
            <div className="flex items-center p-0.5 bg-slate-950/90 border border-slate-800 rounded-lg sm:rounded-xl gap-0.5 sm:gap-1">
              {/* OVERVIEW (3D EARTH) */}
              <button
                id="tab-nav-overview"
                onClick={() => {
                  setCurrentModule('COMMAND_CENTER');
                  setTargetEventId(null);
                }}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10.5px] sm:text-[11px] font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  currentModule === 'COMMAND_CENTER'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                <span>Overview</span>
              </button>

              {/* LIVE WEATHER */}
              <button
                id="tab-nav-liveweather"
                onClick={() => {
                  setCurrentModule('LIVE_WEATHER');
                  setTargetEventId(null);
                }}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10.5px] sm:text-[11px] font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  currentModule === 'LIVE_WEATHER'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <CloudSun className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                <span>Live Weather</span>
              </button>

              {/* EVENTS DIRECTORY */}
              <button
                id="tab-nav-events"
                onClick={() => setCurrentModule('EVENTS')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10.5px] sm:text-[11px] font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  currentModule === 'EVENTS'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Radio className="w-3.5 h-3.5 shrink-0" />
                <span>Events</span>
              </button>

              {/* SAVED INTELLIGENCE */}
              <button
                id="tab-nav-saved"
                onClick={() => setCurrentModule('SAVED')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10.5px] sm:text-[11px] font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  currentModule === 'SAVED'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline">Saved</span>
              </button>

              {/* ALERTS FEED */}
              <button
                id="tab-nav-alerts"
                onClick={() => setCurrentModule('ALERTS')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10.5px] sm:text-[11px] font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  currentModule === 'ALERTS'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Bell className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline">Alerts</span>
                {unreadAlertsCount > 0 && (
                  <span className="px-1 py-0.2 rounded-full text-[8.5px] font-bold bg-rose-500 text-white">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>

              {/* ADMIN COMMAND CENTER (For Admin Role) */}
              {role === 'ADMIN' && (
                <button
                  id="tab-nav-admin"
                  onClick={() => setCurrentModule('ADMIN_CONSOLE')}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10.5px] sm:text-[11px] font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    currentModule === 'ADMIN_CONSOLE'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs ring-1 ring-purple-400/50'
                      : 'text-purple-300 hover:text-white hover:bg-purple-950/50'
                  }`}
                  title="Administrative Command Console & Verification"
                >
                  <Shield className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                  <span>Admin</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse hidden sm:inline-block" />
                </button>
              )}
            </div>

            {/* AI Weather Copilot Button */}
            <button
              id="btn-top-copilot"
              onClick={() => setIsCopilotOpen(!isCopilotOpen)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-[10.5px] sm:text-[11px] font-semibold rounded-md sm:rounded-lg shadow-xs transition-all shrink-0 whitespace-nowrap cursor-pointer"
              title="Open AI Weather Copilot"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
              <span className="hidden sm:inline">AI Copilot</span>
              <span className="sm:hidden">Copilot</span>
            </button>

            {/* User Profile / Auth Button */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-lg bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-[10px]">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden lg:inline text-[11px] font-bold">
                    {currentUser?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 p-2 rounded-2xl bg-slate-950/95 border border-cyan-500/30 backdrop-blur-xl shadow-2xl z-50 text-xs font-mono space-y-1">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <div className="font-bold text-white text-xs">{currentUser?.name}</div>
                      <div className="text-[10px] text-cyan-300 truncate">{currentUser?.email}</div>
                      <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[8.5px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                        {currentUser?.role}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentModule('PROFILE');
                        setShowUserDropdown(false);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg text-left text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>My Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentModule('SETTINGS');
                        setShowUserDropdown(false);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg text-left text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-2 cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentModule('LANDING');
                        setShowUserDropdown(false);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg text-left text-cyan-400 hover:text-cyan-300 hover:bg-slate-900 flex items-center gap-2 cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Landing Page View</span>
                    </button>

                    <div className="h-[1px] bg-slate-800 my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        signOut();
                        setShowUserDropdown(false);
                        setCurrentModule('LANDING');
                      }}
                      className="w-full px-3 py-1.5 rounded-lg text-left text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('SIGN_IN');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-cyan-300 hover:text-white hover:bg-slate-800"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 3-Level Fallback Location Status Strip with [ FOCUS ON ME ] */}
      <div className="bg-[#0A1424] border-b border-slate-800/80 px-3 sm:px-4 py-1.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2.5">
            <LocationStatusIndicator />
            <button
              type="button"
              onClick={handleFocusOnMe}
              className="px-2.5 py-0.5 rounded-md bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-white text-[10.5px] font-mono font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
              title="Focus 3D Earth directly on your detected location"
            >
              <Navigation className="w-3 h-3 text-cyan-400 rotate-45" />
              <span>Focus on Me</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            {location.station && (
              <span className="hidden md:inline">
                Telemetry Station: <strong className="text-slate-200">{location.station.station_name}</strong>
              </span>
            )}
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="text-slate-400">
              3-Level Detection: GPS → Approximate → Manual
            </span>
          </div>
        </div>
      </div>

      {/* Smart India Hackathon Demonstration Banner */}
      <div className="bg-[#0A1628] border-b border-amber-500/25 px-4 py-2 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
              SIH 2026 EVALUATION DEMO
            </span>
            <span className="font-semibold text-amber-200">
              Scenario: Chennai, Tamil Nadu Monsoon Flash-Flood & Urban Inundation
            </span>
            <span className="hidden lg:inline text-slate-400">
              • Simulated multi-source data fusion (IMD RMC, TNSDMA River Gauge, GCC Telemetry, Citizen Spotters, Social Media & News)
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-xs">
              DEMO / SIMULATED DATA
            </span>
            <button
              onClick={handleResetSeedData}
              className="ml-2 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-amber-200 border border-amber-500/30 transition-colors shadow-xs cursor-pointer"
              title="Reset storage and re-seed the standard Chennai flash flood dataset"
            >
              Reset Chennai Scenario
            </button>
            <button
              onClick={() => setIsIngestModalOpen(true)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-xs cursor-pointer"
            >
              + Ingest Report
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 relative z-10">
        {/* OVERVIEW / 3D EARTH DASHBOARD */}
        {currentModule === 'COMMAND_CENTER' && (
          <SpatialCommandCenter
            stats={stats}
            onExploreLiveWeather={() => {
              setCurrentModule('LIVE_WEATHER');
              setTargetEventId(null);
            }}
            onNavigateToModule1={() => {
              setCurrentModule('MODULE_1');
              setTargetEventId(null);
            }}
            onNavigateToModule2={() => {
              setCurrentModule('MODULE_2');
            }}
            onNavigateToModule3={() => {
              setCurrentModule('MODULE_3');
            }}
            onNavigateToModule4={(eventId) => {
              if (eventId) setTargetEventId(eventId);
              setCurrentModule('MODULE_4');
            }}
            onAskBot={(query) => {
              setBotInitialQuery(query);
              setIsBotModalOpen(true);
            }}
            onOpenCopilot={() => setIsCopilotOpen(true)}
            onOpenAlerts={() => setCurrentModule('ALERTS')}
            onOpenEventsDirectory={() => setCurrentModule('EVENTS')}
            focusTarget={focusTarget}
          />
        )}

        {/* LIVE WEATHER */}
        {currentModule === 'LIVE_WEATHER' && (
          <LiveWeatherView
            onSwitchToModule1={() => {
              setCurrentModule('MODULE_1');
              setTargetEventId(null);
            }}
            onSwitchToModule3={(eventId) => {
              if (eventId) setTargetEventId(eventId);
              setCurrentModule('MODULE_3');
            }}
            onSwitchToModule4={(eventId) => {
              if (eventId) setTargetEventId(eventId);
              setCurrentModule('MODULE_4');
            }}
          />
        )}

        {/* EVENTS DIRECTORY */}
        {currentModule === 'EVENTS' && (
          <EventsDirectoryView
            onViewOnMap={(evt) => {
              setFocusTarget({ lat: evt.lat, lng: evt.lng, zoom: 1.45, timestamp: Date.now() });
              setCurrentModule('COMMAND_CENTER');
            }}
            onViewIntelligence={(evt) => setSelectedEventNode(evt)}
            onOpenReportModal={() => setIsIngestModalOpen(true)}
          />
        )}

        {/* SAVED INTELLIGENCE */}
        {currentModule === 'SAVED' && (
          <SavedEventsView
            onViewOnMap={(evt) => {
              setFocusTarget({ lat: evt.lat, lng: evt.lng, zoom: 1.45, timestamp: Date.now() });
              setCurrentModule('COMMAND_CENTER');
            }}
            onViewIntelligence={(evt) => setSelectedEventNode(evt)}
            onExploreEvents={() => setCurrentModule('EVENTS')}
          />
        )}

        {/* USER ALERTS FEED */}
        {currentModule === 'ALERTS' && (
          <UserAlertsView
            onViewOnMap={(evt) => {
              setFocusTarget({ lat: evt.lat, lng: evt.lng, zoom: 1.45, timestamp: Date.now() });
              setCurrentModule('COMMAND_CENTER');
            }}
            onViewIntelligence={(evt) => setSelectedEventNode(evt)}
          />
        )}

        {/* USER PROFILE */}
        {currentModule === 'PROFILE' && (
          <UserProfileView
            onNavigateToSettings={() => setCurrentModule('SETTINGS')}
            onNavigateToAlerts={() => setCurrentModule('ALERTS')}
            onSignOut={() => {
              signOut();
              setCurrentModule('LANDING');
            }}
          />
        )}

        {/* USER SETTINGS */}
        {currentModule === 'SETTINGS' && <UserSettingsView />}

        {/* ADMIN COMMAND CENTER */}
        {currentModule === 'ADMIN_CONSOLE' && (
          role === 'ADMIN' ? (
            <AdminCommandCenter />
          ) : (
            <div className="p-12 rounded-3xl bg-slate-950/90 border border-rose-500/40 text-center space-y-4 max-w-xl mx-auto my-12">
              <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
              <h3 className="text-xl font-black text-white font-mono uppercase">
                ADMINISTRATIVE CLEARANCE REQUIRED
              </h3>
              <p className="text-xs text-slate-300 font-mono">
                Access to the National Command Center and User Management is restricted to authorized Administrators. Your current role is <strong>{role}</strong>.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentModule('COMMAND_CENTER')}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 font-mono text-xs font-bold uppercase"
                >
                  Return to Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('SIGN_IN');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-mono text-xs font-bold uppercase"
                >
                  Authenticate as Admin
                </button>
              </div>
            </div>
          )
        )}

        {/* EXISTING EVALUATION MODULES */}
        {currentModule === 'MODULE_4' && (
          <Module4View
            onSwitchToModule1={() => {
              setCurrentModule('MODULE_1');
              setTargetEventId(null);
            }}
            onSwitchToModule2={() => setCurrentModule('MODULE_2')}
            onSwitchToModule3={(eventId) => {
              if (eventId) setTargetEventId(eventId);
              setCurrentModule('MODULE_3');
            }}
            selectedEventId={targetEventId}
            onClearSelectedEventId={() => setTargetEventId(null)}
          />
        )}

        {currentModule === 'MODULE_3' && (
          <Module3View
            onSwitchToModule1={() => {
              setCurrentModule('MODULE_1');
              setTargetEventId(null);
            }}
            onSwitchToModule2={() => setCurrentModule('MODULE_2')}
            onSwitchToModule4={(eventId) => {
              if (eventId) setTargetEventId(eventId);
              setCurrentModule('MODULE_4');
            }}
            selectedEventId={targetEventId}
            onClearSelectedEventId={() => setTargetEventId(null)}
          />
        )}

        {currentModule === 'MODULE_2' && (
          <Module2View
            onSwitchToModule1={() => setCurrentModule('MODULE_1')}
            onSwitchToModule3={(eventId) => {
              if (eventId) setTargetEventId(eventId);
              setCurrentModule('MODULE_3');
            }}
            onSwitchToModule4={(eventId) => {
              if (eventId) setTargetEventId(eventId);
              setCurrentModule('MODULE_4');
            }}
            selectedEventId={targetEventId}
            onClearSelectedEventId={() => setTargetEventId(null)}
          />
        )}

        {currentModule === 'MODULE_1' && (
          <div className="space-y-6">
            <StatsBar
              stats={stats}
              isLoading={isLoading}
              onIngestClick={() => setIsIngestModalOpen(true)}
              onSampleIngestClick={() => handleTriggerSampleIngest()}
              isIngestingSample={isIngestingSample}
            />

            <FeedFilters
              selectedSourceType={selectedSourceType}
              onSelectSourceType={setSelectedSourceType}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              duplicateFilter={duplicateFilter}
              onSelectDuplicateFilter={setDuplicateFilter}
              categories={categories}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />

            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 rounded-xl border border-slate-800">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mb-3" />
                <p className="text-slate-400 text-sm">Synchronizing multi-source ingestion feed...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 rounded-xl border border-slate-800 text-center">
                <CloudRain className="w-12 h-12 text-slate-600 mb-3" />
                <h3 className="text-lg font-medium text-slate-300 mb-1">No Weather Reports Found</h3>
                <p className="text-slate-500 text-sm max-w-md mb-4">
                  No incoming reports match your current filtering criteria. Ingest a new report or sample data.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleTriggerSampleIngest()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs"
                  >
                    Simulate Inflow
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSourceType('ALL');
                      setSelectedCategory('ALL');
                      setSearchQuery('');
                      setDuplicateFilter('ALL');
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onClick={() => setSelectedReport(report)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Slide-over Event Intelligence Dossier */}
      {selectedEventNode && (
        <EventIntelligenceDossier
          event={selectedEventNode}
          onClose={() => setSelectedEventNode(null)}
          onNavigateToModule4={(eventId) => {
            if (eventId) setTargetEventId(eventId);
            setCurrentModule('MODULE_4');
          }}
          onAskBot={(q) => {
            setBotInitialQuery(q);
            setIsBotModalOpen(true);
          }}
        />
      )}

      {/* AI Weather Copilot Panel (Drawer) */}
      <WeatherCopilotPanel
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onFocusLocation={(lat, lng, zoom) => {
          setFocusTarget({ lat, lng, zoom: zoom || 1.45, timestamp: Date.now() });
          setCurrentModule('COMMAND_CENTER');
        }}
        onSelectEvent={(evt) => setSelectedEventNode(evt)}
      />

      {/* Auth Modal (Sign In / Sign Up / Forgot Password) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Ingestion & Report Modals */}
      <IngestModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onIngestSuccess={() => fetchReports()}
      />

      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />

      <WeatherBotModal
        isOpen={isBotModalOpen}
        onClose={() => setIsBotModalOpen(false)}
        initialQuery={botInitialQuery}
      />

      <WeatherBotWidget
        onClick={() => {
          setBotInitialQuery('');
          setIsBotModalOpen(true);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <MainDashboard />
      </LocationProvider>
    </AuthProvider>
  );
}
