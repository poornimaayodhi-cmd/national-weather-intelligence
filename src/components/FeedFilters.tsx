import React from 'react';
import { Search, Filter, RefreshCw, PlusCircle, RotateCcw, Shuffle } from 'lucide-react';
import { DuplicateStatus, SourceType } from '../types.ts';

interface FeedFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  categories: string[];
  duplicateFilter: DuplicateStatus | 'ALL';
  onDuplicateFilterChange: (status: DuplicateStatus | 'ALL') => void;
  onRefresh: () => void;
  onOpenIngestModal: () => void;
  onTriggerSampleIngest: (sourceType?: SourceType) => void;
  onResetSeedData: () => void;
  isRefreshing: boolean;
  isIngestingSample: boolean;
}

export const FeedFilters: React.FC<FeedFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  duplicateFilter,
  onDuplicateFilterChange,
  onRefresh,
  onOpenIngestModal,
  onTriggerSampleIngest,
  onResetSeedData,
  isRefreshing,
  isIngestingSample,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 shadow-sm mb-6 space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="search-input"
            type="text"
            placeholder="Search reports by city, author, content, event..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-400 focus:bg-slate-950 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Action Buttons: Test Ingest, Ingest Sample, Refresh, Reset */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="open-ingest-modal-btn"
            onClick={onOpenIngestModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Test Ingestion API</span>
          </button>

          <button
            id="simulate-sample-btn"
            onClick={() => onTriggerSampleIngest()}
            disabled={isIngestingSample}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            title="Ingest a simulated report from one of the 5 sources"
          >
            <Shuffle className={`w-3.5 h-3.5 ${isIngestingSample ? 'animate-spin' : ''}`} />
            <span>{isIngestingSample ? 'Ingesting...' : 'Ingest Sample Report'}</span>
          </button>

          <button
            id="refresh-feed-btn"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium transition-colors"
            title="Refresh Live Ingestion Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          <button
            id="reset-seed-btn"
            onClick={onResetSeedData}
            className="p-2 text-slate-400 hover:text-amber-300 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium transition-colors"
            title="Reset Storage to Initial Seed Dataset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Category and Duplicate Status Filters */}
      <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-medium">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Category:</span>
        </div>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="ALL">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1.5 ml-auto text-slate-400">
          <span className="font-medium">Duplicate Filter:</span>
          <select
            id="duplicate-select"
            value={duplicateFilter}
            onChange={(e) => onDuplicateFilterChange(e.target.value as DuplicateStatus | 'ALL')}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Reports</option>
            <option value="ORIGINAL">Original Only</option>
            <option value="SUSPECTED_DUPLICATE">Suspected Duplicates Only</option>
            <option value="DUPLICATE">Duplicates Only</option>
          </select>
        </div>
      </div>
    </div>
  );
};
