import React from 'react';
import {
  Radio,
  Clock,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Flame,
  CloudRain,
} from 'lucide-react';
import { MapWeatherEvent, REALTIME_WEATHER_EVENTS } from './osData.ts';

interface WhatsHappeningFeedProps {
  selectedEventId?: string;
  onSelectEvent: (event: MapWeatherEvent) => void;
}

export const WhatsHappeningFeed: React.FC<WhatsHappeningFeedProps> = ({
  selectedEventId,
  onSelectEvent,
}) => {
  return (
    <div className="rounded-2xl bg-slate-950/90 border border-cyan-500/30 backdrop-blur-md shadow-2xl p-3.5 space-y-3 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            WHAT&apos;S HAPPENING NOW
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-bold">
          LIVE FEED
        </span>
      </div>

      {/* Real-time Stream Items */}
      <div className="space-y-2 overflow-y-auto max-h-[300px] scrollbar-none">
        {REALTIME_WEATHER_EVENTS.map((item, idx) => {
          const isSelected = selectedEventId === item.id;
          const timeAgo =
            idx === 0
              ? '2 min ago'
              : idx === 1
              ? '5 min ago'
              : idx === 2
              ? '8 min ago'
              : idx === 3
              ? '14 min ago'
              : `${idx * 6} min ago`;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectEvent(item)}
              className={`w-full p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-2.5 relative group ${
                isSelected
                  ? 'bg-slate-900 border-cyan-400 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-400/50'
                  : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800/80 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
                  style={{
                    backgroundColor: item.color,
                    boxShadow: `0 0 8px ${item.color}88`,
                  }}
                />
                <div className="min-w-0">
                  <div className="font-bold text-white text-xs truncate">
                    {item.type}
                  </div>
                  <div className="text-[11px] font-mono text-cyan-300 truncate">
                    {item.city}, {item.state}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                    <span>{timeAgo}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">{item.confidence}% confidence</span>
                  </div>
                </div>
              </div>

              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0 transition-colors" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
