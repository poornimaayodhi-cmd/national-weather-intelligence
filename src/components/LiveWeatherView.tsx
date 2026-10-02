import React, { useState, useEffect, useCallback } from 'react';
import {
  CloudSun,
  MapPin,
  RefreshCw,
  AlertTriangle,
  Radio,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Navigation,
} from 'lucide-react';
import {
  WeatherState,
  WeatherDistrict,
  WeatherStation,
  StationWeatherData,
  LocationSearchResult,
} from '../types/weather.ts';
import { weatherService } from '../services/weatherService.ts';
import { GeolocationErrorDetails, formatDistance } from '../services/locationService.ts';
import { LocationSelector } from './weather/LocationSelector.tsx';
import { LocationSearchBar } from './weather/LocationSearchBar.tsx';
import { CurrentLocationButton } from './weather/CurrentLocationButton.tsx';
import { HeroWeatherCard } from './weather/HeroWeatherCard.tsx';
import { WeatherMetricsGrid } from './weather/WeatherMetricsGrid.tsx';
import { MLPipelineReadinessCard } from './weather/MLPipelineReadinessCard.tsx';
import { TruthVerificationModal } from './weather/TruthVerificationModal.tsx';

interface LiveWeatherViewProps {
  onSwitchToModule1?: () => void;
  onSwitchToModule3?: (eventId?: string) => void;
  onSwitchToModule4?: (eventId?: string) => void;
}

