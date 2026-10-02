import React from 'react';
import {
  CloudRain,
  Droplets,
  Wind,
  Gauge,
  Activity,
  Sun,
  Eye,
  CloudFog,
  TrendingDown,
  TrendingUp,
  Minus,
  Sparkles,
  Compass,
} from 'lucide-react';
import { WeatherConditions, RainfallCategory, AQICategory } from '../../types/weather.ts';

interface WeatherMetricsGridProps {
  weather: WeatherConditions;
}

export const WeatherMetricsGrid: React.FC<WeatherMetricsGridProps> = ({ weather }) => {
  // IMD rainfall category badge color
  const getRainfallBadge = (category: RainfallCategory) => {
    switch (category) {
      case 'Extremely Heavy':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
      case 'Very Heavy':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
      case 'Heavy':
        return 'bg-red-500/10 text-red-300 border-red-500/20';
      case 'Moderate':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'Light':
      case 'Very Light':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // AQI color badge
  const getAQIBadge = (category: AQICategory) => {
    switch (category) {
      case 'Good':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
      case 'Satisfactory':
        return 'bg-teal-500/10 text-teal-300 border-teal-500/20';
      case 'Moderate':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'Poor':
        return 'bg-orange-500/10 text-orange-300 border-orange-500/20';
      case 'Very Poor':
      case 'Severe':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getPressureTrendIcon = (trend: WeatherConditions['pressure_trend']) => {
    switch (trend) {
      case 'Rising':
        return (
          <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> Rising
          </span>
        );
      case 'Falling':
        return (
          <span className="flex items-center gap-1 text-rose-400 text-xs font-medium">
            <TrendingDown className="w-3.5 h-3.5" /> Falling
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-slate-400 text-xs font-medium">
            <Minus className="w-3.5 h-3.5" /> Steady
          </span>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* 1. RAINFALL TODAY */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between min-h-[175px]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <CloudRain className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Rainfall Today
              </h4>
              <span className="text-[10px] text-slate-400">Cumulative 08:30 IST to Now</span>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border uppercase tracking-wider ${getRainfallBadge(
              weather.rainfall_category
            )}`}
          >
            {weather.rainfall_category}
          </span>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {weather.rainfall_today_mm.toFixed(1)}
            </span>
            <span className="text-sm font-medium text-slate-400">mm</span>
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>Precipitation Rate:</span>
            <strong className="text-sky-300 font-mono font-medium">{weather.rainfall_rate_mm_hr.toFixed(1)} mm/hr</strong>
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>IMD Scale:</span>
          <span className="text-slate-300 font-medium">
            {weather.rainfall_today_mm > 64.4 ? 'Heavy Alert (>64.5 mm)' : 'Normal (<64.5 mm)'}
          </span>
        </div>
      </div>

      {/* 2. HUMIDITY & DEW POINT */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between min-h-[175px]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Relative Humidity
              </h4>
              <span className="text-[10px] text-slate-400">Moisture Content</span>
            </div>
          </div>
          <span className="text-xs font-mono font-medium text-slate-300 bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800">
            Dew Pt: {weather.dew_point_c.toFixed(1)}°C
          </span>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {weather.humidity_percent}
            </span>
            <span className="text-sm font-medium text-slate-400">%</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                weather.humidity_percent > 85
                  ? 'bg-blue-500'
                  : weather.humidity_percent > 60
                  ? 'bg-cyan-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, weather.humidity_percent)}%` }}
            />
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Dew Point Temperature:</span>
          <strong className="text-blue-300 font-mono font-medium">{weather.dew_point_c.toFixed(1)}°C</strong>
        </div>
      </div>

      {/* 3. WIND SPEED & DIRECTION */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between min-h-[175px]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Wind Speed & Direction
              </h4>
              <span className="text-[10px] text-slate-400">10m Cup Anemometer</span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
            <Compass className="w-3 h-3 text-teal-400" />
            {weather.wind_direction_cardinal}
          </span>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {weather.wind_speed_kmh}
            </span>
            <span className="text-sm font-medium text-slate-400">km/h</span>
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>Heading / Azimuth:</span>
            <span className="text-slate-200 font-mono font-medium">{weather.wind_direction_deg}° ({weather.wind_direction_cardinal})</span>
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Peak Gust Observed:</span>
          <strong className="text-amber-300 font-mono font-medium">{weather.wind_gust_kmh} km/h</strong>
        </div>
      </div>

      {/* 4. ATMOSPHERIC PRESSURE */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between min-h-[175px]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Atmospheric Pressure
              </h4>
              <span className="text-[10px] text-slate-400">Mean Sea Level (MSLP)</span>
            </div>
          </div>
          {getPressureTrendIcon(weather.pressure_trend)}
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {weather.pressure_hpa.toFixed(1)}
            </span>
            <span className="text-sm font-medium text-slate-400">hPa / mb</span>
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>Barometric Standard:</span>
            <span className="text-slate-300 font-mono text-[11px]">1013.25 hPa nominal</span>
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Trend Direction:</span>
          <span className="text-slate-300 font-medium">{weather.pressure_trend} trend</span>
        </div>
      </div>

      {/* 5. AIR QUALITY INDEX */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between min-h-[175px]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Air Quality Index (AQI)
              </h4>
              <span className="text-[10px] text-slate-400">CPCB Station Proximity</span>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border uppercase tracking-wider ${getAQIBadge(
              weather.aqi_category
            )}`}
          >
            {weather.aqi_category}
          </span>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {weather.air_quality_index}
            </span>
            <span className="text-sm font-medium text-slate-400">AQI</span>
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>Particulates:</span>
            <span className="text-slate-300 font-mono text-[11px]">PM2.5: {weather.pm25} • PM10: {weather.pm10}</span>
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Pollution Level:</span>
          <span className="text-slate-300 font-medium">{weather.aqi_category}</span>
        </div>
      </div>

      {/* 6. SOLAR & VISIBILITY & CLOUD COVER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between min-h-[175px]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Radiation & Visibility
              </h4>
              <span className="text-[10px] text-slate-400">Optical Transmissometer</span>
            </div>
          </div>
          <span className="text-xs font-mono font-medium text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
            UV Index {weather.uv_index}
          </span>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {weather.visibility_km.toFixed(1)}
            </span>
            <span className="text-sm font-medium text-slate-400">km visibility</span>
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>Solar Radiation:</span>
            <span className="text-slate-300 font-mono text-[11px]">{weather.solar_radiation_w_m2} W/m²</span>
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Cloud Cover:</span>
          <strong className="text-slate-200 font-mono font-medium">{weather.cloud_cover_octas}/8 Octas</strong>
        </div>
      </div>
    </div>
  );
};
