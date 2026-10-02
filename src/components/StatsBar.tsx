import React from 'react';
import { IngestionStats, SourceType } from '../types.ts';
import { Layers, Share2, Radio, CloudLightning, Database, Globe, AlertTriangle } from 'lucide-react';

interface StatsBarProps {
  stats: IngestionStats | null;
  activeSourceFilter: SourceType | 'ALL';
  onSelectSource: (source: SourceType | 'ALL') => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  stats,
  activeSourceFilter,
  onSelectSource,
}) => {
  if (!stats) return null;

  const sourceItems: Array<{
    type: SourceType;
    label: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      type: 'SOCIAL_MEDIA',
      label: 'Social Media',
      icon: <Share2 className="w-3.5 h-3.5" />,
      color: 'text-blue-400',
    },
    {
      type: 'CITIZEN',
      label: 'Citizen',
      icon: <Radio className="w-3.5 h-3.5" />,
      color: 'text-emerald-400',
    },
    {
      type: 'WEATHER_API',
      label: 'Weather API',
      icon: <CloudLightning className="w-3.5 h-3.5" />,
      color: 'text-blue-400',
    },
    {
      type: 'PUBLIC_DATASET',
      label: 'Public Dataset',
      icon: <Database className="w-3.5 h-3.5" />,
      color: 'text-amber-400',
    },
    {
      type: 'WEBSITE',
      label: 'Website',
      icon: <Globe className="w-3.5 h-3.5" />,
      color: 'text-slate-300',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 shadow-sm mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Total Metric & Source Quick Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onSelectSource('ALL')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              activeSourceFilter === 'ALL'
                ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                : 'bg-slate-950/80 text-slate-300 border-slate-800/80 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Sources</span>
            <span
              className={`ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-mono ${
                activeSourceFilter === 'ALL' ? 'bg-blue-800 text-white' : 'bg-slate-900 text-slate-300'
              }`}
            >
              {stats.total_reports}
            </span>
          </button>

          {sourceItems.map((item) => {
            const count = stats.by_source_type[item.type] || 0;
            const isSelected = activeSourceFilter === item.type;
            return (
              <button
                key={item.type}
                onClick={() => onSelectSource(item.type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                    : 'bg-slate-950/80 text-slate-300 border-slate-800/80 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className={isSelected ? 'text-white' : item.color}>{item.icon}</span>
                <span>{item.label}</span>
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-mono ${
                    isSelected ? 'bg-blue-800 text-white' : 'bg-slate-900 text-slate-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Duplicate and System Status */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/25">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium">Duplicates Flagged:</span>
            <span className="font-bold font-mono">{stats.duplicates_count}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Pipeline: Storage Layer Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
