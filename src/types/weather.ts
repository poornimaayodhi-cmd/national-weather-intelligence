export interface WeatherState {
  state_id: string;
  state_name: string;
  districts_count: number;
}

export interface WeatherDistrict {
  district_id: string;
  district_name: string;
  state_id: string;
  state_name: string;
  stations_count: number;
}

export interface WeatherStation {
  station_id: string;
  station_name: string;
  district_id: string;
  district_name: string;
  state_id: string;
  state_name: string;
  station_type: string;
  latitude: number;
  longitude: number;
  elevation_meters: number;
  pincodes: string[];
  is_active: boolean;
  distance_km?: number;
}

export type RainfallCategory =
  | 'No Rain'
  | 'Very Light'
  | 'Light'
  | 'Moderate'
  | 'Heavy'
  | 'Very Heavy'
  | 'Extremely Heavy';

export type AQICategory =
  | 'Good'
  | 'Satisfactory'
  | 'Moderate'
  | 'Poor'
  | 'Very Poor'
  | 'Severe';

export interface WeatherVerificationMetadata {
  is_verified: boolean;
  source: string;
  network: string;
  qc_status: 'Passed' | 'Suspect' | 'Flagged';
  qc_flags_count: number;
  sensor_calibration_date: string;
  telemetry_latency_seconds: number;
  wmo_station_code?: string;
}

export interface WeatherConditions {
  temperature_c: number;
  feels_like_c: number;
  temp_max_today_c: number;
  temp_min_today_c: number;
  sky_condition: string;
  weather_code: 'thunderstorm' | 'rain' | 'cloudy' | 'partly_cloudy' | 'sunny' | 'mist' | 'haze';
  rainfall_today_mm: number;
  rainfall_rate_mm_hr: number;
  rainfall_category: RainfallCategory;
  humidity_percent: number;
  dew_point_c: number;
  wind_speed_kmh: number;
  wind_gust_kmh: number;
  wind_direction_deg: number;
  wind_direction_cardinal: string;
  pressure_hpa: number;
  pressure_trend: 'Rising' | 'Steady' | 'Falling';
  air_quality_index: number;
  aqi_category: AQICategory;
  pm25: number;
  pm10: number;
  solar_radiation_w_m2: number;
  uv_index: number;
  visibility_km: number;
  cloud_cover_octas: number;
}

export interface MLVerificationPreview {
  confidence_score: number;
  anomaly_detected: boolean;
  telemetry_drift_risk: 'Low' | 'Moderate' | 'High';
  cross_sensor_agreement: number;
  pipeline_stage: string;
  model_id: string;
  anomaly_reasons?: string[];
}

export interface TruthVerificationDetails {
  is_real_time_true: boolean;
  data_authenticity: '100% Real-Time Live Telemetry' | 'Sensor Network Telemetry' | 'Calibrated Station Baseline';
  provider: string;
  sensor_network: string;
  observed_at_utc: string;
  observed_at_local: string;
  timezone: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  detected_location: {
    city?: string;
    region?: string;
    country?: string;
  };
  live_metrics_verified: string[];
}

export interface StationWeatherData {
  station_id: string;
  station_name: string;
  district_id: string;
  district_name: string;
  state_id: string;
  state_name: string;
  latitude: number;
  longitude: number;
  elevation_meters: number;
  station_type: string;
  observation_time: string;
  observation_time_ist: string;
  observation_time_local?: string;
  timezone?: string;
  is_stale: boolean;
  is_current_location?: boolean;
  truth_verification?: TruthVerificationDetails;
  verification: WeatherVerificationMetadata;
  weather: WeatherConditions;
  ml_verification?: MLVerificationPreview;
}

export interface LocationSearchResult {
  station_id: string;
  station_name: string;
  district_id: string;
  district_name: string;
  state_id: string;
  state_name: string;
  station_type: string;
  pincodes: string[];
  matched_field: 'city' | 'district' | 'pincode' | 'station_name';
  matched_text: string;
}