export const LiveWeatherView: React.FC<LiveWeatherViewProps> = ({
  onSwitchToModule1,
  onSwitchToModule3,
  onSwitchToModule4,
}) => {
  // Hierarchical location states
  const [states, setStates] = useState<WeatherState[]>([]);
  const [districts, setDistricts] = useState<WeatherDistrict[]>([]);
  const [stations, setStations] = useState<WeatherStation[]>([]);

  // Selected IDs (Single Source of Truth for Data Consistency)
  const [selectedStateId, setSelectedStateId] = useState<string>('TN');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('TN_CHE');
  const [selectedStationId, setSelectedStationId] = useState<string>('IMD_CHE_SAIDAPET');

  // Weather data & loading states
  const [weatherData, setWeatherData] = useState<StationWeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(true);
  const [isRefreshingTelemetry, setIsRefreshingTelemetry] = useState<boolean>(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState<boolean>(false);
  const [isLoadingStations, setIsLoadingStations] = useState<boolean>(false);
  const [isTruthAuditOpen, setIsTruthAuditOpen] = useState<boolean>(false);

  // Error notifications & Live location resolution metadata
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<GeolocationErrorDetails | null>(null);
  const [resolvedLocationMeta, setResolvedLocationMeta] = useState<{
    source: 'gps' | 'network_ip' | 'fallback';
    city?: string;
    country?: string;
    distanceKm?: number;
    stationName?: string;
  } | null>(null);

  // Fetch Weather Data for a station ID
  const fetchWeatherForStation = useCallback(async (stationId: string) => {
    if (!stationId) return;

    setIsLoadingWeather(true);
    setErrorMessage(null);

    try {
      const data = await weatherService.fetchWeatherByStationId(stationId);

      // Verify consistency
      if (data.station_id === stationId) {
        setWeatherData(data);
      } else {
        throw new Error(
          `Data mismatch: Expected telemetry for ${stationId} but received ${data.station_id}`
        );
      }
    } catch (err: any) {
      console.error(`Failed to load weather for station ${stationId}:`, err);
      setErrorMessage(err?.message || 'Unable to retrieve station observation data.');
      setWeatherData(null);
    } finally {
      setIsLoadingWeather(false);
    }
  }, []);

  // 1. Initial Load: Fetch States, baseline Districts, Stations, and baseline Weather
  useEffect(() => {
    async function initBaseline() {
      try {
        const loadedStates = await weatherService.fetchStates();
        setStates(loadedStates);

        const loadedDistricts = await weatherService.fetchDistricts('TN');
        setDistricts(loadedDistricts);

        const loadedStations = await weatherService.fetchStations('TN_CHE');
        setStations(loadedStations);

        fetchWeatherForStation('IMD_CHE_SAIDAPET');
      } catch (err: any) {
        console.error('Failed to initialize weather metadata:', err);
        setErrorMessage('Failed to connect to location metadata service.');
      }
    }
    initBaseline();
  }, [fetchWeatherForStation]);

  // Robust atomic station selector: loads hierarchy and updates state without race-condition resets
  const selectStationDirectly = async (
    targetStateId: string,
    targetDistrictId: string,
    targetStationId: string,
    preloadedData?: StationWeatherData,
    locationMeta?: { source: 'gps' | 'network_ip' | 'fallback'; city?: string; country?: string; distanceKm?: number }
  ) => {
    setGeoError(null);
    setErrorMessage(null);
    if (locationMeta) {
      setResolvedLocationMeta({
        ...locationMeta,
        stationName: preloadedData?.station_name || targetStationId,
      });
    }

    try {
      // 1. Fetch target state's districts
      setIsLoadingDistricts(true);
      const loadedDistricts = await weatherService.fetchDistricts(targetStateId);
      setDistricts(loadedDistricts);
      setIsLoadingDistricts(false);

      // 2. Fetch target district's stations
      setIsLoadingStations(true);
      const loadedStations = await weatherService.fetchStations(targetDistrictId);
      if (preloadedData && !loadedStations.some(s => s.station_id === targetStationId)) {
        setStations([
          {
            station_id: preloadedData.station_id,
            station_name: preloadedData.station_name,
            district_id: preloadedData.district_id,
            district_name: preloadedData.district_name,
            state_id: preloadedData.state_id,
            state_name: preloadedData.state_name,
            station_type: preloadedData.station_type,
            latitude: preloadedData.latitude,
            longitude: preloadedData.longitude,
            elevation_meters: preloadedData.elevation_meters,
            pincodes: [],
            is_active: true,
          },
          ...loadedStations,
        ]);
      } else {
        setStations(loadedStations);
      }
      setIsLoadingStations(false);

      // 3. Atomically set IDs
      setSelectedStateId(targetStateId);
      setSelectedDistrictId(targetDistrictId);
      setSelectedStationId(targetStationId);

      // 4. Set weather data
      if (preloadedData) {
        setWeatherData(preloadedData);
        setIsLoadingWeather(false);
      } else {
        await fetchWeatherForStation(targetStationId);
      }
    } catch (err: any) {
      console.error('Error in selectStationDirectly:', err);
      setErrorMessage(err?.message || 'Failed to switch weather station.');
    } finally {
      setIsLoadingDistricts(false);
      setIsLoadingStations(false);
    }
  };

  // Handle manual dropdown selection: State
  const handleSelectState = async (stateId: string) => {
    setSelectedStateId(stateId);
    setResolvedLocationMeta(null);
    setIsLoadingDistricts(true);
    try {
      const loadedDistricts = await weatherService.fetchDistricts(stateId);
      setDistricts(loadedDistricts);
      if (loadedDistricts.length > 0) {
        const firstDist = loadedDistricts[0].district_id;
        setSelectedDistrictId(firstDist);
        setIsLoadingStations(true);
        const loadedStations = await weatherService.fetchStations(firstDist);
        setStations(loadedStations);
        if (loadedStations.length > 0) {
          const firstSt = loadedStations[0].station_id;
          setSelectedStationId(firstSt);
          fetchWeatherForStation(firstSt);
        }
      }
    } catch (err) {
      console.error('Failed to change state:', err);
    } finally {
      setIsLoadingDistricts(false);
      setIsLoadingStations(false);
    }
  };

  // Handle manual dropdown selection: District
  const handleSelectDistrict = async (districtId: string) => {
    setSelectedDistrictId(districtId);
    setResolvedLocationMeta(null);
    setIsLoadingStations(true);
    try {
      const loadedStations = await weatherService.fetchStations(districtId);
      setStations(loadedStations);
      if (loadedStations.length > 0) {
        const firstSt = loadedStations[0].station_id;
        setSelectedStationId(firstSt);
        fetchWeatherForStation(firstSt);
      }
    } catch (err) {
      console.error('Failed to change district:', err);
    } finally {
      setIsLoadingStations(false);
    }
  };

  // Handle manual dropdown selection: Station
  const handleSelectStation = (stationId: string) => {
    setSelectedStationId(stationId);
    setResolvedLocationMeta(null);
    fetchWeatherForStation(stationId);
  };

  // Handle selection from Search Bar
  const handleSelectFromSearch = (result: LocationSearchResult) => {
    setResolvedLocationMeta(null);
    selectStationDirectly(result.state_id, result.district_id, result.station_id);
  };

  // Handle resolution from Current Location button
  const handleCurrentLocationResolved = (
    station: WeatherStation,
    freshWeatherData: StationWeatherData,
    distanceKm: number,
    locationMeta?: { source: 'gps' | 'network_ip' | 'fallback'; city?: string; country?: string }
  ) => {
    selectStationDirectly(
      station.state_id,
      station.district_id,
      station.station_id,
      freshWeatherData,
      locationMeta ? { ...locationMeta, distanceKm } : undefined
    );
  };

  // Telemetry refresh
  const handleRefreshTelemetry = async () => {
    if (!selectedStationId) return;
    setIsRefreshingTelemetry(true);
    try {
      const fresh = await weatherService.refreshStationWeather(selectedStationId);
      if (fresh.station_id === selectedStationId) {
        setWeatherData(fresh);
      }
    } catch (err: any) {
      console.error('Refresh failed:', err);
    } finally {
      setIsRefreshingTelemetry(false);
    }
  };

  // Quick preset shortcuts
  const PRESET_STATIONS = [
    {
      label: 'Chennai (Saidapet)',
      state_id: 'TN',
      district_id: 'TN_CHE',
      station_id: 'IMD_CHE_SAIDAPET',
      isHero: true,
    },
    {
      label: 'Mumbai (Colaba)',
      state_id: 'MH',
      district_id: 'MH_MUM_C',
      station_id: 'IMD_MUM_COLABA',
    },
    {
      label: 'Bengaluru (HAL)',
      state_id: 'KA',
      district_id: 'KA_BLR_U',
      station_id: 'IMD_BLR_HAL',
    },
    {
      label: 'New Delhi (Safdarjung)',
      state_id: 'DL',
      district_id: 'DL_NEW',
      station_id: 'IMD_DEL_SAFGDARJUNG',
    },
    {
      label: 'Kochi (Naval Base)',
      state_id: 'KL',
      district_id: 'KL_ERN',
      station_id: 'IMD_KL_KOCHI_NAVAL',
    },
    {
      label: 'Kolkata (Alipore)',
      state_id: 'WB',
      district_id: 'WB_KOL',
      station_id: 'IMD_WB_ALIPORE',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Top Banner: "Weather at Your Location" Header with Quick Presets */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-blue-500/10 text-blue-300 rounded-md border border-blue-500/20 uppercase tracking-wider flex items-center gap-1.5">
              <CloudSun className="w-3.5 h-3.5 text-blue-400" />
              Live Telemetry
            </span>
            <span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
              IMD Automated Weather Stations
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Weather at Your Location
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
            Live in-situ observations from official India Meteorological Department (IMD) surface stations and Automated Weather Stations (AWS).
          </p>
        </div>

        {/* Quick Station Presets */}
        <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
          <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
            Quick Stations:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {PRESET_STATIONS.map((preset) => (
              <button
                key={preset.station_id}
                type="button"
                onClick={() => {
                  setResolvedLocationMeta(null);
                  selectStationDirectly(preset.state_id, preset.district_id, preset.station_id);
                }}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition-all duration-150 ${
                  selectedStationId === preset.station_id
                    ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                    : 'bg-slate-950 hover:bg-slate-850 text-slate-300 border-slate-800 hover:border-slate-700'
                } ${preset.isHero ? 'border-amber-500/40 text-amber-200' : ''}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Location Active Banner */}
      {resolvedLocationMeta && (
        <div className="p-4 rounded-xl bg-blue-950/70 border border-blue-500/40 text-blue-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md animate-in fade-in slide-in-from-top-1">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shrink-0 mt-0.5">
              <Navigation className="w-4 h-4 animate-pulse text-blue-300" />
            </div>
            <div className="text-xs space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-white text-sm">True Live Weather Active</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-900/70 text-blue-300 border border-blue-700/60 font-semibold">
                  {resolvedLocationMeta.source === 'gps' ? 'GPS Device Fix' : 'Network/IP Geolocation'}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  100% Genuine Sensor Readings
                </span>
                {resolvedLocationMeta.distanceKm !== undefined && resolvedLocationMeta.distanceKm > 0 && (
                  <span className="text-slate-400 text-[11px]">
                    • {formatDistance(resolvedLocationMeta.distanceKm)} to station
                  </span>
                )}
              </div>
              <p className="text-blue-300/90 text-xs">
                Reporting real-time surface & satellite meteorological observations for{' '}
                <strong className="text-white">
                  {resolvedLocationMeta.city || weatherData?.district_name || 'Your Detected Area'}
                  {resolvedLocationMeta.country ? `, ${resolvedLocationMeta.country}` : ''}
                </strong>
                {' '}• Feed: <strong className="text-white">{weatherData?.station_name || selectedStationId}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            {weatherData && (
              <button
                type="button"
                onClick={() => setIsTruthAuditOpen(true)}
                className="text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verify Telemetry Truth</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setResolvedLocationMeta(null);
                selectStationDirectly('TN', 'TN_CHE', 'IMD_CHE_SAIDAPET');
              }}
              className="text-[11px] font-medium text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              Reset Baseline
            </button>
          </div>
        </div>
      )}

      {/* Geolocation Error Alert if Triggered */}
      {geoError && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 text-amber-200 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-amber-100">{geoError.message}</h4>
              <p className="text-xs text-amber-300/80 mt-0.5">{geoError.suggestion}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setGeoError(null)}
            className="text-amber-400 hover:text-white text-xs font-medium px-2 py-0.5 rounded bg-amber-900/40 hover:bg-amber-900/60 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Controls Container: Search Bar, Use Current Location & Dependent Dropdowns */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-4">
        {/* Row 1: Search Box & Use Current Location Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <LocationSearchBar onSelectStation={handleSelectFromSearch} />
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <CurrentLocationButton
              onStationResolved={handleCurrentLocationResolved}
              onError={(err) => setGeoError(err)}
            />
          </div>
        </div>

        {/* Subtle Divider */}
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-semibold text-slate-500">
            <span className="bg-slate-900 px-3 tracking-wider">
              or select hierarchically
            </span>
          </div>
        </div>

        {/* Row 2: Dependent Dropdowns (State / UT -> District -> Station) */}
        <LocationSelector
          states={states}
          districts={districts}
          stations={stations}
          selectedStateId={selectedStateId}
          selectedDistrictId={selectedDistrictId}
          selectedStationId={selectedStationId}
          onSelectState={handleSelectState}
          onSelectDistrict={handleSelectDistrict}
          onSelectStation={handleSelectStation}
          isLoadingDistricts={isLoadingDistricts}
          isLoadingStations={isLoadingStations}
        />
      </div>

      {/* Main Weather Display Area */}
      {isLoadingWeather && !weatherData ? (
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-12 text-center">
          <RefreshCw className="w-7 h-7 text-blue-400 animate-spin mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-200">
            Querying IMD AWS Telemetry Station...
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Loading telemetry feed for station <code className="text-blue-300 font-mono">{selectedStationId}</code>
          </p>
        </div>
      ) : errorMessage ? (
        <div className="rounded-2xl bg-rose-950/20 border border-rose-800/80 p-6 text-center">
          <AlertTriangle className="w-7 h-7 text-rose-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-rose-200">
            Weather Station Telemetry Error
          </h4>
          <p className="text-xs text-rose-300/90 mt-1 max-w-md mx-auto">
            {errorMessage}
          </p>
          <div className="mt-3.5 flex items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => fetchWeatherForStation(selectedStationId)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              Retry Connection
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedStateId('TN');
                setSelectedDistrictId('TN_CHE');
                setSelectedStationId('IMD_CHE_SAIDAPET');
              }}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Load Chennai (Saidapet) Baseline
            </button>
          </div>
        </div>
      ) : weatherData ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* 1. Hero Weather Card: Station name, lat/long, observation time, Verified AWS, temperature, sky condition */}
          <HeroWeatherCard
            weatherData={weatherData}
            onRefresh={handleRefreshTelemetry}
            isRefreshing={isRefreshingTelemetry}
          />

          {/* 2. Weather Metrics Grid: Humidity, Dew Point, Wind, Pressure, Air Quality, Rainfall */}
          <WeatherMetricsGrid weather={weatherData.weather} />

          {/* Primary Demo Scenario Cross-Link Banner (if Chennai Saidapet is selected) */}
          {weatherData.station_id === 'IMD_CHE_SAIDAPET' && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-500/40 text-amber-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-100">
                      Primary Disaster Scenario Cross-Correlation Active
                    </span>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 uppercase">
                      Hero Event
                    </span>
                  </div>
                  <p className="text-xs text-amber-300/80 mt-0.5 leading-snug">
                    This station&apos;s 84.5 mm rainfall reading correlates directly with the <strong>Chennai Adyar River & Saidapet Flash Flood Event</strong> in the verification and operational action modules.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onSwitchToModule3 && (
                  <button
                    type="button"
                    onClick={() => onSwitchToModule3('EVT-CHE-202611-001')}
                    className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>AI Verification</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {onSwitchToModule4 && (
                  <button
                    type="button"
                    onClick={() => onSwitchToModule4('EVT-CHE-202611-001')}
                    className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>Action Panel</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 3. ML Pipeline Readiness Architecture Card */}
          <MLPipelineReadinessCard
            verification={weatherData.verification}
            mlPreview={weatherData.ml_verification}
          />
        </div>
      ) : null}

      {/* Real-time Telemetry Truth Audit Modal */}
      {weatherData && (
        <TruthVerificationModal
          isOpen={isTruthAuditOpen}
          onClose={() => setIsTruthAuditOpen(false)}
          weatherData={weatherData}
        />
      )}
    </div>
  );
};
