import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Search,
  X,
  Check,
  Globe,
  Navigation,
  RefreshCw,
  Building,
} from 'lucide-react';
import {
  useLocation,
  SUPPORTED_LOCATIONS_HIERARCHY,
  CityHierarchyItem,
} from '../context/LocationContext.tsx';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { location, selectLocation, retryGps, isGpsPending } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('India');
  const [selectedState, setSelectedState] = useState<string>('ALL');

  // Extract unique countries
  const countries = useMemo(() => {
    return Array.from(new Set(SUPPORTED_LOCATIONS_HIERARCHY.map((item) => item.country)));
  }, []);

  // Extract unique states for the selected country
  const states = useMemo(() => {
    return Array.from(
      new Set(
        SUPPORTED_LOCATIONS_HIERARCHY.filter((item) => item.country === selectedCountry).map(
          (item) => item.state
        )
      )
    );
  }, [selectedCountry]);

  // Filtered locations
  const filteredList = useMemo(() => {
    return SUPPORTED_LOCATIONS_HIERARCHY.filter((item) => {
      // Country match
      if (selectedCountry !== 'ALL' && item.country !== selectedCountry) {
        return false;
      }
      // State match
      if (selectedState !== 'ALL' && item.state !== selectedState) {
        return false;
      }
      // Query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          item.city.toLowerCase().includes(q) ||
          item.state.toLowerCase().includes(q) ||
          item.country.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedCountry, selectedState, searchQuery]);

  const handleSelectLocation = (item: CityHierarchyItem) => {
    selectLocation({
      city: item.city,
      state: item.state,
      country: item.country,
      latitude: item.latitude,
      longitude: item.longitude,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[85vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white">Select Location</h3>
              <p className="text-[11px] text-slate-400">
                City → State → Country hierarchy
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* GPS Quick Detection Option */}
        <div className="px-4 py-2.5 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Navigation className="w-3.5 h-3.5 text-blue-400" />
            <span>Prefer automatic GPS detection?</span>
          </div>
          <button
            type="button"
            onClick={() => {
              retryGps();
              onClose();
            }}
            disabled={isGpsPending}
            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isGpsPending ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Navigation className="w-3 h-3" />
            )}
            <span>Retry GPS</span>
          </button>
        </div>

        {/* Search & Hierarchical Selectors */}
        <div className="p-4 space-y-3 shrink-0 bg-slate-900/60 border-b border-slate-800/80">
          {/* Universal Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city, state, or country (e.g. Chennai, Mumbai, Tokyo)..."
              className="w-full bg-slate-950 border border-slate-750 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          {/* Country → State Hierarchical Dropdowns */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Globe className="w-3 h-3 text-slate-400" /> Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setSelectedState('ALL');
                }}
                className="w-full bg-slate-950 border border-slate-750 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="ALL">All Countries</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Building className="w-3 h-3 text-slate-400" /> State / Region
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full bg-slate-950 border border-slate-750 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="ALL">All States / Regions</option>
                {states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* City Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 min-h-[160px]">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
            Available Cities ({filteredList.length})
          </div>

          {filteredList.map((item) => {
            const isCurrent =
              location.city.toLowerCase() === item.city.toLowerCase() &&
              location.state.toLowerCase() === item.state.toLowerCase();

            return (
              <button
                key={`${item.city}-${item.state}-${item.country}`}
                type="button"
                onClick={() => handleSelectLocation(item)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-600/15 border-blue-500/40 text-blue-200'
                    : 'bg-slate-950/50 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <div>
                  <div className="font-semibold text-white text-xs flex items-center gap-1.5">
                    <span>{item.city}</span>
                    <span className="text-slate-400 font-normal">• {item.state}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {item.country} • {item.latitude.toFixed(2)}°N, {item.longitude.toFixed(2)}°E
                  </div>
                </div>

                {isCurrent && (
                  <div className="p-1 rounded-full bg-blue-600 text-white shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}

          {filteredList.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs">
              No matching locations found for &ldquo;{searchQuery}&rdquo;.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span>Active: {location.displayText}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
