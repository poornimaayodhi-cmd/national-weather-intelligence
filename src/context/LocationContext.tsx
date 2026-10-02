import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { weatherService } from '../services/weatherService.ts';
import { fetchIpGeolocation } from '../services/locationService.ts';
import { StationWeatherData, WeatherStation } from '../types/weather.ts';

export type LocationLevel = 'GPS' | 'APPROXIMATE' | 'MANUAL';

export interface ResolvedLocation {
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  level: LocationLevel;
  mode: 'gps' | 'approximate' | 'manual';
  displayText: string;
  timestamp: number;
  station?: WeatherStation;
  weatherData?: StationWeatherData;
}

export interface CityHierarchyItem {
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  stationId?: string;
  label: string;
}

export const SUPPORTED_LOCATIONS_HIERARCHY: CityHierarchyItem[] = [
  // India - Tamil Nadu
  { city: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0150, longitude: 80.2210, stationId: 'IMD_CHE_SAIDAPET', label: 'Chennai, Tamil Nadu' },
  { city: 'Coimbatore', state: 'Tamil Nadu', country: 'India', latitude: 11.0168, longitude: 76.9558, label: 'Coimbatore, Tamil Nadu' },
  { city: 'Madurai', state: 'Tamil Nadu', country: 'India', latitude: 9.9252, longitude: 78.1198, label: 'Madurai, Tamil Nadu' },
  { city: 'Cuddalore', state: 'Tamil Nadu', country: 'India', latitude: 11.7480, longitude: 79.7714, stationId: 'IMD_TN_CUDDALORE', label: 'Cuddalore, Tamil Nadu' },
  { city: 'Salem', state: 'Tamil Nadu', country: 'India', latitude: 11.6643, longitude: 78.1460, label: 'Salem, Tamil Nadu' },
  { city: 'Tiruchirappalli', state: 'Tamil Nadu', country: 'India', latitude: 10.7905, longitude: 78.7047, label: 'Tiruchirappalli, Tamil Nadu' },

  // India - Delhi (NCT)
  { city: 'New Delhi', state: 'Delhi (NCT)', country: 'India', latitude: 28.5833, longitude: 77.2000, stationId: 'IMD_DEL_SAFGDARJUNG', label: 'New Delhi, Delhi (NCT)' },

  // India - Maharashtra
  { city: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 19.0760, longitude: 72.8777, stationId: 'IMD_MUM_COLABA', label: 'Mumbai, Maharashtra' },
  { city: 'Pune', state: 'Maharashtra', country: 'India', latitude: 18.5204, longitude: 73.8567, stationId: 'IMD_PUN_SHIVAJINAGAR', label: 'Pune, Maharashtra' },
  { city: 'Nagpur', state: 'Maharashtra', country: 'India', latitude: 21.1458, longitude: 79.0882, label: 'Nagpur, Maharashtra' },

  // India - Karnataka
  { city: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946, stationId: 'IMD_BLR_CITY', label: 'Bengaluru, Karnataka' },
  { city: 'Mysuru', state: 'Karnataka', country: 'India', latitude: 12.2958, longitude: 76.6394, label: 'Mysuru, Karnataka' },
  { city: 'Mangaluru', state: 'Karnataka', country: 'India', latitude: 12.9141, longitude: 74.8560, label: 'Mangaluru, Karnataka' },

  // India - West Bengal
  { city: 'Kolkata', state: 'West Bengal', country: 'India', latitude: 22.5726, longitude: 88.3639, stationId: 'IMD_KOL_ALIPORE', label: 'Kolkata, West Bengal' },
  { city: 'Darjeeling', state: 'West Bengal', country: 'India', latitude: 27.0410, longitude: 88.2663, label: 'Darjeeling, West Bengal' },

  // India - Telangana
  { city: 'Hyderabad', state: 'Telangana', country: 'India', latitude: 17.3850, longitude: 78.4867, stationId: 'IMD_HYD_BEGUMPET', label: 'Hyderabad, Telangana' },

  // India - Kerala
  { city: 'Kochi', state: 'Kerala', country: 'India', latitude: 9.9312, longitude: 76.2673, stationId: 'IMD_KOC_NAVAL', label: 'Kochi, Kerala' },
  { city: 'Thiruvananthapuram', state: 'Kerala', country: 'India', latitude: 8.5241, longitude: 76.9366, label: 'Thiruvananthapuram, Kerala' },

  // India - Gujarat
  { city: 'Ahmedabad', state: 'Gujarat', country: 'India', latitude: 23.0225, longitude: 72.5714, stationId: 'IMD_AHM_AIRPORT', label: 'Ahmedabad, Gujarat' },
  { city: 'Surat', state: 'Gujarat', country: 'India', latitude: 21.1702, longitude: 72.8311, label: 'Surat, Gujarat' },

  // India - Andhra Pradesh
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India', latitude: 17.6868, longitude: 83.2185, label: 'Visakhapatnam, Andhra Pradesh' },
  { city: 'Vijayawada', state: 'Andhra Pradesh', country: 'India', latitude: 16.5062, longitude: 80.6480, label: 'Vijayawada, Andhra Pradesh' },

  // India - Uttar Pradesh
  { city: 'Lucknow', state: 'Uttar Pradesh', country: 'India', latitude: 26.8467, longitude: 80.9462, label: 'Lucknow, Uttar Pradesh' },
  { city: 'Varanasi', state: 'Uttar Pradesh', country: 'India', latitude: 25.3176, longitude: 82.9739, label: 'Varanasi, Uttar Pradesh' },

  // India - Rajasthan
  { city: 'Jaipur', state: 'Rajasthan', country: 'India', latitude: 26.9124, longitude: 75.7873, label: 'Jaipur, Rajasthan' },

  // India - Odisha
  { city: 'Bhubaneswar', state: 'Odisha', country: 'India', latitude: 20.2961, longitude: 85.8245, label: 'Bhubaneswar, Odisha' },

  // International Options
  { city: 'Tokyo', state: 'Kanto', country: 'Japan', latitude: 35.6762, longitude: 139.6503, label: 'Tokyo, Japan' },
  { city: 'London', state: 'England', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, label: 'London, United Kingdom' },
  { city: 'New York', state: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, label: 'New York, United States' },
  { city: 'Singapore', state: 'Central Region', country: 'Singapore', latitude: 1.3521, longitude: 103.8198, label: 'Singapore, Singapore' },
  { city: 'Dubai', state: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, label: 'Dubai, United Arab Emirates' },
];

