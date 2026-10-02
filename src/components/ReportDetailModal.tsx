import React, { useState } from 'react';
import { X, Copy, Check, FileJson, ArrowRightLeft, Layers } from 'lucide-react';
import { WeatherReport } from '../types.ts';

interface ReportDetailModalProps {
  report: WeatherReport | null;
  onClose: () => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({ report, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'standard' | 'raw' | 'side_by_side'>('standard');

  if (!report) return null;

  // The common standardized data model strictly as requested:
  const commonDataModelObject = {
    report_id: report.report_id,
    source_platform: report.source_platform,
    source_url: report.source_url,
    source_type: report.source_type,
    author_name: report.author_name,
    content: report.content,
    timestamp: report.timestamp,
    city: report.city,
    state: report.state,
    latitude: report.latitude,
    longitude: report.longitude,
    event_category: report.event_category,
    media_url: report.media_url,
    verification_status: report.verification_status,
    AI_confidence: report.AI_confidence,
    credibility_score: report.credibility_score,
    duplicate_status: report.duplicate_status,
    // System metadata
    ingested_at: report.ingested_at,
    duplicate_of_id: report.duplicate_of_id || null,
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div
        id="report-detail-modal"
        className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-950 text-blue-400 border border-blue-800 rounded-lg">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Common Data Model Inspector</h3>
                <span className="font-mono text-xs bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-medium">
                  {report.report_id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Standardized weather report schema converted from {report.source_type} ({report.source_platform})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="copy-json-btn"
              onClick={() => copyToClipboard(JSON.stringify(commonDataModelObject, null, 2))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              id="close-modal-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="px-6 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium mr-2">Payload View:</span>
          <button
            onClick={() => setActiveTab('standard')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'standard' ? 'bg-blue-600 text-white shadow-xs font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Standardized Common Model (JSON)
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'raw' ? 'bg-blue-600 text-white shadow-xs font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Raw Ingested Source Payload
          </button>
          <button
            onClick={() => setActiveTab('side_by_side')}
            className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
              activeTab === 'side_by_side' ? 'bg-blue-600 text-white shadow-xs font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span>Side-by-Side Comparison</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs">
          {activeTab === 'standard' && (
            <div className="bg-slate-950 text-slate-200 p-4 rounded-xl border border-slate-800 overflow-x-auto shadow-inner">
              <div className="text-slate-400 text-[11px] mb-2 font-sans flex items-center justify-between">
                <span>Standardized 17-field common schema</span>
                <span className="text-emerald-400 font-semibold">Normalized successfully</span>
              </div>
              <pre>{JSON.stringify(commonDataModelObject, null, 2)}</pre>
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="bg-slate-950 text-slate-200 p-4 rounded-xl border border-slate-800 overflow-x-auto shadow-inner">
              <div className="text-slate-400 text-[11px] mb-2 font-sans flex items-center justify-between">
                <span>Original source payload before normalization ({report.source_type})</span>
                <span className="text-sky-400 font-semibold">Source: {report.source_platform}</span>
              </div>
              <pre>{JSON.stringify(report.raw_payload || { note: 'Direct submission' }, null, 2)}</pre>
            </div>
          )}

          {activeTab === 'side_by_side' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 text-slate-200 p-4 rounded-xl border border-slate-800 overflow-x-auto shadow-inner">
                <div className="text-amber-300 text-[11px] mb-2 font-sans font-semibold">
                  Raw Ingested Source Payload
                </div>
                <pre>{JSON.stringify(report.raw_payload || {}, null, 2)}</pre>
              </div>

              <div className="bg-slate-950 text-slate-200 p-4 rounded-xl border border-slate-800 overflow-x-auto shadow-inner">
                <div className="text-emerald-400 text-[11px] mb-2 font-sans font-semibold">
                  Standardized Common Data Model
                </div>
                <pre>{JSON.stringify(commonDataModelObject, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Model Specification Checklist */}
          <div className="mt-6 pt-4 border-t border-slate-800 font-sans text-xs text-slate-400">
            <h4 className="font-semibold text-white mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Common Data Model Specifications</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="font-mono font-bold text-slate-300">report_id</span>
                <p className="text-slate-400 truncate">{report.report_id}</p>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="font-mono font-bold text-slate-300">source_platform</span>
                <p className="text-slate-400 truncate">{report.source_platform}</p>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="font-mono font-bold text-slate-300">source_type</span>
                <p className="text-slate-400 truncate">{report.source_type}</p>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="font-mono font-bold text-slate-300">event_category</span>
                <p className="text-slate-400 truncate">{report.event_category}</p>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="font-mono font-bold text-slate-300">location</span>
                <p className="text-slate-400 truncate">{report.city}, {report.state}</p>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="font-mono font-bold text-slate-300">lat/long</span>
                <p className="text-slate-400 truncate">{report.latitude}, {report.longitude}</p>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="font-mono font-bold text-slate-300">credibility_score</span>
                <p className="text-slate-400 truncate">{report.credibility_score}/100</p>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="font-mono font-bold text-slate-300">duplicate_status</span>
                <p className="text-slate-400 truncate">{report.duplicate_status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>AI Verification Status: Deferred as instructed (Pending Stage 2)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
