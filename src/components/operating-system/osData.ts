export interface MapWeatherEvent {
  id: string;
  type: string;
  category: 'SEVERE' | 'RAINFALL' | 'THUNDERSTORM' | 'HEATWAVE' | 'FLOOD' | 'VERIFIED';
  city: string;
  state: string;
  lat: number;
  lng: number;
  timeIST: string;
  confidence: number;
  sourcesCount: number;
  correlatedReports: number;
  status: 'VERIFIED' | 'ACTION_REQUIRED' | 'PROVISIONAL';
  summary: string;
  rainfallMm?: number;
  tempC?: number;
  windKmh?: number;
  waterDepthFt?: number;
  color: string;
}

export const REALTIME_WEATHER_EVENTS: MapWeatherEvent[] = [
  {
    id: 'EVT-CHE-001',
    type: 'Heavy Rainfall & Flash Inundation',
    category: 'SEVERE',
    city: 'Chennai',
    state: 'Tamil Nadu',
    lat: 13.0827,
    lng: 80.2707,
    timeIST: '21:42 IST',
    confidence: 91,
    sourcesCount: 12,
    correlatedReports: 8,
    status: 'VERIFIED',
    summary: '4.2ft waterlogged under Saidapet subway; Adyar river gauge 1.1m above danger mark. NDRF 4th Bn deployed.',
    rainfallMm: 124.5,
    waterDepthFt: 4.2,
    tempC: 28.5,
    windKmh: 42,
    color: '#EF4444', // Red
  },
  {
    id: 'EVT-CHE-002',
    type: 'Monsoon Cloudburst Band',
    category: 'RAINFALL',
    city: 'Meenambakkam',
    state: 'Tamil Nadu',
    lat: 12.9868,
    lng: 80.1772,
    timeIST: '21:30 IST',
    confidence: 96,
    sourcesCount: 8,
    correlatedReports: 6,
    status: 'VERIFIED',
    summary: 'Dual-frequency IMD Doppler radar recording 52 dBZ convective core; 48mm/hr precipitation rate.',
    rainfallMm: 88.0,
    tempC: 27.2,
    windKmh: 36,
    color: '#06B6D4', // Cyan
  },
  {
    id: 'EVT-MUM-003',
    type: 'Coastal Squall & Heavy Rain',
    category: 'RAINFALL',
    city: 'Mumbai',
    state: 'Maharashtra',
    lat: 19.0760,
    lng: 72.8777,
    timeIST: '21:25 IST',
    confidence: 87,
    sourcesCount: 8,
    correlatedReports: 5,
    status: 'VERIFIED',
    summary: 'Arabian Sea coastal squall line; wind gusts 58 km/h and wave heights 3.5m advisory issued.',
    rainfallMm: 62.5,
    tempC: 29.8,
    windKmh: 58,
    color: '#F59E0B', // Orange/Amber
  },
  {
    id: 'EVT-BLR-004',
    type: 'Thunderstorm Activity',
    category: 'THUNDERSTORM',
    city: 'Bengaluru',
    state: 'Karnataka',
    lat: 12.9716,
    lng: 77.5946,
    timeIST: '21:18 IST',
    confidence: 84,
    sourcesCount: 6,
    correlatedReports: 4,
    status: 'VERIFIED',
    summary: 'Urban thermodynamic convective storm with rapid 32mm rainfall across Bellandur catchment.',
    rainfallMm: 32.0,
    tempC: 24.2,
    windKmh: 28,
    color: '#A855F7', // Violet
  },
  {
    id: 'EVT-DEL-005',
    type: 'Surface Baseline Observatory',
    category: 'VERIFIED',
    city: 'New Delhi',
    state: 'Delhi (NCT)',
    lat: 28.5833,
    lng: 77.2000,
    timeIST: '21:40 IST',
    confidence: 98,
    sourcesCount: 14,
    correlatedReports: 12,
    status: 'VERIFIED',
    summary: 'Safdarjung Observatory baseline locked; 1012 hPa barometric reference, temp 33.6°C.',
    tempC: 33.6,
    windKmh: 12,
    color: '#10B981', // Emerald
  },
  {
    id: 'EVT-ASM-006',
    type: 'Brahmaputra Flood Risk Inundation',
    category: 'FLOOD',
    city: 'Guwahati',
    state: 'Assam',
    lat: 26.1445,
    lng: 91.7362,
    timeIST: '21:05 IST',
    confidence: 89,
    sourcesCount: 11,
    correlatedReports: 7,
    status: 'ACTION_REQUIRED',
    summary: 'Brahmaputra tributary inflows high; automated ultrasonic level sensor +1.4m surge in upper reach.',
    waterDepthFt: 5.1,
    rainfallMm: 74.0,
    tempC: 26.5,
    windKmh: 20,
    color: '#3B82F6', // Blue
  },
  {
    id: 'EVT-ODI-007',
    type: 'Mesoscale Lightning Squall',
    category: 'THUNDERSTORM',
    city: 'Balasore',
    state: 'Odisha',
    lat: 21.4934,
    lng: 86.9135,
    timeIST: '20:55 IST',
    confidence: 86,
    sourcesCount: 7,
    correlatedReports: 5,
    status: 'PROVISIONAL',
    summary: 'Bay of Bengal convective squall line tracking inland with frequent cloud-to-ground lightning.',
    rainfallMm: 52.0,
    tempC: 28.0,
    windKmh: 50,
    color: '#8B5CF6', // Purple
  },
  {
    id: 'EVT-RAJ-008',
    type: 'Thermal Radiative Heatwave',
    category: 'HEATWAVE',
    city: 'Jodhpur',
    state: 'Rajasthan',
    lat: 26.2389,
    lng: 73.0243,
    timeIST: '20:40 IST',
    confidence: 90,
    sourcesCount: 5,
    correlatedReports: 4,
    status: 'VERIFIED',
    summary: 'Extreme daytime radiative heating; IMD yellow alert active for western desert districts.',
    tempC: 42.4,
    windKmh: 18,
    color: '#F97316', // Orange
  }
];

