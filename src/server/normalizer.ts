import {
  WeatherReport,
  SourceType,
  RawSocialMediaPayload,
  RawCitizenPayload,
  RawWeatherApiPayload,
  RawPublicDatasetPayload,
  RawWebsitePayload,
} from '../types.ts';

// Deterministic or UUID generation for report IDs
export function generateReportId(prefix = 'REP'): string {
  const timestampPart = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${timestampPart}-${randomPart}`;
}

// Category extraction helper to ensure standardized event category naming
export function standardizeEventCategory(rawCategory: string, text = ''): string {
  const normalized = (rawCategory + ' ' + text).toLowerCase();
  if (normalized.includes('tornado') || normalized.includes('funnel') || normalized.includes('twister')) {
    return 'Tornado';
  }
  if (normalized.includes('flash flood') || normalized.includes('flooding') || normalized.includes('inundation') || normalized.includes('flood') || normalized.includes('waterlogging')) {
    return 'Flash Flood';
  }
  if (normalized.includes('hail') || normalized.includes('hailstone')) {
    return 'Hailstorm';
  }
  if (normalized.includes('thunderstorm') || normalized.includes('lightning') || normalized.includes('severe storm')) {
    return 'Severe Thunderstorm';
  }
  if (normalized.includes('wildfire') || normalized.includes('smoke') || normalized.includes('brush fire')) {
    return 'Wildfire / Smoke';
  }
  if (normalized.includes('snow') || normalized.includes('blizzard') || normalized.includes('ice storm') || normalized.includes('freezing')) {
    return 'Winter Storm';
  }
  if (normalized.includes('heat') || normalized.includes('heat wave') || normalized.includes('thermal')) {
    return 'Extreme Heat';
  }
  if (normalized.includes('high wind') || normalized.includes('microburst') || normalized.includes('gust')) {
    return 'High Wind';
  }
  return rawCategory || 'Severe Weather';
}

export function normalizeSocialMedia(payload: RawSocialMediaPayload): WeatherReport {
  const eventCategory = standardizeEventCategory('', payload.post_text);
  const hasMedia = Boolean(payload.media_links && payload.media_links.length > 0);
  
  // Base credibility for social media (e.g., 45-65), elevated if media is attached or geo-tagged
  let credibility = 50;
  if (hasMedia) credibility += 15;
  if (payload.geo && payload.geo.lat) credibility += 10;

  return {
    report_id: generateReportId('REP-SOC'),
    source_platform: payload.platform || 'Social Media',
    source_url: payload.post_url || `https://${(payload.platform || 'twitter').toLowerCase().replace('/', '')}.com/${payload.user_handle || 'user'}/status/${payload.post_id || Date.now()}`,
    source_type: 'SOCIAL_MEDIA',
    author_name: payload.display_name ? `${payload.display_name} (@${payload.user_handle})` : `@${payload.user_handle || 'anonymous'}`,
    content: payload.post_text || '',
    timestamp: payload.created_at || new Date().toISOString(),
    city: payload.geo?.city || 'Chennai',
    state: payload.geo?.state || 'TN',
    latitude: payload.geo?.lat ?? 12.9815,
    longitude: payload.geo?.lng ?? 80.2180,
    event_category: eventCategory,
    media_url: payload.media_links?.[0] || null,
    verification_status: 'UNVERIFIED',
    AI_confidence: null, // Note: AI verification not implemented yet as per instructions
    credibility_score: Math.min(100, Math.max(0, credibility)),
    duplicate_status: 'ORIGINAL',
    ingested_at: new Date().toISOString(),
    raw_payload: payload as unknown as Record<string, unknown>,
  };
}

export function normalizeCitizen(payload: RawCitizenPayload): WeatherReport {
  const eventCategory = standardizeEventCategory(payload.hazard_type, payload.observation_text);
  
  // Citizen weather spotters (mPING / SkyWarn) usually carry moderate-high credibility (65-80)
  let credibility = 70;
  if (payload.photo_url) credibility += 10;
  if (payload.accuracy_meters && payload.accuracy_meters < 50) credibility += 5;

  return {
    report_id: generateReportId('REP-CIT'),
    source_platform: payload.app_name || 'Citizen Weather Observer',
    source_url: `https://${(payload.app_name || 'mping').toLowerCase()}.noaa.gov/reports/${payload.observer_id || Date.now()}`,
    source_type: 'CITIZEN',
    author_name: payload.observer_alias ? `${payload.observer_alias} [ID:${payload.observer_id}]` : `Spotter #${payload.observer_id || 'Unknown'}`,
    content: payload.observation_text || `Reported ${payload.hazard_type}`,
    timestamp: payload.recorded_time || new Date().toISOString(),
    city: payload.location.city,
    state: payload.location.state,
    latitude: payload.location.lat,
    longitude: payload.location.lon,
    event_category: eventCategory,
    media_url: payload.photo_url || null,
    verification_status: 'UNVERIFIED',
    AI_confidence: null,
    credibility_score: Math.min(100, Math.max(0, credibility)),
    duplicate_status: 'ORIGINAL',
    ingested_at: new Date().toISOString(),
    raw_payload: payload as unknown as Record<string, unknown>,
  };
}

