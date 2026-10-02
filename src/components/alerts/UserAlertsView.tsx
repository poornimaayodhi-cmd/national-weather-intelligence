import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  Eye,
  Sliders,
  Check,
} from 'lucide-react';
import { useAuth, WeatherAlertItem } from '../../context/AuthContext.tsx';
import { SPATIAL_EVENT_NODES, SpatialEventNode } from '../spatial/SpatialAtmosphericCanvas.tsx';

interface UserAlertsViewProps {
  onViewOnMap: (event: SpatialEventNode) => void;
  onViewIntelligence: (event: SpatialEventNode) => void;
}

export const UserAlertsView: React.FC<UserAlertsViewProps> = ({
  onViewOnMap,
  onViewIntelligence,
}) => {
  const { alerts, markAlertAsRead, markAllAlertsAsRead } = useAuth();

  // Notification Preferences State
  const [prefSevere, setPrefSevere] = useState(true);
  const [prefLocation, setPrefLocation] = useState(true);
  const [prefRadius, setPrefRadius] = useState<'5km' | '15km' | '50km'>('15km');
  const [prefDaily, setPrefDaily] = useState(true);
  const [prefSound, setPrefSound] = useState(false);
  const [savedSettings, setSavedSettings] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase font-bold text-rose-400 tracking-widest mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>DISPATCH & EARLY WARNING NOTIFICATIONS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Weather Alerts & Notification Feeds
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time algorithmic alerts dispatched to field responders, municipal agencies, and citizens.
          </p>
        </div>

        <button
          type="button"
          onClick={markAllAlertsAsRead}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono font-bold uppercase transition-colors shrink-0 cursor-pointer"
        >
          Mark All as Read
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Alerts Feed (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              ACTIVE ALERTS DISPATCH LOG
            </span>
            <span className="text-[11px] font-mono text-cyan-400">
              {alerts.filter((a) => !a.read).length} UNREAD
            </span>
          </div>

          <div className="space-y-3">
            {alerts.map((alt) => {
              const matchedEvent = SPATIAL_EVENT_NODES.find((e) => e.id === alt.eventId);

              return (
                <div
                  key={alt.id}
                  onClick={() => markAlertAsRead(alt.id)}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    alt.read
                      ? 'bg-slate-950/70 border-slate-850 text-slate-400 hover:border-slate-700'
                      : 'bg-slate-950/95 border-rose-500/40 text-slate-200 shadow-lg shadow-rose-950/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          alt.severity === 'CRITICAL'
                            ? 'bg-rose-500 animate-pulse'
                            : alt.severity === 'WARNING'
                            ? 'bg-amber-400'
                            : 'bg-cyan-400'
                        }`}
                      />
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          alt.severity === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                            : alt.severity === 'WARNING'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                        }`}
                      >
                        {alt.category}
                      </span>
                    </div>
                    <span className="text-[10.5px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{alt.timestamp}</span>
                    </span>
                  </div>

                  <h3 className={`text-sm font-bold ${alt.read ? 'text-slate-300' : 'text-white'}`}>
                    {alt.title}
                  </h3>

                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans">
                    {alt.message}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-850 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{alt.location}</span>
                    </div>

                    {matchedEvent && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewOnMap(matchedEvent);
                          }}
                          className="px-2.5 py-1 rounded bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-[10.5px] font-bold uppercase transition-colors"
                        >
                          View Map
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewIntelligence(matchedEvent);
                          }}
                          className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[10.5px] font-bold uppercase transition-colors"
                        >
                          Dossier
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Notification Settings Panel (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-slate-950/85 border border-cyan-500/25 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              ALERT NOTIFICATION PREFERENCES
            </h3>
          </div>

          <form onSubmit={handleSavePreferences} className="space-y-4 text-xs font-mono">
            {/* Severe Weather Alert */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-850">
              <div>
                <div className="font-bold text-white">Severe Weather Alerts</div>
                <div className="text-[10.5px] text-slate-400">Instant push for Level 4/5 threats</div>
              </div>
              <input
                type="checkbox"
                checked={prefSevere}
                onChange={(e) => setPrefSevere(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </div>

            {/* Location Radius */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-850 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Geofenced Location Alerts</div>
                  <div className="text-[10.5px] text-slate-400">Radar warnings within coordinate perimeter</div>
                </div>
                <input
                  type="checkbox"
                  checked={prefLocation}
                  onChange={(e) => setPrefLocation(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </div>

              {prefLocation && (
                <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Alert Radius:</span>
                  <div className="flex items-center gap-1">
                    {(['5km', '15km', '50km'] as const).map((rad) => (
                      <button
                        key={rad}
                        type="button"
                        onClick={() => setPrefRadius(rad)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          prefRadius === rad
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {rad}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Daily Briefing */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-850">
              <div>
                <div className="font-bold text-white">Daily Intelligence Briefing</div>
                <div className="text-[10.5px] text-slate-400">Morning synoptic digest at 07:00 IST</div>
              </div>
              <input
                type="checkbox"
                checked={prefDaily}
                onChange={(e) => setPrefDaily(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </div>

            {/* Sound Ping */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-850">
              <div>
                <div className="font-bold text-white">Critical Audio Ping</div>
                <div className="text-[10.5px] text-slate-400">Audible tone for flash flood warnings</div>
              </div>
              <input
                type="checkbox"
                checked={prefSound}
                onChange={(e) => setPrefSound(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {savedSettings ? <Check className="w-4 h-4 text-emerald-300" /> : null}
              <span>{savedSettings ? 'PREFERENCES SAVED' : 'SAVE PREFERENCES'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
