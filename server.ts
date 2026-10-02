import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { storage } from './src/server/storage.ts';
import { normalizeIncomingPayload } from './src/server/normalizer.ts';
import { correlationEngine } from './src/server/correlationEngine.ts';
import { aiVerificationEngine } from './src/server/aiVerificationEngine.ts';
import { operationalDecisionEngine } from './src/server/operationalDecisionEngine.ts';
import { weatherDataService } from './src/server/weatherDataService.ts';
import { weatherBotService } from './src/server/weatherBotService.ts';
import { SourceType } from './src/types.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Multi-Source Weather Report Ingestion Engine',
      timestamp: new Date().toISOString(),
    });
  });

  // Fetch reports with filters
  app.get('/api/reports', (req, res) => {
    try {
      const { source_type, event_category, search, city, duplicate_status } = req.query;
      const filter = {
        source_type: source_type as SourceType | 'ALL',
        event_category: event_category as string,
        search_query: search as string,
        city: city as string,
        duplicate_status: duplicate_status as any,
      };
      const reports = storage.getReports(filter);
      res.json({
        success: true,
        count: reports.length,
        reports,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Ingestion stats
  app.get('/api/stats', (req, res) => {
    try {
      const stats = storage.getStats();
      res.json({ success: true, stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get single report
  app.get('/api/reports/:id', (req, res) => {
    try {
      const report = storage.getReportById(req.params.id);
      if (!report) {
        return res.status(404).json({ success: false, error: 'Report not found' });
      }
      res.json({ success: true, report });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ==============================================================
  // LOCATION-BASED LIVE WEATHER (IMD AWS) ENDPOINTS
  // ==============================================================

  // GET /states and /api/weather/states
  const handleGetStates = (req: express.Request, res: express.Response) => {
    try {
      const states = weatherDataService.getStates();
      res.json({ success: true, count: states.length, states });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  app.get('/api/weather/states', handleGetStates);
  app.get('/states', handleGetStates);

  // GET /districts/:state_id and /api/weather/districts/:state_id
  const handleGetDistricts = (req: express.Request, res: express.Response) => {
    try {
      const { state_id } = req.params;
      const districts = weatherDataService.getDistricts(state_id);
      res.json({ success: true, count: districts.length, state_id, districts });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  app.get('/api/weather/districts/:state_id', handleGetDistricts);
  app.get('/districts/:state_id', handleGetDistricts);

  // GET /stations/:district_id and /api/weather/stations/:district_id
  const handleGetStations = (req: express.Request, res: express.Response) => {
    try {
      const { district_id } = req.params;
      const stations = weatherDataService.getStations(district_id);
      res.json({ success: true, count: stations.length, district_id, stations });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  app.get('/api/weather/stations/:district_id', handleGetStations);
  app.get('/stations/:district_id', handleGetStations);

  // GET /api/weather/search?q=...
  app.get('/api/weather/search', (req, res) => {
    try {
      const q = (req.query.q as string) || '';
      const results = weatherDataService.searchStations(q);
      res.json({ success: true, count: results.length, results });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /api/weather/ip-location
  app.get('/api/weather/ip-location', async (req, res) => {
    try {
      const forwarded = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
      const clientIp = forwarded || req.socket.remoteAddress || '';

      const isPrivate = !clientIp || clientIp === '127.0.0.1' || clientIp === '::1' || clientIp.startsWith('10.') || clientIp.startsWith('192.168.') || clientIp.startsWith('172.');
      const geoUrl = isPrivate ? 'https://get.geojs.io/v1/ip/geo.json' : `https://get.geojs.io/v1/ip/geo/${encodeURIComponent(clientIp)}.json`;

      try {
        const geoRes = await fetch(geoUrl, { signal: AbortSignal.timeout(4000) });
        if (geoRes.ok) {
          const geoData: any = await geoRes.json();
          const lat = parseFloat(geoData.latitude);
          const lon = parseFloat(geoData.longitude);
          if (!isNaN(lat) && !isNaN(lon)) {
            return res.json({
              success: true,
              latitude: lat,
              longitude: lon,
              city: geoData.city || geoData.region || 'Detected Location',
              region: geoData.region || '',
              country: geoData.country || geoData.country_code || '',
              ip: clientIp || geoData.ip,
              source: 'ip',
            });
          }
        }
      } catch (geoErr) {
        console.warn('Primary geo service failed, trying secondary ipwho.is:', geoErr);
      }

      // Secondary fallback: ipwho.is
      try {
        const ipwhoUrl = isPrivate ? 'https://ipwho.is/' : `https://ipwho.is/${encodeURIComponent(clientIp)}`;
        const ipwhoRes = await fetch(ipwhoUrl, { signal: AbortSignal.timeout(4000) });
        if (ipwhoRes.ok) {
          const ipwhoData: any = await ipwhoRes.json();
          if (ipwhoData.success !== false && typeof ipwhoData.latitude === 'number' && typeof ipwhoData.longitude === 'number') {
            return res.json({
              success: true,
              latitude: ipwhoData.latitude,
              longitude: ipwhoData.longitude,
              city: ipwhoData.city || ipwhoData.region || 'Detected Location',
              region: ipwhoData.region || '',
              country: ipwhoData.country || ipwhoData.country_code || '',
              ip: clientIp || ipwhoData.ip,
              source: 'ip',
            });
          }
        }
      } catch (ipwhoErr) {
        console.warn('Secondary geo service failed:', ipwhoErr);
      }

      // Default baseline: New Delhi Safdarjung
      res.json({
        success: true,
        latitude: 28.5833,
        longitude: 77.2000,
        city: 'New Delhi',
        region: 'Delhi',
        country: 'India',
        source: 'default',
      });
    } catch (err: any) {
      res.json({
        success: true,
        latitude: 28.5833,
        longitude: 77.2000,
        city: 'New Delhi',
        region: 'Delhi',
        country: 'India',
        source: 'default',
      });
    }
  });

  // GET /api/weather/nearest?lat=...&lon=... (and /api/weather/current)
  const handleGetCurrentLocationWeather = async (req: express.Request, res: express.Response) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);
      const city = req.query.city as string | undefined;
      const region = req.query.region as string | undefined;
      const country = req.query.country as string | undefined;

      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ success: false, error: 'Valid lat and lon numeric query parameters required' });
      }

      const result = await weatherDataService.getCurrentLocationWeather(lat, lon, { city, region, country });
      res.json({
        success: true,
        nearest_station: result.station,
        station: result.station,
        distance_km: result.distance_km,
        data: result.data,
      });
    } catch (error: any) {
      console.error('Error in handleGetCurrentLocationWeather:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  app.get('/api/weather/nearest', handleGetCurrentLocationWeather);
  app.get('/api/weather/current', handleGetCurrentLocationWeather);

  // POST /api/weather/refresh/:station_id
  app.post('/api/weather/refresh/:station_id', async (req, res) => {
    try {
      const { station_id } = req.params;
      const data = await weatherDataService.refreshWeatherData(station_id);
      if (!data) {
        return res.status(404).json({ success: false, error: `Station ${station_id} not found` });
      }
      res.json({ success: true, station_id, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /weather/:station_id and /api/weather/station/:station_id
  const handleGetWeatherByStation = async (req: express.Request, res: express.Response) => {
    try {
      const { station_id } = req.params;
      const data = await weatherDataService.getWeatherData(station_id);
      if (!data) {
        return res.status(404).json({ success: false, error: `Weather station ${station_id} not found in telemetry registry` });
      }
      res.json({ success: true, station_id, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  app.get('/api/weather/station/:station_id', handleGetWeatherByStation);
  app.get('/api/weather/:station_id', handleGetWeatherByStation);
  app.get('/weather/:station_id', handleGetWeatherByStation);

  // MODULE 2: Cross-Source Evidence Correlation & Verification Endpoints
  app.get('/api/correlation/events', (req, res) => {
    try {
      const { hazard, confidence, city } = req.query;
      let events = correlationEngine.getEvents();

      if (hazard && hazard !== 'ALL') {
        events = events.filter((e) => e.hazard_type.toLowerCase() === (hazard as string).toLowerCase());
      }
      if (confidence && confidence !== 'ALL') {
        events = events.filter((e) => e.confidence.confidence_level === confidence);
      }
      if (city) {
        events = events.filter((e) => e.city.toLowerCase().includes((city as string).toLowerCase()));
      }

      res.json({
        success: true,
        count: events.length,
        events,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/correlation/events/:id', (req, res) => {
    try {
      const event = correlationEngine.getEventById(req.params.id);
      if (!event) {
        return res.status(404).json({ success: false, error: 'Correlated event not found' });
      }
      res.json({ success: true, event });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/correlation/stats', (req, res) => {
    try {
      const stats = correlationEngine.getStats();
      res.json({ success: true, stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/correlation/recompute', (req, res) => {
    try {
      const events = correlationEngine.correlateAllReports();
      aiVerificationEngine.verifyAllEvents();
      operationalDecisionEngine.refreshAllDecisions();
      res.json({
        success: true,
        count: events.length,
        events,
        message: 'Recomputed cross-source event correlation across all normalized reports',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/correlation/inject-conflict', (req, res) => {
    try {
      const { event_id } = req.body;
      if (!event_id) {
        return res.status(400).json({ success: false, error: 'event_id is required' });
      }
      const result = correlationEngine.injectSampleConflict(event_id);
      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }
      aiVerificationEngine.verifyAllEvents();
      operationalDecisionEngine.refreshAllDecisions();
      res.json({
        success: true,
        new_report: result.newReport,
        updated_event: correlationEngine.getEventById(event_id),
        message: 'Injected conflicting ground report and updated confidence audit',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/correlation/verify-ai/:id', async (req, res) => {
    try {
      const updated = await correlationEngine.verifyEventWithAI(req.params.id);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Event not found' });
      }
      res.json({
        success: true,
        event: updated,
        message: 'AI Deep Meteorological Verification completed',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // MODULE 3: AI Verification & Explainable Decision Support Endpoints
  app.get('/api/verification/events', (req, res) => {
    try {
      const { confidence_level, hazard, official_only, has_media, search } = req.query;
      let verifications = aiVerificationEngine.getAllVerifications();

      if (confidence_level && confidence_level !== 'ALL') {
        verifications = verifications.filter((v) => v.confidence_level === confidence_level);
      }
      if (hazard && hazard !== 'ALL') {
        verifications = verifications.filter((v) => v.hazard.toLowerCase() === (hazard as string).toLowerCase());
      }
      if (official_only === 'true') {
        verifications = verifications.filter((v) => v.supporting_sources.official_count > 0);
      }
      if (has_media === 'true') {
        verifications = verifications.filter((v) => v.factors.image_video_evidence.score >= 80);
      }
      if (search && typeof search === 'string' && search.trim()) {
        const q = search.toLowerCase().trim();
        verifications = verifications.filter((v) =>
          `${v.event_id} ${v.hazard} ${v.location.city} ${v.location.state} ${v.confidence_explanation}`
            .toLowerCase()
            .includes(q)
        );
      }

      res.json({
        success: true,
        count: verifications.length,
        verifications,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/verification/events/:id', (req, res) => {
    try {
      const result = aiVerificationEngine.getVerificationByEventId(req.params.id);
      if (!result) {
        return res.status(404).json({ success: false, error: 'Verification result not found' });
      }
      res.json({ success: true, verification: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/verification/stats', (req, res) => {
    try {
      const stats = aiVerificationEngine.getStats();
      res.json({ success: true, stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/verification/analyze/:id', async (req, res) => {
    try {
      const enhanced = await aiVerificationEngine.enhanceWithGemini(req.params.id);
      if (!enhanced) {
        return res.status(404).json({ success: false, error: 'Event not found' });
      }
      res.json({
        success: true,
        verification: enhanced,
        message: 'AI-assisted verification and decision support analysis updated',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/verification/batch-analyze', (req, res) => {
    try {
      const verifications = aiVerificationEngine.verifyAllEvents();
      operationalDecisionEngine.refreshAllDecisions();
      res.json({
        success: true,
        count: verifications.length,
        verifications,
        message: 'Recomputed 9-factor verification across all correlated events',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // JURY DEMO: Hero Scenario Endpoints
  app.get('/api/demo/state', (req, res) => {
    try {
      res.json({
        success: true,
        is_verified: aiVerificationEngine.isHeroVerified(),
        is_conflict_resolved: aiVerificationEngine.isHeroConflictResolved(),
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/verification/verify-hero', (req, res) => {
    try {
      const verification = aiVerificationEngine.verifyHeroEvent();
      operationalDecisionEngine.refreshAllDecisions();
      const decisions = operationalDecisionEngine.getAllDecisions();
      const heroDecision = decisions.find(
        (d) => d.event_id.includes('CHE') || d.location.city.toLowerCase().includes('saidapet')
      );
      res.json({
        success: true,
        verification,
        decision: heroDecision,
        message: 'Chennai Saidapet Flash Flood event verified to 91% HIGH confidence',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/verification/resolve-hero-conflict', (req, res) => {
    try {
      const verification = aiVerificationEngine.resolveHeroConflict();
      operationalDecisionEngine.refreshAllDecisions();
      const decisions = operationalDecisionEngine.getAllDecisions();
      const heroDecision = decisions.find(
        (d) => d.event_id.includes('CHE') || d.location.city.toLowerCase().includes('saidapet')
      );
      res.json({
        success: true,
        verification,
        decision: heroDecision,
        message: 'Saidapet bridge discrepancy resolved via ground spotter & drone survey',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/demo/reset-scenario', (req, res) => {
    try {
      storage.resetData();
      aiVerificationEngine.resetHeroScenario();
      operationalDecisionEngine.refreshAllDecisions();
      res.json({
        success: true,
        message: 'Demo scenario reset to initial unverified state (48% LOW confidence, 2 conflicts)',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ==============================================================
  // MODULE 4: Operational Decision Support & Action Panel Endpoints
  // ==============================================================

  app.get('/api/decision-support/decisions', (req, res) => {
    try {
      const { escalation_level, confidence_level, hazard, search } = req.query;
      let decisions = operationalDecisionEngine.getAllDecisions();

      if (escalation_level && escalation_level !== 'ALL') {
        decisions = decisions.filter((d) => d.escalation_level === escalation_level);
      }
      if (confidence_level && confidence_level !== 'ALL') {
        decisions = decisions.filter((d) => d.current_evidence_confidence.level === confidence_level);
      }
      if (hazard && hazard !== 'ALL') {
        decisions = decisions.filter((d) => d.hazard.toLowerCase() === (hazard as string).toLowerCase());
      }
      if (search && typeof search === 'string' && search.trim()) {
        const q = search.toLowerCase().trim();
        decisions = decisions.filter(
          (d) =>
            d.event_id.toLowerCase().includes(q) ||
            d.hazard.toLowerCase().includes(q) ||
            d.location.city.toLowerCase().includes(q) ||
            d.location.state.toLowerCase().includes(q) ||
            d.recommended_operational_action.action_title.toLowerCase().includes(q) ||
            d.recommended_next_verification_step.step_title.toLowerCase().includes(q)
        );
      }

      res.json({
        success: true,
        count: decisions.length,
        decisions,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/decision-support/decisions/:id', (req, res) => {
    try {
      const decision = operationalDecisionEngine.getDecisionByEventId(req.params.id);
      if (!decision) {
        return res.status(404).json({ success: false, error: 'Decision support record not found for event' });
      }
      res.json({
        success: true,
        decision,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/decision-support/stats', (req, res) => {
    try {
      const stats = operationalDecisionEngine.getStats();
      res.json({
        success: true,
        stats,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/decision-support/action-log', (req, res) => {
    try {
      const { event_id, action_type, actor, notes } = req.body;
      if (!event_id || !action_type || !notes) {
        return res.status(400).json({
          success: false,
          error: 'event_id, action_type, and notes are required',
        });
      }
      const updated = operationalDecisionEngine.logOperationalAction(event_id, action_type, actor, notes);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Event not found' });
      }
      res.json({
        success: true,
        decision: updated,
        message: 'Logged operational verification action successfully',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/decision-support/refresh', (req, res) => {
    try {
      aiVerificationEngine.verifyAllEvents();
      const decisions = operationalDecisionEngine.refreshAllDecisions();
      res.json({
        success: true,
        count: decisions.length,
        decisions,
        message: 'Synchronized decisions with latest evidence verification matrix',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Ingest API endpoint - Converts heterogeneous report into common data model
  app.post('/api/ingest', (req, res) => {
    try {
      const { source_type, payload } = req.body;

      if (!source_type && !payload) {
        // Direct payload check
        if (req.body.content && req.body.city) {
          const directNormalized = normalizeIncomingPayload(req.body.source_type || 'CITIZEN', req.body);
          const saved = storage.saveReport(directNormalized);
          return res.status(201).json({
            success: true,
            report: saved.report,
            is_duplicate: saved.isDuplicate,
            message: 'Report ingested and converted to common data model',
          });
        }
        return res.status(400).json({
          success: false,
          error: 'Invalid ingestion payload: source_type and payload are required',
        });
      }

      // Convert incoming heterogeneous payload to standard Common Data Model
      const normalized = normalizeIncomingPayload(source_type as SourceType, payload);
      
      // Store in repository and execute duplicate detection
      const { report, isDuplicate } = storage.saveReport(normalized);

      res.status(201).json({
        success: true,
        report,
        is_duplicate: isDuplicate,
        message: isDuplicate
          ? `Report ingested with ${report.duplicate_status} flag`
          : 'Report successfully ingested into common data model',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to normalize and ingest weather report',
      });
    }
  });

  // Ingest batch endpoint
  app.post('/api/ingest/batch', (req, res) => {
    try {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ success: false, error: 'Expected items array' });
      }

      const results = items.map((item) => {
        try {
          const normalized = normalizeIncomingPayload(item.source_type, item.payload);
          return storage.saveReport(normalized);
        } catch (err: any) {
          return { error: err.message };
        }
      });

      res.status(201).json({
        success: true,
        count: results.length,
        results,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Trigger random simulated sample ingestion from one of the 5 sources
  app.post('/api/ingest/sample', (req, res) => {
    try {
      const { source_type } = req.body || {};
      const sources: SourceType[] = ['SOCIAL_MEDIA', 'CITIZEN', 'WEATHER_API', 'PUBLIC_DATASET', 'WEBSITE'];
      const chosenSource: SourceType = source_type || sources[Math.floor(Math.random() * sources.length)];

      const sampleGenerators: Record<SourceType, () => any> = {
        SOCIAL_MEDIA: () => ({
          platform: ['Twitter/X', 'Bluesky', 'Threads'][Math.floor(Math.random() * 3)],
          post_id: Date.now().toString(),
          user_handle: `chennai_rain_spotter_${Math.floor(Math.random() * 900 + 100)}`,
          display_name: 'Chennai Monsoon Citizen Net',
          post_text: [
            '[DEMO / SIMULATED DATA] Inundation spreading along Velachery Bypass and Vijaya Nagar! Water level above 3 feet, GCC motor pumps running.',
            '[DEMO / SIMULATED DATA] Heavy localized waterlogging reported on GST Road near Guindy Kathipara flyover. Slow movement of traffic.',
            '[DEMO / SIMULATED DATA] Adyar river bank near Saidapet causeway surging fast. GCC volunteers guiding residents to higher ground.',
            '[DEMO / SIMULATED DATA] Torrential cloudburst at Sholinganallur OMR IT corridor, 2.5 feet standing water in service lanes.',
          ][Math.floor(Math.random() * 4)],
          media_links: ['https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80'],
          geo: {
            lat: 13.0067 + (Math.random() - 0.5) * 0.08,
            lng: 80.2180 + (Math.random() - 0.5) * 0.08,
            city: 'Chennai',
            state: 'TN',
          },
          created_at: new Date().toISOString(),
        }),
        CITIZEN: () => ({
          app_name: 'TN Smart Citizen Weather App',
          observer_id: `SPOT-CHE-${Math.floor(Math.random() * 9000 + 1000)}`,
          observer_alias: `Chennai Observer ${Math.floor(Math.random() * 100)}`,
          observation_text: [
            '[DEMO / SIMULATED DATA] Measured 95mm rainfall in 60 minutes with rooftop rain gauge. Street drain backflow observed.',
            '[DEMO / SIMULATED DATA] Flash waterlogging crossing 2.5 feet on South Usman Road, T. Nagar. Ground floor shops sandbagging entrances.',
            '[DEMO / SIMULATED DATA] Adyar river bridge Saidapet: water level stable at 14.2m, no breach on main bridge deck.',
            '[DEMO / SIMULATED DATA] Chembarambakkam canal outflow causing backwater stagnation in low-lying residential plots in Madipakkam.',
          ][Math.floor(Math.random() * 4)],
          hazard_type: 'Flash Flood',
          location: {
            city: ['Chennai', 'Velachery', 'Saidapet', 'T. Nagar', 'Madipakkam'][Math.floor(Math.random() * 5)],
            state: 'TN',
            lat: 13.0100 + (Math.random() - 0.5) * 0.06,
            lon: 80.2200 + (Math.random() - 0.5) * 0.06,
          },
          recorded_time: new Date().toISOString(),
          accuracy_meters: 10,
        }),
        WEATHER_API: () => ({
          service: 'IMD RMC Chennai API',
          alert_id: `IMD-CHE-${Date.now().toString().slice(-6)}`,
          event_name: 'Flash Flood',
          headline: '[DEMO / SIMULATED DATA] Flash Flood Warning issued for Greater Chennai Corporation zones',
          description: 'Intense convective precipitation cluster active over coastal Tamil Nadu. Rainfall rate 45-65mm/hr producing urban flash inundation.',
          area_desc: 'Chennai District, TN',
          state_abbr: 'TN',
          centroid: {
            lat: 13.0418 + (Math.random() - 0.5) * 0.05,
            lon: 80.2341 + (Math.random() - 0.5) * 0.05,
          },
          api_endpoint: `https://rmcchennai.imd.gov.in/alerts/IMD-CHE-${Date.now()}`,
          published_time: new Date().toISOString(),
        }),
        PUBLIC_DATASET: () => ({
          agency: 'TNSDMA_CWC',
          dataset_name: 'Hydro-Met Telemetry Registry',
          record_id: `TNSDMA-PUB-${Date.now().toString().slice(-6)}`,
          event_type: 'Flash Flood',
          narrative: '[DEMO / SIMULATED DATA] Automated ultrasonic hydrometric gauge recorded Adyar river level 14.6m, exceeding alert threshold.',
          cz_name: 'Chennai District',
          state_alpha: 'TN',
          begin_lat: 13.0150 + (Math.random() - 0.5) * 0.04,
          begin_lon: 80.2210 + (Math.random() - 0.5) * 0.04,
          record_timestamp: new Date().toISOString(),
          source_catalog_url: 'https://tnsdma.tn.gov.in/hydromet',
        }),
        WEBSITE: () => ({
          site_name: 'The Hindu Meteorological Special Report',
          article_url: `https://thehindu.example.com/weather/chennai-flood-live-${Date.now()}`,
          author_byline: 'Chennai City Bureau',
          headline: '[DEMO / SIMULATED DATA] Cloudburst Inundation Spreads across Velachery and South Chennai',
          body_text: '[DEMO / SIMULATED DATA] GCC engineers have dispatched 450 high-capacity dewatering pumps to clear waterlogged underpasses across Velachery, Saidapet, and T. Nagar.',
          publication_date: new Date().toISOString(),
          city: 'Chennai',
          state: 'TN',
          latitude: 12.9815 + (Math.random() - 0.5) * 0.05,
          longitude: 80.2180 + (Math.random() - 0.5) * 0.05,
          featured_media_url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80',
        }),
      };

      const rawPayload = sampleGenerators[chosenSource]();
      const normalized = normalizeIncomingPayload(chosenSource, rawPayload);
      const saved = storage.saveReport(normalized);
      correlationEngine.correlateAllReports();

      res.status(201).json({
        success: true,
        report: saved.report,
        is_duplicate: saved.isDuplicate,
        message: `Ingested new sample report from ${chosenSource}`,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Reset/seed data endpoint
  app.post('/api/reports/reset', (req, res) => {
    try {
      storage.clear();
      const seeded = storage.seedInitialData();
      correlationEngine.correlateAllReports();
      res.json({
        success: true,
        message: 'Storage reset and seeded with initial multi-source reports',
        count: seeded.length,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // -------------------------------------------------------------
  // AI Disaster Intelligence & Weather Assistant Bot Endpoints
  // -------------------------------------------------------------
  app.post('/api/bot/chat', async (req, res) => {
    try {
      const { message, history, locationMeta } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ success: false, error: 'Query message string is required.' });
      }

      const response = await weatherBotService.handleChat({
        message,
        history,
        locationMeta,
      });

      res.json(response);
    } catch (error: any) {
      console.error('Error handling /api/bot/chat:', error);
      res.status(500).json({ success: false, error: error.message || 'Internal bot processing error' });
    }
  });

  app.get('/api/bot/status', (req, res) => {
    const hasKey = !!process.env.GEMINI_API_KEY;
    res.json({
      success: true,
      bot_name: 'AeroBot AI Disaster & Weather Assistant',
      model: 'gemini-3.8-flash',
      gemini_live: hasKey,
      status: 'operational',
      capabilities: [
        'Live weather telemetry analysis',
        'Multi-source disaster evidence explanation',
        'NDMA & SDMA emergency decision plan advisories',
        'Ingestion REST API assistance',
        'Citizen safety recommendations',
      ],
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/bot/suggestions', (req, res) => {
    const events = correlationEngine.getEvents();
    const suggestions = [
      'What is the current weather at my location?',
      events.length > 0 ? `Explain active flood event ${events[0].event_id}` : 'Explain the Chennai Saidapet flood scenario',
      'What actions are recommended by the decision panel?',
      'How do I ingest a report into the Common Data Model via API?',
      'What is the correlation confidence score for Saidapet?',
      'Draft an emergency citizen advisory for waterlogged zones',
    ];
    res.json({ success: true, suggestions });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Weather Ingestion Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
