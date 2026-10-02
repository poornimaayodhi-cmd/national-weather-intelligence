export interface IndiaStateRegion {
  id: string;
  name: string;
  shortName: string;
  centerLat: number;
  centerLng: number;
  activeEvents: number;
  verified: number;
  highRisk: number;
  avgConfidence: number;
  dominantEvent: string;
  polygon: [number, number][]; // [lat, lng] array
}

export const INDIA_STATE_REGIONS: IndiaStateRegion[] = [
  {
    id: 'TN',
    name: 'Tamil Nadu',
    shortName: 'TN',
    centerLat: 11.1271,
    centerLng: 78.6569,
    activeEvents: 12,
    verified: 9,
    highRisk: 2,
    avgConfidence: 88,
    dominantEvent: 'Heavy Rainfall & Flash Flood',
    polygon: [
      [13.5, 80.2], [13.2, 79.5], [12.5, 78.5], [11.8, 77.0],
      [10.5, 77.0], [9.2, 77.5], [8.1, 77.5], [9.3, 79.2],
      [10.8, 79.8], [11.8, 79.8], [13.1, 80.3], [13.5, 80.2]
    ]
  },
  {
    id: 'MH',
    name: 'Maharashtra',
    shortName: 'MH',
    centerLat: 19.7515,
    centerLng: 75.7139,
    activeEvents: 8,
    verified: 6,
    highRisk: 1,
    avgConfidence: 87,
    dominantEvent: 'Coastal Squall & Gale',
    polygon: [
      [22.0, 72.8], [21.5, 76.0], [21.3, 80.0], [19.0, 80.5],
      [18.0, 77.5], [16.0, 74.0], [16.0, 73.3], [19.0, 72.8], [22.0, 72.8]
    ]
  },
  {
    id: 'KA',
    name: 'Karnataka',
    shortName: 'KA',
    centerLat: 15.3173,
    centerLng: 75.7139,
    activeEvents: 6,
    verified: 5,
    highRisk: 0,
    avgConfidence: 84,
    dominantEvent: 'Convective Showers',
    polygon: [
      [18.4, 76.5], [17.5, 77.5], [14.0, 78.0], [12.0, 77.0],
      [11.8, 75.5], [14.5, 74.3], [16.0, 74.0], [18.4, 76.5]
    ]
  },
  {
    id: 'DL',
    name: 'Delhi (NCT)',
    shortName: 'DL',
    centerLat: 28.7041,
    centerLng: 77.1025,
    activeEvents: 14,
    verified: 14,
    highRisk: 0,
    avgConfidence: 98,
    dominantEvent: 'Ground Truth Baseline',
    polygon: [
      [28.9, 77.0], [28.9, 77.3], [28.5, 77.4], [28.4, 77.0], [28.9, 77.0]
    ]
  },
  {
    id: 'OD',
    name: 'Odisha',
    shortName: 'OD',
    centerLat: 20.9517,
    centerLng: 85.0985,
    activeEvents: 7,
    verified: 6,
    highRisk: 1,
    avgConfidence: 86,
    dominantEvent: 'Lightning Squall Line',
    polygon: [
      [22.5, 86.0], [21.8, 87.5], [19.5, 85.0], [18.5, 82.5],
      [20.0, 82.5], [21.5, 84.0], [22.5, 86.0]
    ]
  },
  {
    id: 'AS',
    name: 'Assam',
    shortName: 'AS',
    centerLat: 26.2006,
    centerLng: 92.9376,
    activeEvents: 11,
    verified: 8,
    highRisk: 2,
    avgConfidence: 89,
    dominantEvent: 'Brahmaputra Riverine Surge',
    polygon: [
      [28.0, 95.5], [27.0, 96.0], [26.0, 93.0], [24.5, 93.0],
      [26.0, 90.0], [27.0, 91.5], [28.0, 95.5]
    ]
  },
  {
    id: 'KL',
    name: 'Kerala',
    shortName: 'KL',
    centerLat: 10.8505,
    centerLng: 76.2711,
    activeEvents: 7,
    verified: 6,
    highRisk: 1,
    avgConfidence: 88,
    dominantEvent: 'Monsoon Coastal Inundation',
    polygon: [
      [12.8, 75.0], [11.8, 76.0], [10.0, 77.2], [8.3, 77.2],
      [8.5, 76.8], [10.0, 76.0], [12.0, 75.0], [12.8, 75.0]
    ]
  },
  {
    id: 'RJ',
    name: 'Rajasthan',
    shortName: 'RJ',
    centerLat: 27.0238,
    centerLng: 74.2179,
    activeEvents: 4,
    verified: 4,
    highRisk: 1,
    avgConfidence: 90,
    dominantEvent: 'Thermal Radiative Surge',
    polygon: [
      [30.0, 73.5], [28.0, 77.0], [26.0, 77.5], [24.0, 73.5],
      [24.5, 71.0], [27.5, 70.0], [30.0, 73.5]
    ]
  },
  {
    id: 'WB',
    name: 'West Bengal',
    shortName: 'WB',
    centerLat: 22.9868,
    centerLng: 87.855,
    activeEvents: 6,
    verified: 5,
    highRisk: 0,
    avgConfidence: 87,
    dominantEvent: 'Nor\'wester Thunderstorm',
    polygon: [
      [27.0, 88.5], [26.0, 89.0], [24.0, 88.5], [22.0, 89.0],
      [21.5, 87.5], [24.0, 86.5], [27.0, 88.5]
    ]
  },
  {
    id: 'GJ',
    name: 'Gujarat',
    shortName: 'GJ',
    centerLat: 22.2587,
    centerLng: 71.1924,
    activeEvents: 5,
    verified: 5,
    highRisk: 0,
    avgConfidence: 89,
    dominantEvent: 'Coastal Gusts & Marine Surge',
    polygon: [
      [24.5, 68.5], [24.5, 72.5], [23.5, 73.5], [21.0, 73.0],
      [20.5, 72.8], [21.5, 70.0], [22.5, 69.0], [24.5, 68.5]
    ]
  },
  {
    id: 'AP',
    name: 'Andhra Pradesh',
    shortName: 'AP',
    centerLat: 15.9129,
    centerLng: 79.74,
    activeEvents: 7,
    verified: 6,
    highRisk: 1,
    avgConfidence: 88,
    dominantEvent: 'Bay Cyclonic Moisture Band',
    polygon: [
      [19.0, 83.5], [17.5, 82.5], [16.0, 80.5], [13.5, 80.2],
      [13.5, 78.5], [15.5, 78.0], [17.0, 79.5], [19.0, 83.5]
    ]
  },
  {
    id: 'TS',
    name: 'Telangana',
    shortName: 'TS',
    centerLat: 18.1124,
    centerLng: 79.0193,
    activeEvents: 5,
    verified: 4,
    highRisk: 0,
    avgConfidence: 85,
    dominantEvent: 'Deccan Atmospheric Instability',
    polygon: [
      [19.8, 78.5], [19.0, 80.0], [17.5, 81.0], [16.5, 79.5],
      [16.0, 77.5], [18.0, 77.5], [19.8, 78.5]
    ]
  },
  {
    id: 'UP',
    name: 'Uttar Pradesh',
    shortName: 'UP',
    centerLat: 26.8467,
    centerLng: 80.9462,
    activeEvents: 9,
    verified: 8,
    highRisk: 1,
    avgConfidence: 91,
    dominantEvent: 'Gangetic Thermal Depression',
    polygon: [
      [28.5, 77.5], [29.5, 79.0], [28.0, 82.0], [27.0, 84.5],
      [25.0, 83.0], [24.5, 81.0], [26.0, 78.5], [28.5, 77.5]
    ]
  }
];