export interface LocationContextType {
  location: ResolvedLocation;
  isGpsPending: boolean;
  isApproxPending: boolean;
  currentLevel: LocationLevel;
  retryGps: () => Promise<void>;
  selectLocation: (selection: { city: string; state: string; country: string; latitude: number; longitude: number }) => Promise<void>;
  isSelectorModalOpen: boolean;
  openSelectorModal: () => void;
  closeSelectorModal: () => void;
  availableLocations: CityHierarchyItem[];
}

// Build standard display text as specified in prompt:
// Level 1: 📍 Chennai, Tamil Nadu • GPS
// Level 2: 📍 Chennai, Tamil Nadu • Approximate Location
// Level 3: 📍 Chennai, Tamil Nadu • Manual
export function formatLocationDisplay(city: string, state: string, level: LocationLevel): string {
  const levelTag =
    level === 'GPS'
      ? 'GPS'
      : level === 'APPROXIMATE'
      ? 'Approximate Location'
      : 'Manual';
  return `📍 ${city}, ${state} • ${levelTag}`;
}

const DEFAULT_MANUAL_LOCATION: ResolvedLocation = {
  city: 'Chennai',
  state: 'Tamil Nadu',
  country: 'India',
  latitude: 13.0150,
  longitude: 80.2210,
  level: 'MANUAL',
  mode: 'manual',
  displayText: formatLocationDisplay('Chennai', 'Tamil Nadu', 'MANUAL'),
  timestamp: Date.now(),
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<ResolvedLocation>(DEFAULT_MANUAL_LOCATION);
  const [isGpsPending, setIsGpsPending] = useState(false);
  const [isApproxPending, setIsApproxPending] = useState(false);
  const [isSelectorModalOpen, setIsSelectorModalOpen] = useState(false);

  // Helper: query live weather telemetry for resolved coordinates
  const enrichWithTelemetry = useCallback(
    async (
      city: string,
      state: string,
      country: string,
      lat: number,
      lon: number,
      level: LocationLevel,
      accuracy?: number
    ): Promise<ResolvedLocation> => {
      let resolvedStation: WeatherStation | undefined;
      let resolvedWeather: StationWeatherData | undefined;

      try {
        const nearest = await weatherService.fetchNearestStation(lat, lon, { city, region: state, country });
        resolvedStation = nearest.station;
        resolvedWeather = nearest.data;
      } catch (err) {
        console.warn('Weather telemetry lookup notice:', err);
      }

      const mode = level === 'GPS' ? 'gps' : level === 'APPROXIMATE' ? 'approximate' : 'manual';

      return {
        city,
        state,
        country,
        latitude: lat,
        longitude: lon,
        accuracy,
        level,
        mode,
        displayText: formatLocationDisplay(city, state, level),
        timestamp: Date.now(),
        station: resolvedStation,
        weatherData: resolvedWeather,
      };
    },
    []
  );

  // Reverse geocoding for GPS coordinates
  const reverseGeocode = async (
    lat: number,
    lon: number
  ): Promise<{ city: string; state: string; country: string }> => {
    // 1. Check nearest station from backend (fast & accurate for Indian IMD grid)
    try {
      const nearest = await weatherService.fetchNearestStation(lat, lon);
      if (nearest && nearest.station) {
        return {
          city: nearest.station.district_name || 'Chennai',
          state: nearest.station.state_name || 'Tamil Nadu',
          country: 'India',
        };
      }
    } catch {
      // fallback to reverse geocode service
    }

    // 2. Client-side reverse geocoding
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
        { signal: AbortSignal.timeout(3000) }
      );
      if (res.ok) {
        const data = await res.json();
        return {
          city: data.city || data.locality || data.principalSubdivision || 'Detected City',
          state: data.principalSubdivision || 'Local Region',
          country: data.countryName || 'India',
        };
      }
    } catch {
      // fallback
    }

    return {
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
    };
  };

  // LEVEL 2: Approximate Location Fallback
  const executeLevel2Approximate = useCallback(async () => {
    setIsApproxPending(true);
    try {
      const geo = await fetchIpGeolocation();
      // Verify valid city & region from approximate geolocation without ever exposing IP
      if (geo.city && (geo.region || geo.country)) {
        const city = geo.city;
        const state = geo.region || 'India';
        const country = geo.country || 'India';

        const enriched = await enrichWithTelemetry(
          city,
          state,
          country,
          geo.latitude,
          geo.longitude,
          'APPROXIMATE'
        );

        setLocation(enriched);
        setIsApproxPending(false);
        return true;
      }
    } catch (approxErr) {
      console.warn('Level 2 Approximate location check failed:', approxErr);
    }

    setIsApproxPending(false);
    return false;
  }, [enrichWithTelemetry]);

  // LEVEL 3: Manual Location Fallback
  const executeLevel3Manual = useCallback(
    async (defaultItem?: CityHierarchyItem) => {
      const item = defaultItem || SUPPORTED_LOCATIONS_HIERARCHY[0]; // Chennai, Tamil Nadu
      const enriched = await enrichWithTelemetry(
        item.city,
        item.state,
        item.country,
        item.latitude,
        item.longitude,
        'MANUAL'
      );
      setLocation(enriched);
    },
    [enrichWithTelemetry]
  );

  // LEVEL 1: GPS Browser Geolocation
  const executeLevel1Gps = useCallback(
    async (isUserInitiated = false) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        // GPS not supported -> proceed to Level 2
        const approxOk = await executeLevel2Approximate();
        if (!approxOk) await executeLevel3Manual();
        return;
      }

      setIsGpsPending(true);

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: isUserInitiated ? 7000 : 4500, // fast timeout so user never waits
        maximumAge: isUserInitiated ? 0 : 60000,
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setIsGpsPending(false);
          const { latitude, longitude, accuracy } = position.coords;

          try {
            // Reverse-geocode coordinates to get City, State, Country
            const geo = await reverseGeocode(latitude, longitude);

            const enriched = await enrichWithTelemetry(
              geo.city,
              geo.state,
              geo.country,
              latitude,
              longitude,
              'GPS',
              accuracy
            );

            setLocation(enriched);
          } catch (enrichErr) {
            console.warn('GPS location resolved, error during enrichment:', enrichErr);
            // Still mark as GPS with resolved baseline
            setLocation({
              city: 'Chennai',
              state: 'Tamil Nadu',
              country: 'India',
              latitude,
              longitude,
              accuracy,
              level: 'GPS',
              mode: 'gps',
              displayText: formatLocationDisplay('Chennai', 'Tamil Nadu', 'GPS'),
              timestamp: Date.now(),
            });
          }
        },
        async (geoError) => {
          setIsGpsPending(false);
          console.info('Level 1 GPS unavailable/denied in current environment. Stepping to Level 2 Approximate Location:', geoError.message);

          // Proceed to Level 2: Approximate Location
          const approxSuccess = await executeLevel2Approximate();
          if (!approxSuccess) {
            // Proceed to Level 3: Manual Location
            await executeLevel3Manual();
          }
        },
        options
      );
    },
    [enrichWithTelemetry, executeLevel2Approximate, executeLevel3Manual]
  );

  // Initial Location Discovery following Priority: GPS → Approximate → Manual
  useEffect(() => {
    // Check permission state non-intrusively first
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((perm) => {
          if (perm.state === 'granted') {
            executeLevel1Gps(false);
          } else if (perm.state === 'denied') {
            // Denied in preview/browser settings -> immediately go to Level 2 without blocking
            executeLevel2Approximate().then((ok) => {
              if (!ok) executeLevel3Manual();
            });
          } else {
            // Prompt state -> attempt Level 1 once
            executeLevel1Gps(false);
          }
        })
        .catch(() => {
          executeLevel1Gps(false);
        });
    } else {
      executeLevel1Gps(false);
    }
  }, [executeLevel1Gps, executeLevel2Approximate, executeLevel3Manual]);

  // User-initiated Retry GPS
  const retryGps = useCallback(async () => {
    await executeLevel1Gps(true);
  }, [executeLevel1Gps]);

  // User manual selection
  const selectLocation = useCallback(
    async (selection: { city: string; state: string; country: string; latitude: number; longitude: number }) => {
      const enriched = await enrichWithTelemetry(
        selection.city,
        selection.state,
        selection.country,
        selection.latitude,
        selection.longitude,
        'MANUAL'
      );
      setLocation(enriched);
      setIsSelectorModalOpen(false);
    },
    [enrichWithTelemetry]
  );

  return (
    <LocationContext.Provider
      value={{
        location,
        isGpsPending,
        isApproxPending,
        currentLevel: location.level,
        retryGps,
        selectLocation,
        isSelectorModalOpen,
        openSelectorModal: () => setIsSelectorModalOpen(true),
        closeSelectorModal: () => setIsSelectorModalOpen(false),
        availableLocations: SUPPORTED_LOCATIONS_HIERARCHY,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
