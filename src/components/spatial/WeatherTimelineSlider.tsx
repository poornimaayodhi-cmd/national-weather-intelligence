import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Activity,
} from 'lucide-react';

export type TimelinePoint = 'NOW' | '-15M' | '-30M' | '-1H' | '-3H' | '-6H';

export interface TimelineOption {
  key: TimelinePoint;
  label: string;
  sublabel: string;
  timeIST: string;
  activeEventsCount: number;
  precipitationFactor: number;
  threatLevel: 'SEVERE' | 'HIGH' | 'MODERATE';
}

export const TIMELINE_OPTIONS: TimelineOption[] = [
  { key: 'NOW', label: 'NOW', sublabel: 'Live Telemetry', timeIST: '21:32 IST', activeEventsCount: 128, precipitationFactor: 1.0, threatLevel: 'SEVERE' },
  { key: '-15M', label: '-15 MIN', sublabel: 'Radar T-1', timeIST: '21:17 IST', activeEventsCount: 124, precipitationFactor: 0.94, threatLevel: 'SEVERE' },
  { key: '-30M', label: '-30 MIN', sublabel: 'Radar T-2', timeIST: '21:02 IST', activeEventsCount: 118, precipitationFactor: 0.88, threatLevel: 'HIGH' },
  { key: '-1H', label: '-1 HR', sublabel: 'Hourly Synoptic', timeIST: '20:32 IST', activeEventsCount: 104, precipitationFactor: 0.76, threatLevel: 'HIGH' },
  { key: '-3H', label: '-3 HR', sublabel: 'Convective Inception', timeIST: '18:32 IST', activeEventsCount: 78, precipitationFactor: 0.52, threatLevel: 'MODERATE' },
  { key: '-6H', label: '-6 HR', sublabel: 'Pre-Monsoon Surge', timeIST: '15:32 IST', activeEventsCount: 42, precipitationFactor: 0.35, threatLevel: 'MODERATE' },
];

interface WeatherTimelineSliderProps {
  currentPoint: TimelinePoint;
  onChangePoint: (point: TimelinePoint) => void;
}

export const WeatherTimelineSlider: React.FC<WeatherTimelineSliderProps> = ({
  currentPoint,
  onChangePoint,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Auto-play timeline animation loop (cycles backwards or forwards through radar history)
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const currentIndex = TIMELINE_OPTIONS.findIndex((t) => t.key === currentPoint);
      const nextIndex = (currentIndex + 1) % TIMELINE_OPTIONS.length;
      onChangePoint(TIMELINE_OPTIONS[nextIndex].key);
    }, 2500);

    return () => clearInterval(interval);
  }, [isPlaying, currentPoint, onChangePoint]);

  const activeOption = TIMELINE_OPTIONS.find((t) => t.key === currentPoint) || TIMELINE_OPTIONS[0];

  return (
    <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/85 border border-slate-800 backdrop-blur-md shadow-2xl relative select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span className="text-[11px] font-mono font-bold tracking-widest text-slate-200 uppercase">
            WEATHER REPLAY TIMELINE
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-bold">
            {activeOption.timeIST}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
              isPlaying
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span className="text-[10.5px] font-bold">{isPlaying ? 'PAUSE REPLAY' : 'PLAY REPLAY'}</span>
          </button>

          <button
            type="button"
            onClick={() => onChangePoint('NOW')}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-[10px] cursor-pointer"
            title="Jump to Real-Time Telemetry"
          >
            LIVE NOW
          </button>
        </div>
      </div>

      {/* Horizontal Stepped Segment Buttons */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
        {TIMELINE_OPTIONS.map((item) => {
          const isSelected = item.key === currentPoint;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                onChangePoint(item.key);
                setIsPlaying(false);
              }}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'bg-cyan-950/90 border-cyan-400 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/50'
                  : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`text-[11px] font-mono font-bold tracking-tight ${
                  isSelected ? 'text-white' : 'text-slate-300'
                }`}
              >
                {item.label}
              </div>
              <div className="text-[9.5px] font-mono text-slate-500 mt-0.5 truncate">
                {item.timeIST}
              </div>
              {isSelected && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400 shadow-xs shadow-cyan-400" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400">
        <span>Active Events in Frame: <strong className="text-white">{activeOption.activeEventsCount}</strong></span>
        <span>Simulated Doppler Intensity: <strong className="text-cyan-300">{Math.round(activeOption.precipitationFactor * 100)}%</strong></span>
        <span className="hidden sm:inline">Threat Tier: <strong className={activeOption.threatLevel === 'SEVERE' ? 'text-rose-400' : 'text-amber-400'}>{activeOption.threatLevel}</strong></span>
      </div>
    </div>
  );
};
