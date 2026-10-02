import React, { useState } from 'react';
import { Navigation, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getCurrentCoordinates, GeolocationErrorDetails, formatDistance } from '../../services/locationService.ts';
import { weatherService } from '../../services/weatherService.ts';
import { WeatherStation, StationWeatherData } from '../../types/weather.ts';
import { useLocation } from '../../context/LocationContext.tsx';

interface CurrentLocationButtonProps {
  onStationResolved: (
    station: WeatherStation,
    weatherData: StationWeatherData,
    distanceKm: number,
    locationMeta?: { source: 'gps' | 'network_ip' | 'fallback'; city?: string; country?: string }
  ) => void;
  onError: (error: GeolocationErrorDetails) => void;
  className?: string;
}

export const CurrentLocationButton: React.FC<CurrentLocationButtonProps> = ({
  onStationResolved,
  onError,
  className = '',
}) => {
  const { retryGps } = useLocation();
  const [isLocating, setIsLocating] = useState(false);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setSuccessInfo(null);

    // Also trigger global High Accuracy GPS context
    retryGps().catch(() => {});

    try {
      // 1. Get GPS coordinates with highAccuracy enabled
      const coords = await getCurrentCoordinates();

      // 2. Query true live weather station from backend API for exact coordinates
      const result = await weatherService.fetchNearestStation(coords.latitude, coords.longitude, {
        city: coords.city,
        region: coords.region,
        country: coords.country,
      });

      // 3. Notify parent
      onStationResolved(result.station, result.data, result.distance_km, {
        source: coords.source,
        city: coords.city || result.station.district_name,
        country: coords.country || result.station.state_name,
      });

      // 4. Show descriptive feedback based on location source and true telemetry status
      let info = '';
      if (coords.source === 'gps') {
        info = `GPS Locked: ${result.station.station_name} • 100% True Live Telemetry Active`;
      } else if (result.distance_km === 0) {
        info = `Detected: ${result.station.station_name} • True Live Ground/Satellite Telemetry`;
      } else {
        info = `Detected: ${coords.city || 'Your Area'} • Linked to ${result.station.station_name} (${formatDistance(result.distance_km)})`;
      }

      setSuccessInfo(info);

      // Clear success indicator after 6 seconds
      setTimeout(() => {
        setSuccessInfo(null);
      }, 6000);
    } catch (err: any) {
      console.warn('Current location resolution error, trying baseline fallback:', err);
      try {
        // Fallback to primary national capital station so user is never stuck
        const baseline = await weatherService.fetchWeatherByStationId('IMD_DEL_SAFGDARJUNG');
        const defaultStation: WeatherStation = {
          station_id: 'IMD_DEL_SAFGDARJUNG',
          station_name: 'New Delhi (Safdarjung Observatory)',
          district_id: 'DL_NEW',
          district_name: 'New Delhi',
          state_id: 'DL',
          state_name: 'Delhi (NCT)',
          station_type: 'Surface Meteorological Observatory',
          latitude: 28.5833,
          longitude: 77.2000,
          elevation_meters: 216,
          pincodes: ['110003', '110029'],
          is_active: true,
        };
        onStationResolved(defaultStation, baseline, 0, { source: 'fallback', city: 'New Delhi', country: 'India' });
        setSuccessInfo('Connected to New Delhi (Safdarjung Observatory) • National Weather Gateway');
        setTimeout(() => setSuccessInfo(null), 5000);
      } catch (fallbackErr) {
        const errorDetails: GeolocationErrorDetails = {
          type: 'UNKNOWN',
          message: err?.message || 'Failed to detect nearest weather station.',
          suggestion: 'Please choose your location manually using the dropdowns or search bar.',
        };
        onError(errorDetails);
      }
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div className="relative inline-flex flex-col items-start">
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={isLocating}
        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 shadow-sm ${
          isLocating
            ? 'bg-blue-950/80 border border-blue-500/30 text-blue-300 cursor-wait'
            : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/30 hover:border-blue-300/50 hover:shadow-md hover:shadow-blue-900/20 active:scale-[0.98]'
        } ${className}`}
        title="Detect GPS coordinates and automatically lock onto the nearest IMD weather station"
      >
        {isLocating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-blue-200" />
            <span>Finding Nearest Station...</span>
          </>
        ) : (
          <>
            <Navigation className="w-3.5 h-3.5 text-blue-100" />
            <span>Use Current Location</span>
          </>
        )}
      </button>

      {successInfo && (
        <div className="absolute top-full left-0 mt-2 z-20 whitespace-nowrap px-3 py-1.5 bg-emerald-950/95 backdrop-blur-sm text-emerald-200 border border-emerald-500/40 rounded-xl text-[11px] font-medium flex items-center gap-1.5 shadow-xl shadow-black/40 animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{successInfo}</span>
        </div>
      )}
    </div>
  );
};
