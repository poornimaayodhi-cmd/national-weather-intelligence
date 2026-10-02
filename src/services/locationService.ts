export interface GeolocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  source: 'gps' | 'network_ip' | 'fallback';
  city?: string;
  region?: string;
  country?: string;
  isIpFallback?: boolean;
}

export type GeolocationErrorType =
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'UNSUPPORTED'
  | 'UNKNOWN';

export interface GeolocationErrorDetails {
  type: GeolocationErrorType;
  message: string;
  suggestion: string;
}

/**
 * Fallback to IP-based network geolocation via backend proxy and public geo APIs
 */
export async function fetchIpGeolocation(): Promise<GeolocationResult> {
  // 1. Backend proxy /api/weather/ip-location (prevents CORS and mixed-content issues)
  try {
    const res = await fetch('/api/weather/ip-location', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data.success && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: 5000,
          source: 'network_ip',
          city: data.city,
          region: data.region,
          country: data.country,
          isIpFallback: true,
        };
      }
    }
  } catch (backendErr) {
    console.warn('Backend /api/weather/ip-location failed, attempting public geo endpoint:', backendErr);
  }

  // 2. Client-side public GeoJS endpoint
  try {
    const geoRes = await fetch('https://get.geojs.io/v1/ip/geo.json', { signal: AbortSignal.timeout(3500) });
    if (geoRes.ok) {
      const g = await geoRes.json();
      const lat = parseFloat(g.latitude);
      const lon = parseFloat(g.longitude);
      if (!isNaN(lat) && !isNaN(lon)) {
        return {
          latitude: lat,
          longitude: lon,
          accuracy: 5000,
          source: 'network_ip',
          city: g.city,
          region: g.region,
          country: g.country,
          isIpFallback: true,
        };
      }
    }
  } catch (geoErr) {
    console.warn('Public geojs failed, attempting ipwho.is:', geoErr);
  }

  // 3. Client-side public ipwho.is endpoint
  try {
    const ipwhoRes = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(3500) });
    if (ipwhoRes.ok) {
      const w = await ipwhoRes.json();
      if (w.success !== false && typeof w.latitude === 'number' && typeof w.longitude === 'number') {
        return {
          latitude: w.latitude,
          longitude: w.longitude,
          accuracy: 5000,
          source: 'network_ip',
          city: w.city,
          region: w.region,
          country: w.country,
          isIpFallback: true,
        };
      }
    }
  } catch (ipwhoErr) {
    console.warn('Public ipwho failed:', ipwhoErr);
  }

  // 4. Default Indian National Met Gateway (New Delhi Safdarjung)
  return {
    latitude: 28.5833,
    longitude: 77.2000,
    accuracy: 10000,
    source: 'fallback',
    city: 'New Delhi',
    region: 'Delhi',
    country: 'India',
    isIpFallback: true,
  };
}

/**
 * Service handling HTML5 browser geolocation with automatic seamless IP-network fallback.
 * Guaranteed to resolve coordinates without leaving the user stranded.
 */
export async function getCurrentCoordinates(): Promise<GeolocationResult> {
  // Step 1: If browser supports geolocation, try fast network/cell/GPS position
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      const gpsResult = await new Promise<GeolocationResult>((resolve, reject) => {
        // High accuracy GPS hardware fix with 10s satellite fix window
        const options: PositionOptions = {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        };

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              source: 'gps',
            });
          },
          (geoError) => {
            reject(geoError);
          },
          options
        );
      });

      return gpsResult;
    } catch (gpsError: any) {
      console.info(
        'Browser GPS/HTML5 geolocation unavailable, denied, or timed out. Falling back to IP-based location:',
        gpsError?.message || gpsError
      );
    }
  }

  // Step 2: Fall back to IP/Network Geolocation
  return await fetchIpGeolocation();
}

/**
 * Format coordinates to professional meteorological degree string
 * e.g., 13.0150, 80.2210 -> "13.0150° N, 80.2210° E"
 */
export function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
}

/**
 * Format distance in kilometers or meters
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m away`;
  }
  return `${km.toFixed(1)} km away`;
}
