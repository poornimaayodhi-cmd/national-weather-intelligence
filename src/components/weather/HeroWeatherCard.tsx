import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  ShieldCheck,
  RefreshCw,
  Sun,
  CloudRain,
  CloudLightning,
  Cloud,
  CloudSun,
  Wind,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Navigation,
  Info,
} from 'lucide-react';
import { StationWeatherData } from '../../types/weather.ts';
import { formatCoordinates } from '../../services/locationService.ts';
import { TruthVerificationModal } from './TruthVerificationModal.tsx';

interface HeroWeatherCardProps {
  weatherData: StationWeatherData;
  onRefresh: () => Promise<void>;
  isRefreshing?: boolean;
}

export const HeroWeatherCard: React.FC<HeroWeatherCardProps> = ({
  weatherData,
  onRefresh,
  isRefreshing = false,
}) => {
  const [isTruthModalOpen, setIsTruthModalOpen] = useState(false);

  const {
    station_name,
    station_type,
    latitude,
    longitude,
    elevation_meters,
    observation_time_ist,
    observation_time_local,
    timezone,
    verification,
    truth_verification,
    weather,
    is_current_location,
  } = weatherData;

  const isTrueRealTime = truth_verification?.is_real_time_true ?? true;

  const getWeatherIcon = (code: string) => {
    switch (code) {
      case 'thunderstorm':
        return <CloudLightning className="w-12 h-12 text-amber-400 animate-pulse" />;
      case 'rain':
        return <CloudRain className="w-12 h-12 text-sky-400" />;
      case 'cloudy':
        return <Cloud className="w-12 h-12 text-slate-300" />;
      case 'partly_cloudy':
        return <CloudSun className="w-12 h-12 text-amber-300" />;
      case 'sunny':
        return <Sun className="w-12 h-12 text-amber-400" />;
      case 'mist':
      case 'haze':
        return <Wind className="w-12 h-12 text-slate-400" />;
      default:
        return <CloudRain className="w-12 h-12 text-blue-400" />;
    }
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-5 sm:p-6 shadow-md transition-all duration-200">
        {/* Subtle radial ambient glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

        {/* Top Header: Station Name & Status */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {is_current_location && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/40 animate-pulse">
                  <Navigation className="w-3 h-3 text-blue-300" />
                  Your Current Location
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                <Radio className="w-3 h-3 text-blue-400" />
                {station_type}
              </span>
              {isTrueRealTime && (
                <button
                  type="button"
                  onClick={() => setIsTruthModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors cursor-pointer"
                  title="Click to view sensor telemetry verification details"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% Real-Time True Weather</span>
                  <Info className="w-3 h-3 text-emerald-400/80 ml-0.5" />
                </button>
              )}
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                Source: <strong className="text-slate-200 font-semibold">{truth_verification?.provider || 'Live Surface Sensors'}</strong>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{station_name}</span>
            </h2>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1.5 text-xs text-slate-400">
              <span className="flex items-center gap-1 font-mono text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                {formatCoordinates(latitude, longitude)}
              </span>
              <span className="text-slate-600">•</span>
              <span>Elevation: <strong className="text-slate-300 font-medium">{elevation_meters}m</strong> ASL</span>
              <span className="text-slate-600">•</span>
              <span>Region: <strong className="text-slate-300 font-medium">{weatherData.state_name}</strong></span>
              {verification.wmo_station_code && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="font-mono text-slate-400">WMO: {verification.wmo_station_code}</span>
                </>
              )}
            </div>
          </div>

          {/* Observation Time & Manual Refresh Action */}
          <div className="flex flex-col sm:items-end justify-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                Observed: <strong className="text-slate-100 font-mono font-medium">{observation_time_local || observation_time_ist}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 rounded-lg text-xs font-medium border border-slate-700/80 transition-colors shadow-xs cursor-pointer"
                title="Request latest live observation telemetry from instruments"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
                <span>{isRefreshing ? 'Querying Sensors...' : 'Refresh Live Telemetry'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsTruthModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium hover:text-emerald-300 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                True Live Sensors
              </button>
            </div>
          </div>
        </div>

      {/* Main Meteorological Hero Numbers */}
      <div className="relative z-10 pt-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left: Prominent Temp & Condition */}
        <div className="md:col-span-7 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shrink-0 flex items-center justify-center shadow-xs">
            {getWeatherIcon(weather.weather_code)}
          </div>

          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight">
                {weather.temperature_c.toFixed(1)}
                <span className="text-2xl sm:text-3xl font-light text-slate-400 ml-1">°C</span>
              </span>
              <div className="text-xs text-slate-300 bg-slate-950/60 border border-slate-800/80 px-2.5 py-1 rounded-lg">
                <span className="text-slate-400">Feels like </span>
                <span className="font-semibold text-white">{weather.feels_like_c.toFixed(1)}°C</span>
              </div>
            </div>

            <div className="text-lg font-semibold text-slate-100 mt-1.5">
              {weather.sky_condition}
            </div>

            <div className="flex items-center gap-2.5 mt-1.5 text-xs text-slate-400">
              <span>Today&apos;s Range:</span>
              <span className="text-rose-300 font-medium">Max {weather.temp_max_today_c.toFixed(1)}°C</span>
              <span className="text-slate-600">/</span>
              <span className="text-sky-300 font-medium">Min {weather.temp_min_today_c.toFixed(1)}°C</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Highlights Strip */}
        <div className="md:col-span-5 grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Rainfall Today
            </span>
            <div className="my-1">
              <span className="text-2xl font-bold text-sky-400 font-mono">
                {weather.rainfall_today_mm.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400 font-medium ml-1">mm</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {weather.rainfall_category}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Wind Vector
            </span>
            <div className="my-1">
              <span className="text-2xl font-bold text-slate-100 font-mono">
                {weather.wind_speed_kmh}
              </span>
              <span className="text-xs text-slate-400 font-medium ml-1">km/h</span>
            </div>
            <span className="text-[11px] text-blue-300 font-medium flex items-center gap-1">
              <Compass className="w-3 h-3 text-blue-400" />
              {weather.wind_direction_cardinal} ({weather.wind_direction_deg}°)
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Real-time Telemetry Truth Audit Modal */}
    <TruthVerificationModal
      isOpen={isTruthModalOpen}
      onClose={() => setIsTruthModalOpen(false)}
      weatherData={weatherData}
    />
  </>
  );
};