export function normalizeWeatherApi(payload: RawWeatherApiPayload): WeatherReport {
  const eventCategory = standardizeEventCategory(payload.event_name, payload.headline + ' ' + payload.description);
  
  return {
    report_id: generateReportId('REP-API'),
    source_platform: payload.service || 'Weather API',
    source_url: payload.api_endpoint || `https://api.weather.gov/alerts/${payload.alert_id}`,
    source_type: 'WEATHER_API',
    author_name: `${payload.service} Automated Ingestion Engine`,
    content: `${payload.headline} — ${payload.description}`,
    timestamp: payload.published_time || new Date().toISOString(),
    city: payload.area_desc.split(',')[0]?.trim() || 'Regional',
    state: payload.state_abbr || payload.area_desc.split(',')[1]?.trim() || 'US',
    latitude: payload.centroid.lat,
    longitude: payload.centroid.lon,
    event_category: eventCategory,
    media_url: null,
    verification_status: 'VERIFIED', // Official weather API alerts are certified by meteorological feeds
    AI_confidence: null,
    credibility_score: 92,
    duplicate_status: 'ORIGINAL',
    ingested_at: new Date().toISOString(),
    raw_payload: payload as unknown as Record<string, unknown>,
  };
}

export function normalizePublicDataset(payload: RawPublicDatasetPayload): WeatherReport {
  const eventCategory = standardizeEventCategory(payload.event_type, payload.narrative);

  return {
    report_id: generateReportId('REP-PUB'),
    source_platform: payload.agency || 'Public Weather Dataset',
    source_url: payload.source_catalog_url || `https://www.ncdc.noaa.gov/stormevents/${payload.record_id}`,
    source_type: 'PUBLIC_DATASET',
    author_name: `${payload.agency} Archive (${payload.dataset_name})`,
    content: payload.narrative,
    timestamp: payload.record_timestamp || new Date().toISOString(),
    city: payload.cz_name,
    state: payload.state_alpha,
    latitude: payload.begin_lat,
    longitude: payload.begin_lon,
    event_category: eventCategory,
    media_url: null,
    verification_status: 'VERIFIED', // Public government agency records
    AI_confidence: null,
    credibility_score: 96,
    duplicate_status: 'ORIGINAL',
    ingested_at: new Date().toISOString(),
    raw_payload: payload as unknown as Record<string, unknown>,
  };
}

export function normalizeWebsite(payload: RawWebsitePayload): WeatherReport {
  const eventCategory = standardizeEventCategory('', payload.headline + ' ' + payload.body_text);

  return {
    report_id: generateReportId('REP-WEB'),
    source_platform: payload.site_name || 'Web Media News',
    source_url: payload.article_url,
    author_name: payload.author_byline || payload.site_name,
    source_type: 'WEBSITE',
    content: `${payload.headline}. ${payload.body_text}`,
    timestamp: payload.publication_date || new Date().toISOString(),
    city: payload.city,
    state: payload.state,
    latitude: payload.latitude,
    longitude: payload.longitude,
    event_category: eventCategory,
    media_url: payload.featured_media_url || null,
    verification_status: 'UNVERIFIED',
    AI_confidence: null,
    credibility_score: 78,
    duplicate_status: 'ORIGINAL',
    ingested_at: new Date().toISOString(),
    raw_payload: payload as unknown as Record<string, unknown>,
  };
}

/**
 * Universal Ingestion Adapter
 * Accepts either pre-standardized WeatherReport or heterogeneous raw payloads with source_type
 */
export function normalizeIncomingPayload(source_type: SourceType, rawData: any): WeatherReport {
  if (!rawData) {
    throw new Error('Missing payload data for report ingestion');
  }

  // If already matches standard common data model format
  if (rawData.report_id && rawData.source_platform && rawData.content && rawData.city) {
    return {
      report_id: rawData.report_id || generateReportId(),
      source_platform: rawData.source_platform,
      source_url: rawData.source_url || '',
      source_type: source_type || rawData.source_type || 'WEBSITE',
      author_name: rawData.author_name ?? rawData['author/source name if publicly available'] ?? null,
      content: rawData.content ?? rawData['text/content'] ?? '',
      timestamp: rawData.timestamp || new Date().toISOString(),
      city: rawData.city,
      state: rawData.state,
      latitude: Number(rawData.latitude) || 0,
      longitude: Number(rawData.longitude) || 0,
      event_category: standardizeEventCategory(rawData.event_category || '', rawData.content),
      media_url: rawData.media_url ?? rawData['image/video reference'] ?? null,
      verification_status: rawData.verification_status || 'UNVERIFIED',
      AI_confidence: rawData.AI_confidence ?? null,
      credibility_score: Number(rawData.credibility_score) || 60,
      duplicate_status: rawData.duplicate_status || 'ORIGINAL',
      ingested_at: rawData.ingested_at || new Date().toISOString(),
      raw_payload: rawData.raw_payload || rawData,
    };
  }

  switch (source_type) {
    case 'SOCIAL_MEDIA':
      return normalizeSocialMedia(rawData as RawSocialMediaPayload);
    case 'CITIZEN':
      return normalizeCitizen(rawData as RawCitizenPayload);
    case 'WEATHER_API':
      return normalizeWeatherApi(rawData as RawWeatherApiPayload);
    case 'PUBLIC_DATASET':
      return normalizePublicDataset(rawData as RawPublicDatasetPayload);
    case 'WEBSITE':
      return normalizeWebsite(rawData as RawWebsitePayload);
    default:
      throw new Error(`Unsupported source type: ${source_type}`);
  }
}
