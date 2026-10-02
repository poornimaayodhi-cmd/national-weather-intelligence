import React from 'react';
import {
  Navigation,
  RefreshCw,
  ChevronDown,
  Crosshair,
} from 'lucide-react';
import { useLocation } from '../context/LocationContext.tsx';
import { LocationSelectorModal } from './LocationSelectorModal.tsx';

interface LocationStatusIndicatorProps {
  className?: string;
  compact?: boolean;
}

export const LocationStatusIndicator: React.FC<LocationStatusIndicatorProps> = ({
  className = '',
  compact = false,
}) => {
  const {
    location,
    isGpsPending,
    isApproxPending,
    retryGps,
    isSelectorModalOpen,
    openSelectorModal,
    closeSelectorModal,
  } = useLocation();

  const isPending = isGpsPending || isApproxPending;

  // Format string exactly per instructions:
  // 📍 Chennai, Tamil Nadu • GPS
  // 📍 Chennai, Tamil Nadu • Approximate Location
  // 📍 Chennai, Tamil Nadu • Manual
  const levelText =
    location.level === 'GPS'
      ? 'GPS'
      : location.level === 'APPROXIMATE'
      ? 'Approximate Location'
      : 'Manual';

  if (compact) {
    return (
      <>
        <div className={`inline-flex items-center gap-1.5 ${className}`}>
          {/* Main Clickable Location Pill */}
          <button
            type="button"
            onClick={openSelectorModal}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-750 text-slate-200 text-xs font-medium transition-colors shadow-xs cursor-pointer"
            title="Click to search or select location (City → State → Country)"
          >
            <span className="text-amber-400 text-xs">📍</span>
            <span className="truncate max-w-[160px] sm:max-w-[220px] font-semibold text-white">
              {location.city}, {location.state}
            </span>
            <span className="text-[10px] text-slate-400 font-normal hidden xs:inline">
              • {levelText}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {/* Non-intrusive Retry GPS Button */}
          <button
            type="button"
            onClick={() => retryGps()}
            disabled={isPending}
            className="p-1 rounded-md text-slate-400 hover:text-blue-300 hover:bg-slate-800 transition-colors"
            title="Retry GPS Geolocation"
          >
            {isPending ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
            ) : (
              <Crosshair className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <LocationSelectorModal
          isOpen={isSelectorModalOpen}
          onClose={closeSelectorModal}
        />
      </>
    );
  }

  return (
    <>
      <div className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
        {/* Full Non-Blocking Location Status Display */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-750 text-xs text-slate-200 shadow-xs">
          <span className="text-amber-400 text-sm">📍</span>
          <span className="font-semibold text-white">
            {location.city}, {location.state}
          </span>
          <span className="text-slate-400 font-medium">
            • {levelText}
          </span>

          <button
            type="button"
            onClick={openSelectorModal}
            className="ml-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 underline cursor-pointer"
          >
            Select Location
          </button>
        </div>

        {/* Retry GPS Option */}
        <button
          type="button"
          onClick={() => retryGps()}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer"
          title="Attempt device GPS detection"
        >
          {isPending ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
          ) : (
            <Navigation className="w-3 h-3 text-blue-400" />
          )}
          <span className="text-[11px]">
            {isPending ? 'Detecting GPS...' : 'Retry GPS'}
          </span>
        </button>
      </div>

      <LocationSelectorModal
        isOpen={isSelectorModalOpen}
        onClose={closeSelectorModal}
      />
    </>
  );
};
