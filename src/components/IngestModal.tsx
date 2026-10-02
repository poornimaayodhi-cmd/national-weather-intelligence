import React, { useState } from 'react';
import { X, Send, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SourceType, WeatherReport } from '../types.ts';

interface IngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngestSuccess: (newReport: WeatherReport) => void;
}

const templates: Record<SourceType, any> = {
  SOCIAL_MEDIA: {
    platform: 'Twitter/X',
    post_id: '183499102847',
    user_handle: 'ChennaiRainsLive',
    display_name: 'Chennai Monsoon Spotter Net',
    post_text: '[DEMO / SIMULATED DATA] Water level reaching 4 feet near Velachery MRTS station and Vijaya Nagar bus stop! Cars floating, NDRF boats deployed for evacuation. #ChennaiRains #VelacheryFloods',
    media_links: ['https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80'],
    geo: {
      lat: 12.9815,
      lng: 80.2180,
      city: 'Chennai',
      state: 'TN',
    },
    created_at: new Date().toISOString(),
  },
  CITIZEN: {
    app_name: 'TN Smart Citizen Weather App',
    observer_id: 'SPOT-TN-9921',
    observer_alias: 'Citizen Spotter Harish Kumar',
    observation_text: '[DEMO / SIMULATED DATA] Extreme torrential downpour at Madipakkam / Puzhuthivakkam. Water level entering living rooms, 3 feet standing water on Main Road.',
    hazard_type: 'Flash Flood',
    photo_url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
    location: {
      city: 'Madipakkam, Chennai',
      state: 'TN',
      lat: 12.9647,
      lon: 80.1961,
    },
    recorded_time: new Date().toISOString(),
    accuracy_meters: 10,
  },
  WEATHER_API: {
    service: 'IMD RMC Chennai API',
    alert_id: 'IMD-CHE-NOW-2026-0912-08',
    event_name: 'Flash Flood',
    headline: '[DEMO / SIMULATED DATA] Flash Flood Nowcast Alert for Greater Chennai and Coastal Suburbs',
    description: 'Very intense convective clouds moving inland from Bay of Bengal. Intense spell of 60-80mm/hr expected over next 2 hours. Severe urban inundation warning.',
    area_desc: 'Chennai, TN',
    state_abbr: 'TN',
    centroid: {
      lat: 13.0827,
      lon: 80.2707,
    },
    api_endpoint: 'https://rmcchennai.imd.gov.in/nowcast/IMD-CHE-NOW-2026-0912-08',
    published_time: new Date().toISOString(),
  },
  PUBLIC_DATASET: {
    agency: 'TNSDMA_CWC',
    dataset_name: 'State Disaster Inundation Registry',
    record_id: 'TNSDMA-EVT-2026-0912-CHE',
    event_type: 'Flash Flood',
    narrative: '[DEMO / SIMULATED DATA] Automatic gauge at Chembarambakkam Surplus Canal recorded peak discharge of 12,400 cusecs flowing into Adyar river corridor. Downstream alert sounded for Saidapet, Jafferkhanpet, and Kotturpuram.',
    cz_name: 'Chennai District',
    state_alpha: 'TN',
    begin_lat: 13.0102,
    begin_lon: 80.2155,
    record_timestamp: new Date().toISOString(),
    source_catalog_url: 'https://tnsdma.tn.gov.in/registry/TNSDMA-EVT-2026-0912-CHE',
  },
  WEBSITE: {
    site_name: 'The Hindu Meteorological Special Report',
    article_url: 'https://thehindu.example.com/weather/chennai-floods-adyar-velachery-live',
    author_byline: 'Special Correspondent, Chennai Bureau',
    headline: '[DEMO / SIMULATED DATA] Inundation Warning: Adyar River Near Danger Mark; GCC Deploys Relief Teams',
    body_text: '[DEMO / SIMULATED DATA] Greater Chennai Corporation and Tamil Nadu Fire and Rescue Services have set up 169 relief shelters across flooded sectors in South Chennai as Chembarambakkam releases increase.',
    publication_date: new Date().toISOString(),
    city: 'Chennai',
    state: 'TN',
    latitude: 13.0250,
    longitude: 80.2280,
    featured_media_url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80',
  },
};

export const IngestModal: React.FC<IngestModalProps> = ({ isOpen, onClose, onIngestSuccess }) => {
  const [sourceType, setSourceType] = useState<SourceType>('SOCIAL_MEDIA');
  const [jsonPayload, setJsonPayload] = useState<string>(
    JSON.stringify(templates['SOCIAL_MEDIA'], null, 2)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSourceChange = (type: SourceType) => {
    setSourceType(type);
    setJsonPayload(JSON.stringify(templates[type], null, 2));
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      let parsedPayload: any;
      try {
        parsedPayload = JSON.parse(jsonPayload);
      } catch (err: any) {
        throw new Error('Invalid JSON syntax: ' + err.message);
      }

      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_type: sourceType,
          payload: parsedPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to ingest report');
      }

      setSuccessMsg(`Ingested successfully! Assigned ID: ${data.report.report_id} (${data.report.duplicate_status})`);
      onIngestSuccess(data.report);

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div
        id="ingest-test-modal"
        className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-950/60 text-blue-400 border border-blue-800/60 rounded-lg">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Ingest Weather Report API Tester</h3>
              <p className="text-xs text-slate-400">
                Submit raw heterogeneous payloads to the normalization pipeline endpoint (<code className="font-mono text-blue-400">POST /api/ingest</code>)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Type Selector */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-2">
                Select Source Type for Ingestion:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(['SOCIAL_MEDIA', 'CITIZEN', 'WEATHER_API', 'PUBLIC_DATASET', 'WEBSITE'] as SourceType[]).map(
                  (type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleSourceChange(type)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                        sourceType === type
                          ? 'bg-blue-600 text-white border-blue-500 shadow-xs font-semibold'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  )
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-200">
                  Raw Source Payload (JSON):
                </label>
                <button
                  type="button"
                  onClick={() => setJsonPayload(JSON.stringify(templates[sourceType], null, 2))}
                  className="text-xs text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Reset to Template
                </button>
              </div>
              <textarea
                value={jsonPayload}
                onChange={(e) => setJsonPayload(e.target.value)}
                rows={12}
                className="w-full font-mono text-xs p-3 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                spellCheck={false}
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-lg flex items-start gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-950/70 border border-emerald-800 rounded-lg flex items-start gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Payload is converted to 17-field common data model
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="submit-ingest-btn"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Ingesting...' : 'Ingest & Standardize'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
