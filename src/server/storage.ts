import { WeatherReport, IngestionStats, IngestionFilter, SourceType } from '../types.ts';
import { normalizeIncomingPayload } from './normalizer.ts';

// Haversine distance in kilometers
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class ReportStorage {
  private reports: Map<string, WeatherReport> = new Map();

  constructor() {
    this.seedInitialData();
  }

  // Duplicate detection heuristic
  private checkDuplicate(incoming: WeatherReport): { status: 'ORIGINAL' | 'SUSPECTED_DUPLICATE' | 'DUPLICATE'; duplicateOfId?: string } {
    const incomingTime = new Date(incoming.timestamp).getTime();

    for (const existing of this.reports.values()) {
      // 1. Exact source URL match
      if (incoming.source_url && existing.source_url && incoming.source_url === existing.source_url) {
        return { status: 'DUPLICATE', duplicateOfId: existing.report_id };
      }

      // 2. Exact content match
      if (existing.content && incoming.content && existing.content.trim().toLowerCase() === incoming.content.trim().toLowerCase()) {
        return { status: 'DUPLICATE', duplicateOfId: existing.report_id };
      }

      // 3. High text similarity (>50% shared tokens) within 10km and 3 hours
      if (existing.content && incoming.content) {
        const wordsInc = new Set(incoming.content.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3));
        const wordsExt = new Set(existing.content.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3));
        let matchCount = 0;
        for (const w of wordsInc) {
          if (wordsExt.has(w)) matchCount++;
        }
        const sim = wordsInc.size > 0 ? matchCount / Math.max(wordsInc.size, wordsExt.size) : 0;

        if (sim >= 0.5) {
          const distKm = calculateDistanceKm(
            incoming.latitude,
            incoming.longitude,
            existing.latitude,
            existing.longitude
          );
          const hourDiff = Math.abs(incomingTime - new Date(existing.timestamp).getTime()) / (1000 * 60 * 60);
          if (distKm <= 10 && hourDiff <= 3) {
            return { status: 'SUSPECTED_DUPLICATE', duplicateOfId: existing.report_id };
          }
        }
      }
    }

    return { status: 'ORIGINAL' };
  }

  public saveReport(report: WeatherReport): { report: WeatherReport; isDuplicate: boolean } {
    // Run duplicate detection
    const dupCheck = this.checkDuplicate(report);
    report.duplicate_status = dupCheck.status;
    if (dupCheck.duplicateOfId) {
      report.duplicate_of_id = dupCheck.duplicateOfId;
    }

    // Save to repository (key by report_id)
    this.reports.set(report.report_id, report);

    return {
      report,
      isDuplicate: dupCheck.status !== 'ORIGINAL',
    };
  }

  public getReports(filter: IngestionFilter = {}): WeatherReport[] {
    let list = Array.from(this.reports.values());

    // Sort descending by ingested_at / timestamp
    list.sort((a, b) => new Date(b.ingested_at || b.timestamp).getTime() - new Date(a.ingested_at || a.timestamp).getTime());

    if (filter.source_type && filter.source_type !== 'ALL') {
      list = list.filter((r) => r.source_type === filter.source_type);
    }

    if (filter.event_category && filter.event_category !== 'ALL') {
      list = list.filter((r) => r.event_category.toLowerCase() === filter.event_category?.toLowerCase());
    }

    if (filter.duplicate_status && filter.duplicate_status !== 'ALL') {
      list = list.filter((r) => r.duplicate_status === filter.duplicate_status);
    }

    if (filter.city) {
      list = list.filter((r) => r.city.toLowerCase().includes(filter.city!.toLowerCase()));
    }

    if (filter.search_query) {
      const q = filter.search_query.toLowerCase();
      list = list.filter(
        (r) =>
          r.content.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q) ||
          r.state.toLowerCase().includes(q) ||
          (r.author_name && r.author_name.toLowerCase().includes(q)) ||
          r.source_platform.toLowerCase().includes(q) ||
          r.event_category.toLowerCase().includes(q)
      );
    }

    return list;
  }

  public getReportById(id: string): WeatherReport | undefined {
    return this.reports.get(id);
  }

  public resetData(): WeatherReport[] {
    this.reports.clear();
    return this.seedInitialData();
  }

  public getStats(): IngestionStats {
    const list = Array.from(this.reports.values());
    const bySource: Record<SourceType, number> = {
      SOCIAL_MEDIA: 0,
      CITIZEN: 0,
      WEATHER_API: 0,
      PUBLIC_DATASET: 0,
      WEBSITE: 0,
    };
    const byCategory: Record<string, number> = {};
    let duplicates = 0;
    let verified = 0;

    for (const r of list) {
      if (bySource[r.source_type] !== undefined) {
        bySource[r.source_type]++;
      }
      byCategory[r.event_category] = (byCategory[r.event_category] || 0) + 1;
      if (r.duplicate_status !== 'ORIGINAL') {
        duplicates++;
      }
      if (r.verification_status === 'VERIFIED') {
        verified++;
      }
    }

    const lastReport = list.sort(
      (a, b) => new Date(b.ingested_at).getTime() - new Date(a.ingested_at).getTime()
    )[0];

    return {
      total_reports: list.length,
      by_source_type: bySource,
      by_event_category: byCategory,
      duplicates_count: duplicates,
      verified_count: verified,
      last_ingested_at: lastReport ? lastReport.ingested_at : null,
    };
  }

  public clear(): void {
    this.reports.clear();
  }

  public seedInitialData(): WeatherReport[] {
    // Smart India Hackathon Realistic Multi-Source Simulation Dataset: Chennai, Tamil Nadu Flash-Flood Scenario
    // NOTE: All reports are simulated for prototype evaluation purposes.
    const samplePayloads: Array<{ type: SourceType; payload: any }> = [
      {
        // 1. OFFICIAL METEOROLOGICAL AGENCY (WEATHER_API / OFFICIAL)
        type: 'WEATHER_API',
        payload: {
          service: 'IMD RMC Chennai API',
          alert_id: 'IMD-CHE-FLOD-2026-0912-RED',
          event_name: 'Flash Flood',
          headline: '[DEMO / SIMULATED DATA] Red Alert: Flash Flood Emergency issued for Greater Chennai & Adyar River Basin',
          description: 'Intense cyclonic cloudburst dumped over 210mm rainfall in 6 hours at Meenambakkam AWS. Severe inundation threat along Adyar and Cooum river basins, Saidapet Maraimalai Adigal causeway, and South Chennai corridors.',
          area_desc: 'Saidapet, Chennai, TN',
          state_abbr: 'TN',
          centroid: { lat: 13.0213, lon: 80.2231 },
          api_endpoint: 'https://rmcchennai.imd.gov.in/alerts/IMD-CHE-FLOD-2026-0912-RED',
          published_time: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
        },
      },
      {
        // 2. PUBLIC DATASET (HYDRO-METEOROLOGICAL GAUGE / TELEMETRY)
        type: 'PUBLIC_DATASET',
        payload: {
          agency: 'TNSDMA_CWC',
          dataset_name: 'Real-Time River Gauge & Hydro-Met Registry',
          record_id: 'CWC-ADY-2026-0912-042',
          event_type: 'Flash Flood',
          narrative: '[DEMO / SIMULATED DATA] Adyar River stage at Saidapet Maraimalai Adigal Bridge reached 14.85m (Warning Level: 13.5m, Danger Mark: 15.0m). Inflow from Chembarambakkam reservoir outflow recorded at 9,200 cusecs. Immediate alert to GCC zone officers for causeway closure.',
          cz_name: 'Saidapet, Chennai',
          state_alpha: 'TN',
          begin_lat: 13.0215,
          begin_lon: 80.2235,
          record_timestamp: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
          source_catalog_url: 'https://tnsdma.tn.gov.in/hydromet/archive/CWC-ADY-2026-0912-042',
        },
      },
      {
        // 3. SOCIAL MEDIA WITH VISUAL PHOTO EVIDENCE (SOCIAL / VISUAL)
        type: 'SOCIAL_MEDIA',
        payload: {
          platform: 'Twitter/X',
          post_id: '183492817263',
          user_handle: 'ChennaiRainsLive',
          display_name: 'Chennai Monsoon Spotter Net',
          post_text: '[DEMO / SIMULATED DATA] Severe flash flooding approaching Saidapet and Velachery 100 Feet Road! Water is 3.5 feet deep over the road median, 2 MTC buses and multiple cars stalled in deep water. GCC rescue boats active. Stay off Saidapet causeway! #ChennaiRains #SaidapetFloods',
          media_links: ['https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80'],
          geo: { lat: 13.0180, lng: 80.2210, city: 'Saidapet, Chennai', state: 'TN' },
          created_at: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
        },
      },
      {
        // 4. CITIZEN OBSERVER WITH PHOTO EVIDENCE (CITIZEN / VISUAL)
        type: 'CITIZEN',
        payload: {
          app_name: 'TN Smart Citizen Weather App',
          observer_id: 'SPOT-TN-7721',
          observer_alias: 'Citizen Spotter Karthik R.',
          observation_text: '[DEMO / SIMULATED DATA] Continuous torrential downpour in Saidapet and South Usman Road corridor for last 90 minutes. Causeway approach and market street have 2.5 feet waist-deep standing floodwater. Ground-floor basements flooded.',
          hazard_type: 'Flash Flood',
          photo_url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
          location: { city: 'Saidapet, Chennai', state: 'TN', lat: 13.0250, lon: 80.2280 },
          recorded_time: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
          accuracy_meters: 10,
        },
      },
      {
        // 5. REGIONAL JOURNALISM / LOCAL NEWS ARTICLE (MEDIA / PRESS)
        type: 'WEBSITE',
        payload: {
          site_name: 'The Hindu Meteorological Special Report',
          article_url: 'https://thehindu.example.com/weather/chennai-monsoon-surge-adyar-saidapet-floods',
          author_byline: 'S. Ramanathan, Senior Bureau Correspondent, Chennai',
          headline: '[DEMO / SIMULATED DATA] Intense Monsoon Surge Submerges South Chennai Corridors; Saidapet Causeway and Adyar on High Alert',
          body_text: '[DEMO / SIMULATED DATA] Greater Chennai Corporation mobilized 450 dewatering pump sets as torrential coastal cloudburst dumped 190mm rainfall in three hours across southern corridors. Water levels on Saidapet causeway and Adyar river canal surged past danger thresholds, halting arterial public transit.',
          publication_date: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
          city: 'Saidapet, Chennai',
          state: 'TN',
          latitude: 13.0200,
          longitude: 80.2200,
          featured_media_url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80',
        },
      },
      {
        // 6. GCC AUTOMATED TELEMETRY SENSOR (WEATHER_API / TELEMETRY)
        type: 'WEATHER_API',
        payload: {
          service: 'GCC Smart Sensor Grid',
          alert_id: 'GCC-SEN-SAI-2026-0912-88',
          event_name: 'Flash Flood',
          headline: '[DEMO / SIMULATED DATA] GCC Sensor Alert: Saidapet Adyar River Catchment Inundation Saturated',
          description: 'Automated ultrasonic water level sensor at Saidapet canal junction recorded water elevation 2.4 meters above normal datum. Runoff discharge velocity 3.1 m/s converging toward lowlands.',
          area_desc: 'Saidapet, Chennai, TN',
          state_abbr: 'TN',
          centroid: { lat: 13.0150, lon: 80.2260 },
          api_endpoint: 'https://chennaicorporation.gov.in/sensors/GCC-SEN-SAI-2026-0912-88',
          published_time: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        },
      },
      {
        // 7. GROUND CITIZEN SPOTTER (CITIZEN)
        type: 'CITIZEN',
        payload: {
          app_name: 'CommunityWeather',
          observer_id: 'CW-TN-819',
          observer_alias: 'Saidapet Resident Senthil',
          observation_text: '[DEMO / SIMULATED DATA] Water rising fast near Saidapet Metro and Jones Road subway. Water logging at 3 feet, subways barricaded by traffic police. Backwaters backing up into street drains.',
          hazard_type: 'Flash Flood',
          location: { city: 'Saidapet, Chennai', state: 'TN', lat: 13.0240, lon: 80.2215 },
          recorded_time: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
          accuracy_meters: 15,
        },
      },
      {
        // 8. CRITICAL CONFLICTING CITIZEN REPORT IN SAIDAPET (CONFLICTING CITIZEN REPORT)
        type: 'CITIZEN',
        payload: {
          app_name: 'SkyWarn India Citizen Portal',
          observer_id: 'OBS-CHE-304',
          observer_alias: 'Chennai Commuter Vignesh',
          observation_text: '[DEMO / SIMULATED DATA] Just drove across Saidapet Maraimalai Adigal Bridge and Anna Salai: completely dry and zero waterlogging on the bridge deck! Traffic is moving at normal speed, no flood water on roadway. Rumors of bridge closure are false.',
          hazard_type: 'Flash Flood',
          location: { city: 'Saidapet, Chennai', state: 'TN', lat: 13.0225, lon: 80.2240 },
          recorded_time: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
          accuracy_meters: 12,
        },
      },
      {
        // 9. SECOND CONFLICTING / DRY PERIPHERAL OBSERVATION (ANNA NAGAR)
        type: 'CITIZEN',
        payload: {
          app_name: 'TN Smart Citizen Weather App',
          observer_id: 'SPOT-CHE-9102',
          observer_alias: 'Spotter Meenakshi Sundaram',
          observation_text: '[DEMO / SIMULATED DATA] Kilpauk and Anna Nagar 2nd Avenue: light drizzle only, storm drains running clear, roads completely open with dry pavement and normal vehicular flow.',
          hazard_type: 'Flash Flood',
          location: { city: 'Saidapet, Chennai', state: 'TN', lat: 13.0300, lon: 80.2200 },
          recorded_time: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          accuracy_meters: 15,
        },
      },
      {
        // 10. DUPLICATE SOCIAL MEDIA POST (TESTS DUPLICATE DETECTION IN CHENNAI)
        type: 'SOCIAL_MEDIA',
        payload: {
          platform: 'Bluesky',
          post_id: 'bsky-che-9941',
          user_handle: 'saidapet_updates.bsky.social',
          display_name: 'Saidapet Residents Forum',
          post_text: '[DEMO / SIMULATED DATA] Severe flash flooding approaching Saidapet and Velachery 100 Feet Road! Water is 3.5 feet deep over the road median, 2 MTC buses stalled in deep water. GCC rescue boats active. #ChennaiRains #Saidapet',
          geo: { lat: 13.0182, lng: 80.2212, city: 'Saidapet, Chennai', state: 'TN' },
          created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        },
      },
    ];

    const results: WeatherReport[] = [];
    for (const item of samplePayloads) {
      const normalized = normalizeIncomingPayload(item.type, item.payload);
      this.saveReport(normalized);
      results.push(normalized);
    }
    return results;
  }
}

// Global storage singleton
export const storage = new ReportStorage();