export interface MapWeatherZone {
  id: string;
  name: string;
  type: 'RAIN' | 'HEAT' | 'STORM' | 'FLOOD' | 'SEVERE';
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  color: string;
  fillOpacity: number;
}

export const WEATHER_ZONES: MapWeatherZone[] = [
  {
    id: 'ZONE-TN-FLOOD',
    name: 'Chennai-Adyar Inundation Zone',
    type: 'SEVERE',
    centerLat: 13.04,
    centerLng: 80.24,
    radiusKm: 75,
    color: '#EF4444',
    fillOpacity: 0.35,
  },
  {
    id: 'ZONE-TN-RAIN',
    name: 'Coastal Tamil Nadu Monsoon Band',
    type: 'RAIN',
    centerLat: 12.2,
    centerLng: 80.0,
    radiusKm: 140,
    color: '#06B6D4',
    fillOpacity: 0.28,
  },
  {
    id: 'ZONE-MH-SQUALL',
    name: 'Konkan Coast Squall Line',
    type: 'STORM',
    centerLat: 18.8,
    centerLng: 73.0,
    radiusKm: 110,
    color: '#A855F7',
    fillOpacity: 0.25,
  },
  {
    id: 'ZONE-AS-FLOOD',
    name: 'Assam Valley Flood Basin',
    type: 'FLOOD',
    centerLat: 26.2,
    centerLng: 92.5,
    radiusKm: 120,
    color: '#3B82F6',
    fillOpacity: 0.30,
  },
  {
    id: 'ZONE-RAJ-HEAT',
    name: 'Thar Thermal Heatwave Surge',
    type: 'HEAT',
    centerLat: 26.8,
    centerLng: 72.8,
    radiusKm: 160,
    color: '#F97316',
    fillOpacity: 0.22,
  },
];
