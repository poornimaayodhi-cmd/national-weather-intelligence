import React, { useState } from 'react';
import {
  CloudRain,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Flame,
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  ChevronRight,
  Eye,
  Radio,
  MapPin,
  Clock,
  Layers,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { SPATIAL_EVENT_NODES, SpatialEventNode } from '../spatial/SpatialAtmosphericCanvas.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

interface EventsDirectoryViewProps {
  onViewOnMap: (event: SpatialEventNode) => void;
  onViewIntelligence: (event: SpatialEventNode) => void;
  onOpenReportModal?: () => void;
}

export const EventsDirectoryView: React.FC<EventsDirectoryViewProps> = ({
  onViewOnMap,
  onViewIntelligence,
  onOpenReportModal,
}) => {
  const { isEventSaved, toggleSaveEvent } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const categories = [
    { key: 'ALL', label: 'All Incidents' },
    { key: 'SEVERE', label: 'Severe Floods & Cyclones' },
    { key: 'RAINFALL', label: 'Heavy Rainfall' },
    { key: 'THUNDERSTORM', label: 'Thunderstorms' },
    { key: 'HEATWAVE', label: 'Thermal & Dust' },
    { key: 'VERIFIED', label: 'Baseline Observatories' },
  ];

  const filteredEvents = SPATIAL_EVENT_NODES.filter((evt) => {
    const matchesCat = selectedCategory === 'ALL' || evt.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || evt.status === selectedStatus;
    const matchesSearch =
      !searchQuery.trim() ||
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.details.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase font-bold text-cyan-400 tracking-widest mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>NATIONAL WEATHER BIG DATA CATALOG</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Active Weather Events & Verification Feed
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time multi-source incidents correlated from IMD radars, river sensors, citizen spotters, and social reports.
          </p>
        </div>

        {onOpenReportModal && (
          <button
            type="button"
            onClick={onOpenReportModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-950/50 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>+ Report Weather Evidence</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-[#030816]/90 border border-cyan-500/25 backdrop-blur-md shadow-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city, state, or event keyword..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar pb-1 md:pb-0 text-xs font-mono">
          {categories.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setSelectedCategory(c.key)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer text-[11px] font-bold ${
                selectedCategory === c.key
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((evt) => {
          const saved = isEventSaved(evt.id);

          return (
            <div
              key={evt.id}
              className="p-5 rounded-2xl bg-slate-950/85 hover:bg-slate-900/90 border border-slate-800/90 hover:border-cyan-500/40 backdrop-blur-md shadow-xl transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Header Row: Category Badge + Timestamp + Save Bookmark */}
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider text-white shadow-xs"
                      style={{ backgroundColor: evt.severityColor }}
                    >
                      {evt.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                        evt.status === 'VERIFIED'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                          : evt.status === 'ACTION_REQUIRED'
                          ? 'bg-rose-950 text-rose-300 border-rose-700/60'
                          : 'bg-amber-950 text-amber-300 border-amber-700/60'
                      }`}
                    >
                      {evt.status === 'VERIFIED' ? '● VERIFIED' : evt.status === 'ACTION_REQUIRED' ? '▲ ACTION REQ' : '◌ PROVISIONAL'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{evt.timestamp}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleSaveEvent(evt.id)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        saved
                          ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                      title={saved ? 'Remove from Saved' : 'Save Event'}
                    >
                      {saved ? <BookmarkCheck className="w-4 h-4 text-cyan-400" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Event Title & Location */}
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {evt.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{evt.city}, {evt.state}</span>
                </div>

                {/* Details Narrative */}
                <p className="text-xs text-slate-300 mt-2.5 line-clamp-2 leading-relaxed font-sans">
                  {evt.details}
                </p>

                {/* Correlated Metrics Strip */}
                <div className="mt-3.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-850 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">SOURCES:</span>
                    <strong className="text-white font-bold">{evt.sourcesCount} Channels</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">CORRELATED:</span>
                    <strong className="text-cyan-300 font-bold">
                      {Math.max(4, Math.round(evt.sourcesCount * 0.7))} Reports
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{evt.confidence}% CONFIDENCE</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => onViewOnMap(evt)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View on 3D Map</span>
                </button>

                <button
                  type="button"
                  onClick={() => onViewIntelligence(evt)}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>View Intelligence</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
