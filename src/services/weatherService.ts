import {
  WeatherState,
  WeatherDistrict,
  WeatherStation,
  StationWeatherData,
  LocationSearchResult,
} from '../types/weather.ts';

/**
 * Weather Service Layer
 * Abstracts backend API communication for hierarchical location queries
 * and telemetry weather readings.
 */
class WeatherService {
  /**
   * Fetch all supported States & Union Territories
   */
  async fetchStates(): Promise<WeatherState[]> {
    try {
      const res = await fetch('/api/weather/states');
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch states`);
      const data = await res.json();
      return data.states || [];
    } catch (err) {
      console.warn('Backend API /api/weather/states failed, trying fallback /states', err);
      const resFallback = await fetch('/states');
      const data = await resFallback.json();
      return data.states || [];
    }
  }

  /**
   * Fetch all districts belonging to a specific state
   */
  async fetchDistricts(stateId: string): Promise<WeatherDistrict[]> {
    if (!stateId) return [];
    try {
      const res = await fetch(`/api/weather/districts/${encodeURIComponent(stateId)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch districts for state ${stateId}`);
      const data = await res.json();
      return data.districts || [];
    } catch (err) {
      console.warn('Backend API /api/weather/districts failed, trying /districts', err);
      const resFallback = await fetch(`/districts/${encodeURIComponent(stateId)}`);
      const data = await resFallback.json();
      return data.districts || [];
    }
  }

  /**
   * Fetch all weather stations belonging to a specific district
   */
  async fetchStations(districtId: string): Promise<WeatherStation[]> {
    if (!districtId) return [];
    try {
      const res = await fetch(`/api/weather/stations/${encodeURIComponent(districtId)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch stations for district ${districtId}`);
      const data = await res.json();
      return data.stations || [];
    } catch (err) {
      console.warn('Backend API /api/weather/stations failed, trying /stations', err);
      const resFallback = await fetch(`/stations/${encodeURIComponent(districtId)}`);
      const data = await resFallback.json();
      return data.stations || [];
    }
  }

  /**
   * Fetch comprehensive live weather & telemetry for a given station ID
   */
  async fetchWeatherByStationId(stationId: string): Promise<StationWeatherData> {
    if (!stationId) {
      throw new Error('station_id is required to fetch weather data');
    }

    try {
      const res = await fetch(`/api/weather/station/${encodeURIComponent(stationId)}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Weather station "${stationId}" data unavailable`);
      }
      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || 'Failed to retrieve station observation data');
      }

      // DATA CONSISTENCY CHECK:
      // Verify that returned weather data belongs to requested station_id
      if (json.data.station_id !== stationId) {
        throw new Error(
          `Data consistency mismatch: Requested station ${stationId} but received ${json.data.station_id}`
        );
      }

      return json.data;
    } catch (err) {
      console.warn('Trying fallback /weather/:station_id endpoint', err);
      const resFallback = await fetch(`/weather/${encodeURIComponent(stationId)}`);
      if (!resFallback.ok) throw err;
      const json = await resFallback.json();
      return json.data;
    }
  }

  /**
   * Trigger on-demand observation refresh for a station
   */
  async refreshStationWeather(stationId: string): Promise<StationWeatherData> {
    const res = await fetch(`/api/weather/refresh/${encodeURIComponent(stationId)}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to refresh telemetry observation');
    const json = await res.json();
    return json.data;
  }

  /**
   * Search stations by City, District, PIN code, or Station Name
   */
  async searchStations(query: string): Promise<LocationSearchResult[]> {
    if (!query || query.trim().length < 2) return [];
    const res = await fetch(`/api/weather/search?q=${encodeURIComponent(query.trim())}`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.results || [];
  }

  /**
   * Find true live weather and station for given GPS coordinates
   */
  async fetchNearestStation(
    lat: number,
    lon: number,
    clientMeta?: { city?: string; region?: string; country?: string }
  ): Promise<{ station: WeatherStation; distance_km: number; data: StationWeatherData }> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
    });
    if (clientMeta?.city) params.append('city', clientMeta.city);
    if (clientMeta?.region) params.append('region', clientMeta.region);
    if (clientMeta?.country) params.append('country', clientMeta.country);

    try {
      const res = await fetch(`/api/weather/current?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && (json.station || json.nearest_station) && json.data) {
          return {
            station: json.station || json.nearest_station,
            distance_km: json.distance_km ?? 0,
            data: json.data,
          };
        }
      }
    } catch (err) {
      console.warn('Endpoint /api/weather/current failed, falling back to /api/weather/nearest:', err);
    }

    const resFallback = await fetch(`/api/weather/nearest?${params.toString()}`);
    if (!resFallback.ok) {
      throw new Error(`HTTP ${resFallback.status}: Live location telemetry calculation failed`);
    }
    const json = await resFallback.json();
    if (!json.success || (!json.nearest_station && !json.station) || !json.data) {
      throw new Error(json.error || 'No weather telemetry station found within telemetry reach');
    }
    return {
      station: json.station || json.nearest_station,
      distance_km: json.distance_km ?? 0,
      data: json.data,
    };
  }
}

export const weatherService = new WeatherService();
