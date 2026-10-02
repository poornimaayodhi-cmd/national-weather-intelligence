import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Radio, Building2, Hash, ArrowRight } from 'lucide-react';
import { LocationSearchResult } from '../../types/weather.ts';
import { weatherService } from '../../services/weatherService.ts';

interface LocationSearchBarProps {
  onSelectStation: (result: LocationSearchResult) => void;
}

export const LocationSearchBar: React.FC<LocationSearchBarProps> = ({ onSelectStation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const hits = await weatherService.searchStations(query);
        setResults(hits);
        setIsOpen(hits.length > 0);
      } catch (err) {
        console.error('Station search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: LocationSearchResult) => {
    onSelectStation(item);
    setQuery(item.station_name);
    setIsOpen(false);
  };

  const getMatchBadge = (field: LocationSearchResult['matched_field']) => {
    switch (field) {
      case 'pincode':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <Hash className="w-3 h-3 text-amber-400" /> PIN
          </span>
        );
      case 'station_name':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            <Radio className="w-3 h-3 text-emerald-400" /> Station
          </span>
        );
      case 'district':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
            <Building2 className="w-3 h-3 text-blue-400" /> District
          </span>
        );
      case 'city':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
            <MapPin className="w-3 h-3 text-purple-400" /> State
          </span>
        );
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative group">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-blue-400 transition-colors">
          <Search className={`w-4 h-4 ${isSearching ? 'animate-pulse text-blue-400' : ''}`} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen && e.target.value.length >= 2) setIsOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search city, district, or PIN (e.g. 600015, Mumbai, Saidapet)..."
          className="w-full bg-slate-950/90 hover:bg-slate-950 focus:bg-slate-950 border border-slate-700/80 hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-400/80 transition-all shadow-xs outline-hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white transition-colors"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Results Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden max-h-80 overflow-y-auto divide-y divide-slate-800/80 animate-in fade-in-50">
          <div className="px-3.5 py-2 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800">
            <span>
              Matching stations: <strong className="text-slate-200">{results.length}</strong>
            </span>
            <span className="text-[10px] text-slate-500">Select to load station telemetry</span>
          </div>

          {results.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No weather stations found matching &ldquo;<span className="text-slate-200">{query}</span>&rdquo;.
              <br />
              <span className="text-[11px] text-slate-500 mt-1 inline-block">
                Try &quot;Chennai&quot;, &quot;Mumbai&quot;, &quot;Colaba&quot;, or &quot;600015&quot;.
              </span>
            </div>
          ) : (
            results.map((res) => (
              <button
                key={res.station_id}
                type="button"
                onClick={() => handleSelect(res)}
                className="w-full text-left p-3 hover:bg-slate-800/60 transition-all flex items-center justify-between gap-3 group border-l-2 border-l-transparent hover:border-l-blue-500"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-slate-100 group-hover:text-blue-300 transition-colors truncate">
                      {res.station_name}
                    </span>
                    {getMatchBadge(res.matched_field)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="text-slate-300 font-medium">
                      {res.district_name}, {res.state_name}
                    </span>
                    <span>•</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      PIN: {res.pincodes.join(', ')}
                    </span>
                    <span>•</span>
                    <span className="text-[11px] text-slate-400">
                      {res.station_type}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-slate-500 group-hover:text-blue-400 flex items-center gap-1 text-xs font-semibold">
                  <span>Select</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
