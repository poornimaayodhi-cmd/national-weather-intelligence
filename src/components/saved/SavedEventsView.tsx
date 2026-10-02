import React from 'react';
import {
  Bookmark,
  BookmarkCheck,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  Eye,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { SPATIAL_EVENT_NODES, SpatialEventNode } from '../spatial/SpatialAtmosphericCanvas.tsx';

interface SavedEventsViewProps {
  onViewOnMap: (event: SpatialEventNode) => void;
  onViewIntelligence: (event: SpatialEventNode) => void;
  onExploreEvents: () => void;
}

export const SavedEventsView: React.FC<SavedEventsViewProps> = ({
  onViewOnMap,
  onViewIntelligence,
  onExploreEvents,
}) => {
  const { savedEventIds, toggleSaveEvent } = useAuth();

  const savedEvents = SPATIAL_EVENT_NODES.filter((evt) =>
    savedEventIds.includes(evt.id)
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase font-bold text-cyan-400 tracking-widest mb-1">
            <BookmarkCheck className="w-4 h-4 text-cyan-400" />
            <span>PERSONAL INTELLIGENCE DOSSIERS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Saved Weather Events ({savedEvents.length})
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Bookmarked telemetry incidents for rapid audit and monitoring.
          </p>
        </div>

        <button
          type="button"
          onClick={onExploreEvents}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono font-bold uppercase transition-colors shrink-0"
        >
          Browse All Events →
        </button>
      </div>

      {savedEvents.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center text-slate-500">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white font-mono">No Saved Intelligence Events</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You have not bookmarked any weather incidents yet. Click the bookmark icon on any active event card to save it here for priority tracking.
          </p>
          <button
            type="button"
            onClick={onExploreEvents}
            className="mt-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold uppercase transition-colors inline-flex items-center gap-1.5"
          >
            <span>Explore Live Events</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {savedEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 hover:bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 backdrop-blur-md shadow-lg transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: evt.severityColor }}
                  >
                    {evt.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{evt.timestamp}</span>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    {evt.confidence}% CONFIDENCE
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{evt.title}</h3>

                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{evt.city}, {evt.state}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">{evt.sourcesCount} Correlated Sources</span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-850">
                <button
                  type="button"
                  onClick={() => onViewOnMap(evt)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
                  title="View on 3D Earth"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Map</span>
                </button>

                <button
                  type="button"
                  onClick={() => onViewIntelligence(evt)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Dossier</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => toggleSaveEvent(evt.id)}
                  className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 border border-rose-800/40 transition-colors cursor-pointer"
                  title="Remove from Saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
