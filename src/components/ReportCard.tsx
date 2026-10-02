import React from 'react';
import {
  ExternalLink,
  MapPin,
  Clock,
  User,
  ShieldCheck,
  AlertTriangle,
  FileCode2,
  Share2,
  Radio,
  CloudLightning,
  Database,
  Globe,
  Camera,
} from 'lucide-react';
import { WeatherReport, SourceType } from '../types.ts';

interface ReportCardProps {
  report: WeatherReport;
  onInspect: (report: WeatherReport) => void;
  onViewInModule2?: (report: WeatherReport) => void;
}

const sourceBadgeConfig: Record<
  SourceType,
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  SOCIAL_MEDIA: {
    label: 'Social Media',
    bg: 'bg-blue-950/40',
    text: 'text-blue-300',
    border: 'border-blue-800/60',
    icon: <Share2 className="w-3.5 h-3.5 text-blue-400" />,
  },
  CITIZEN: {
    label: 'Citizen Observer',
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-300',
    border: 'border-emerald-800/60',
    icon: <Radio className="w-3.5 h-3.5 text-emerald-400" />,
  },
  WEATHER_API: {
    label: 'Weather API',
    bg: 'bg-blue-950/50',
    text: 'text-blue-300',
    border: 'border-blue-800/60',
    icon: <CloudLightning className="w-3.5 h-3.5 text-blue-400" />,
  },
  PUBLIC_DATASET: {
    label: 'Public Dataset',
    bg: 'bg-amber-950/40',
    text: 'text-amber-300',
    border: 'border-amber-800/60',
    icon: <Database className="w-3.5 h-3.5 text-amber-400" />,
  },
  WEBSITE: {
    label: 'Website / News',
    bg: 'bg-slate-800/70',
    text: 'text-slate-300',
    border: 'border-slate-700/80',
    icon: <Globe className="w-3.5 h-3.5 text-slate-400" />,
  },
};

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onInspect,
  onViewInModule2,
}) => {
  const badge = sourceBadgeConfig[report.source_type] || sourceBadgeConfig.CITIZEN;
  const isDuplicate = report.duplicate_status !== 'ORIGINAL';

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      id={`report-card-${report.report_id}`}
      className={`rounded-xl border transition-all duration-150 p-5 bg-slate-900 shadow-sm hover:border-slate-700/80 hover:shadow-md ${
        isDuplicate ? 'border-amber-500/30 bg-amber-500/5' : 'border-slate-800/80'
      }`}
    >
      {/* Card Header: IDs, Source badge, and Duplicate tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Source Type Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
          >
            {badge.icon}
            <span>{badge.label}</span>
          </span>

          {/* Source Platform name */}
          <span className="text-xs font-medium text-slate-300 bg-slate-950/80 border border-slate-800 px-2 py-0.5 rounded">
            {report.source_platform}
          </span>

          {/* Event Category */}
          <span className="text-xs font-medium text-slate-200 bg-slate-950/80 border border-slate-800 px-2.5 py-0.5 rounded-full">
            {report.event_category}
          </span>

          {/* Duplicate Status Tag */}
          {isDuplicate && (
            <span
              id={`dup-tag-${report.report_id}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30"
              title={report.duplicate_of_id ? `Duplicate of ${report.duplicate_of_id}` : 'Suspected duplicate entry'}
            >
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              {report.duplicate_status}
            </span>
          )}
        </div>

        {/* Report ID & inspect trigger */}
        <div className="flex items-center gap-2 text-xs">
          <code className="text-slate-400 font-mono bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
            {report.report_id}
          </code>
          <button
            id={`inspect-btn-${report.report_id}`}
            onClick={() => onInspect(report)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-medium text-xs transition-colors"
            title="Inspect Common Data Model JSON schema"
          >
            <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Inspect Model</span>
          </button>
          {onViewInModule2 && (
            <button
              onClick={() => onViewInModule2(report)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors shadow-xs"
              title="Correlate this evidence in Module 2 verification view"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-100" />
              <span>Correlate in Mod 2</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content / Text */}
      <p className="text-slate-200 text-sm leading-relaxed mb-4 font-normal">
        {report.content}
      </p>

      {/* Media attachment reference if present */}
      {report.media_url && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-400 font-medium">
            <Camera className="w-3.5 h-3.5 text-slate-500" />
            <span>Attached Image/Video Reference</span>
          </div>
          <div className="relative rounded-lg overflow-hidden border border-slate-800 max-h-48 w-full sm:max-w-md bg-slate-950">
            <img
              src={report.media_url}
              alt="Weather observation media"
              className="w-full h-44 object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      )}

      {/* Structured Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
        {/* Author / Source Name */}
        <div className="flex items-start gap-1.5 min-w-0">
          <User className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
          <div className="truncate">
            <span className="block text-[10px] uppercase font-bold text-slate-500">Author / Source</span>
            <span className="font-medium text-slate-200 truncate block">
              {report.author_name || 'Public / Anonymous'}
            </span>
          </div>
        </div>

        {/* Location: City, State, Lat/Long */}
        <div className="flex items-start gap-1.5 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
          <div className="truncate">
            <span className="block text-[10px] uppercase font-bold text-slate-500">Location</span>
            <span className="font-medium text-slate-200 truncate block">
              {report.city}, {report.state} ({report.latitude.toFixed(3)}, {report.longitude.toFixed(3)})
            </span>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-start gap-1.5 min-w-0">
          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
          <div className="truncate">
            <span className="block text-[10px] uppercase font-bold text-slate-500">Timestamp</span>
            <span className="font-medium text-slate-200 truncate block" title={report.timestamp}>
              {formatTime(report.timestamp)}
            </span>
          </div>
        </div>

        {/* Source URL */}
        <div className="flex items-start gap-1.5 min-w-0">
          <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
          <div className="truncate">
            <span className="block text-[10px] uppercase font-bold text-slate-500">Source Link</span>
            {report.source_url ? (
              <a
                href={report.source_url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-blue-400 hover:text-blue-300 hover:underline truncate block font-medium"
              >
                {report.source_url.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            ) : (
              <span className="text-slate-500">N/A</span>
            )}
          </div>
        </div>
      </div>

      {/* Ingestion & Pipeline Metadata Footer */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Verification Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Verification:</span>
            <span
              className={`px-2 py-0.5 rounded font-semibold text-[11px] border ${
                report.verification_status === 'VERIFIED'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800/80'
                  : report.verification_status === 'REJECTED'
                  ? 'bg-rose-950 text-rose-300 border-rose-800/80'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {report.verification_status}
            </span>
          </div>

          {/* AI Confidence (Disabled / Deferred as requested) */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-slate-500 font-medium">AI Confidence:</span>
            <span className="font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
              {report.AI_confidence !== null ? `${report.AI_confidence}%` : 'Pending (v2 AI Stage)'}
            </span>
          </div>

          {/* Credibility Score */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Credibility:</span>
            <div className="flex items-center gap-1.5">
              <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    report.credibility_score >= 80
                      ? 'bg-emerald-500'
                      : report.credibility_score >= 60
                      ? 'bg-amber-500'
                      : 'bg-slate-600'
                  }`}
                  style={{ width: `${report.credibility_score}%` }}
                />
              </div>
              <span className="font-semibold text-slate-300 font-mono text-[11px]">
                {report.credibility_score}/100
              </span>
            </div>
          </div>
        </div>

        <div className="text-slate-500 text-[11px]">
          Ingested: {new Date(report.ingested_at).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
