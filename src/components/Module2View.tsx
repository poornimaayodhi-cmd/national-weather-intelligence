import React, { useState, useEffect, useId } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Layers,
  MapPin,
  Clock,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Share2,
  Radio,
  CloudLightning,
  Database,
  Globe,
  TrendingUp,
  Activity,
  ArrowRight,
  Compass,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';
import { CorrelatedWeatherEvent, CorrelationStats, SourceType } from '../types.ts';
import { EventDetailModal } from './EventDetailModal.tsx';

interface Module2ViewProps {
  onSwitchToModule1: () => void;
  onSwitchToModule3?: (eventId?: string) => void;
  onSwitchToModule4?: (eventId?: string) => void;
  selectedEventId?: string | null;
  onClearSelectedEventId?: () => void;
}

export const Module2View: React.FC<Module2ViewProps> = ({
  onSwitchToModule1,
  onSwitchToModule3,
  onSwitchToModule4,
  selectedEventId,
  onClearSelectedEventId,
}) => {
  const [events, setEvents] = useState<CorrelatedWeatherEvent[]>([]);
  const [stats, setStats] = useState<CorrelationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecomputing, setIsRecomputing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [hazardFilter, setHazardFilter] = useState('ALL');
  const [confidenceFilter, setConfidenceFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Action States
  const [activeModalEvent, setActiveModalEvent] = useState<CorrelatedWeatherEvent | null>(null);
  const [isInjectingConflict, setIsInjectingConflict] = useState(false);
  const [isVerifyingAI, setIsVerifyingAI] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const searchInputId = useId();

  const sourceIcons: Record<SourceType, React.ReactNode> = {
    SOCIAL_MEDIA: <Share2 className="w-3 h-3 text-blue-400" />,
    CITIZEN: <Radio className="w-3 h-3 text-emerald-400" />,
    WEATHER_API: <CloudLightning className="w-3 h-3 text-sky-400" />,
    PUBLIC_DATASET: <Database className="w-3 h-3 text-amber-400" />,
    WEBSITE: <Globe className="w-3 h-3 text-slate-300" />,
  };

  const fetchEventsAndStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [eventsRes, statsRes] = await Promise.all([
        fetch('/api/correlation/events'),
        fetch('/api/correlation/stats'),
      ]);

      const eventsData = await eventsRes.json();
      const statsData = await statsRes.json();

      if (eventsData.success) {
        setEvents(eventsData.events);
        // If a specific event was requested from Module 1, open it immediately
        if (selectedEventId) {
          const match = eventsData.events.find((e: CorrelatedWeatherEvent) => e.event_id === selectedEventId);
          if (match) {
            setActiveModalEvent(match);
          }
        }
      } else {
        setError(eventsData.error || 'Failed to fetch correlated events');
      }

      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching correlation events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsAndStats();
  }, [selectedEventId]);

  const handleRecompute = async () => {
    try {
      setIsRecomputing(true);
      const res = await fetch('/api/correlation/recompute', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setEvents(data.events);
        const statsRes = await fetch('/api/correlation/stats');
        const statsData = await statsRes.json();
        if (statsData.success) setStats(statsData.stats);
        setActionSuccessMsg('Recomputed cross-source correlation across all reports.');
        setTimeout(() => setActionSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to recompute correlation');
    } finally {
      setIsRecomputing(false);
    }
  };

  const handleInjectConflict = async (eventId: string) => {
    try {
      setIsInjectingConflict(true);
      const res = await fetch('/api/correlation/inject-conflict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchEventsAndStats();
        if (data.updated_event) {
          setActiveModalEvent(data.updated_event);
        }
        setActionSuccessMsg('Injected conflicting eyewitness observation. Confidence score recalculated!');
        setTimeout(() => setActionSuccessMsg(null), 4000);
      } else {
        alert(data.error || 'Failed to inject conflict');
      }
    } catch (err: any) {
      alert(err.message || 'Error injecting conflict');
    } finally {
      setIsInjectingConflict(false);
    }
  };

  const handleVerifyWithAI = async (eventId: string) => {
    try {
      setIsVerifyingAI(true);
      const res = await fetch(`/api/correlation/verify-ai/${eventId}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success && data.event) {
        setActiveModalEvent(data.event);
        setEvents((prev) => prev.map((e) => (e.event_id === eventId ? data.event : e)));
        setActionSuccessMsg('AI Deep Meteorological Verification generated successfully.');
        setTimeout(() => setActionSuccessMsg(null), 4000);
      } else {
        alert(data.error || 'AI verification failed');
      }
    } catch (err: any) {
      alert(err.message || 'Error generating AI verification');
    } finally {
      setIsVerifyingAI(false);
    }
  };

  const getConfidenceBadge = (level: string, score: number) => {
    switch (level) {
      case 'VERY_HIGH':
        return {
          bg: 'bg-emerald-950/80 border-emerald-800 text-emerald-300',
          dot: 'bg-emerald-400',
          label: 'Highly Confirmed',
        };
      case 'HIGH':
        return {
          bg: 'bg-blue-950/80 border-blue-800 text-blue-300',
          dot: 'bg-blue-400',
          label: 'Strong Corroboration',
        };
      case 'DISPUTED':
        return {
          bg: 'bg-rose-950/80 border-rose-800 text-rose-300',
          dot: 'bg-rose-400',
          label: 'Disputed / Conflicting',
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-950/80 border-amber-800 text-amber-300',
          dot: 'bg-amber-400',
          label: 'Moderate Agreement',
        };
      default:
        return {
          bg: 'bg-slate-800 border-slate-700 text-slate-300',
          dot: 'bg-slate-400',
          label: 'Low / Single Source',
        };
    }
  };

  // Filtered events
  const filteredEvents = events.filter((ev) => {
    if (hazardFilter !== 'ALL' && ev.hazard_type.toLowerCase() !== hazardFilter.toLowerCase()) {
      return false;
    }
    if (confidenceFilter !== 'ALL' && ev.confidence.confidence_level !== confidenceFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${ev.title} ${ev.city} ${ev.state} ${ev.hazard_type} ${ev.event_id}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Mission Context */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-800">
              Module 2 Engine Active
            </span>
            <span className="text-xs text-slate-400">
              Cross-Source Evidence Correlation & Verification
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Correlated Weather Events & Verification Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Automatically aggregates normalized reports into unified weather events based on spatial proximity, temporal coincidence, hazard compatibility, and semantic similarity. Original reports remain preserved in Module 1.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRecompute}
            disabled={isRecomputing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-colors shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecomputing ? 'animate-spin' : ''}`} />
            <span>{isRecomputing ? 'Re-correlating...' : 'Re-run Correlation Engine'}</span>
          </button>

          <button
            onClick={onSwitchToModule1}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors shadow-xs"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>View Normalized Reports (Module 1)</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Stats KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-medium text-slate-400 block mb-1">
              Correlated Events
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                {stats.total_events}
              </span>
              <span className="text-[11px] text-slate-400">
                ({stats.total_correlated_reports} reports linked)
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-medium text-emerald-400 block mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Highly Verified
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-emerald-300">
                {stats.highly_verified_events}
              </span>
              <span className="text-[11px] text-emerald-400/80 font-medium">
                ≥ 85% Confidence
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-medium text-rose-400 block mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Disputed / Conflicting
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-rose-300">
                {stats.disputed_events}
              </span>
              <span className="text-[11px] text-rose-400/80 font-medium">
                Contradictory Reports
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-medium text-blue-400 block mb-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Avg Evidence Score
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                {stats.avg_confidence}%
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Multi-factor score
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id={searchInputId}
              type="text"
              placeholder="Search by city, event title, or hazard..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 text-xs focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Hazard Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Hazard:</span>
            <select
              value={hazardFilter}
              onChange={(e) => setHazardFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-blue-500"
            >
              <option value="ALL">All Hazards</option>
              <option value="Flash Flood">Flash Flood</option>
              <option value="Hailstorm">Hailstorm</option>
              <option value="Tornado">Tornado</option>
              <option value="Severe Thunderstorm">Severe Thunderstorm</option>
              <option value="Winter Storm">Winter Storm</option>
              <option value="Wildfire">Wildfire</option>
            </select>
          </div>

          {/* Confidence Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Verification:</span>
            <select
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-blue-500"
            >
              <option value="ALL">All Confidence Tiers</option>
              <option value="VERY_HIGH">Highly Confirmed (≥85%)</option>
              <option value="HIGH">Strong Corroboration (70-84%)</option>
              <option value="MODERATE">Moderate Agreement (50-69%)</option>
              <option value="DISPUTED">Disputed / Conflicting</option>
            </select>
          </div>

          {(hazardFilter !== 'ALL' || confidenceFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setHazardFilter('ALL');
                setConfidenceFilter('ALL');
                setSearchQuery('');
              }}
              className="text-blue-400 hover:underline text-[11px]"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400" />
          <p className="text-xs">Computing cross-source evidence correlation & confidence scores...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
          <Layers className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-200">No matching correlated events</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search criteria or re-running the correlation engine over current reports.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredEvents.map((ev) => {
            const conf = getConfidenceBadge(ev.confidence.confidence_level, ev.confidence.overall_score);
            const hasConflict = ev.conflicting_report_ids.length > 0;

            return (
              <div
                key={ev.event_id}
                id={`event-card-${ev.event_id}`}
                className={`p-5 rounded-2xl bg-slate-900 border transition-all duration-200 flex flex-col justify-between gap-4 hover:border-slate-700 hover:shadow-xl ${
                  hasConflict ? 'border-rose-900/60' : 'border-slate-800'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-[11px] font-bold bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded">
                          {ev.event_id}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {ev.hazard_type}
                        </span>
                        {hasConflict && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                            {ev.conflicting_report_ids.length} Conflicting
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white tracking-tight">
                        {ev.title}
                      </h3>
                    </div>

                    {/* Confidence Meter Badge */}
                    <div className="text-right shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${conf.bg}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${conf.dot}`}></span>
                        <span>{ev.confidence.overall_score}%</span>
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">{conf.label}</p>
                    </div>
                  </div>

                  {/* Geolocation & Time Summary */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-850 mb-3">
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-500 font-medium block">EPICENTER & RADIUS</span>
                      <div className="flex items-center gap-1 text-slate-300 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{ev.city}, {ev.state}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ~{ev.radius_km} km radius ({ev.centroid_lat}°N, {ev.centroid_lng}°W)
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-500 font-medium block">TEMPORAL WINDOW</span>
                      <div className="flex items-center gap-1 text-slate-300 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{ev.duration_hours}h active period</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(ev.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(ev.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Grouping Reasoning Snippet */}
                  <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-850 mb-3 space-y-1">
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                      Grouping Rationale:
                    </span>
                    <p className="text-xs text-slate-300 line-clamp-2">
                      {ev.grouping_reasons.spatial_reason}
                    </p>
                  </div>

                  {/* Sources Representation */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-slate-400 font-medium">Sources:</span>
                      {ev.source_types_present.map((st) => (
                        <span
                          key={st}
                          className="p-1 rounded bg-slate-950 border border-slate-800 inline-flex items-center"
                          title={st}
                        >
                          {sourceIcons[st]}
                        </span>
                      ))}
                      <span className="text-[11px] font-mono text-slate-300 ml-1">
                        {ev.total_sources_count} total reports ({ev.supporting_report_ids.length} supporting, {ev.conflicting_report_ids.length} conflicting)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-850 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Baseline: {ev.confidence.baseline_reliability}%
                  </span>

                  <div className="flex items-center gap-2 flex-wrap">
                    {onSwitchToModule4 && (
                      <button
                        onClick={() => onSwitchToModule4(ev.event_id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 rounded-lg transition-colors shadow-xs"
                        title="Open in Module 4: Operational Decision Support & Action Panel"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                        <span>Action Panel</span>
                      </button>
                    )}

                    {onSwitchToModule3 && (
                      <button
                        onClick={() => onSwitchToModule3(ev.event_id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-950/60 hover:bg-blue-900 text-blue-200 border border-blue-800/60 rounded-lg transition-colors shadow-xs"
                        title="Open in Module 3: AI Verification & Explainable Decision Support"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                        <span>Module 3 Audit</span>
                      </button>
                    )}

                    <button
                      onClick={() => setActiveModalEvent(ev)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-xs"
                    >
                      <span>Inspect Event Evidence</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active Modal */}
      {activeModalEvent && (
        <EventDetailModal
          event={activeModalEvent}
          onClose={() => {
            setActiveModalEvent(null);
            if (onClearSelectedEventId) onClearSelectedEventId();
          }}
          onInjectConflict={handleInjectConflict}
          onVerifyWithAI={handleVerifyWithAI}
          isInjectingConflict={isInjectingConflict}
          isVerifyingAI={isVerifyingAI}
        />
      )}
    </div>
  );
};
