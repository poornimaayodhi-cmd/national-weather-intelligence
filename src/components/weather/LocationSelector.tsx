import React from 'react';
import { MapPin, Building2, Radio, ChevronDown, Layers } from 'lucide-react';
import { WeatherState, WeatherDistrict, WeatherStation } from '../../types/weather.ts';

interface LocationSelectorProps {
  states: WeatherState[];
  districts: WeatherDistrict[];
  stations: WeatherStation[];
  selectedStateId: string;
  selectedDistrictId: string;
  selectedStationId: string;
  onSelectState: (stateId: string) => void;
  onSelectDistrict: (districtId: string) => void;
  onSelectStation: (stationId: string) => void;
  isLoadingDistricts?: boolean;
  isLoadingStations?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  states,
  districts,
  stations,
  selectedStateId,
  selectedDistrictId,
  selectedStationId,
  onSelectState,
  onSelectDistrict,
  onSelectStation,
  isLoadingDistricts = false,
  isLoadingStations = false,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* 1. State / UT Selection */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-200 font-medium">
            <span className="w-5 h-5 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-400">
              <MapPin className="w-3 h-3" />
            </span>
            <span>State / UT</span>
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {states.length} States
          </span>
        </label>
        <div className="relative group">
          <select
            value={selectedStateId}
            onChange={(e) => onSelectState(e.target.value)}
            className="w-full appearance-none bg-slate-950/90 hover:bg-slate-950 focus:bg-slate-950 border border-slate-700/80 hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-medium transition-all cursor-pointer pr-10 shadow-xs outline-hidden"
          >
            <option value="" disabled>
              Select State / UT
            </option>
            {states.map((st) => (
              <option key={st.state_id} value={st.state_id} className="bg-slate-900 text-slate-100">
                {st.state_name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400 group-hover:text-slate-300 transition-colors">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 2. District Selection */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-200 font-medium">
            <span className="w-5 h-5 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Building2 className="w-3 h-3" />
            </span>
            <span>District</span>
          </span>
          {selectedStateId && (
            <span className="text-[11px] text-slate-500 font-mono">
              {isLoadingDistricts ? 'Loading...' : `${districts.length} Districts`}
            </span>
          )}
        </label>
        <div className="relative group">
          <select
            value={selectedDistrictId}
            onChange={(e) => onSelectDistrict(e.target.value)}
            disabled={!selectedStateId || isLoadingDistricts}
            className={`w-full appearance-none rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all pr-10 shadow-xs outline-hidden ${
              !selectedStateId || isLoadingDistricts
                ? 'bg-slate-950/40 border border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-950/90 hover:bg-slate-950 focus:bg-slate-950 border border-slate-700/80 hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-100 cursor-pointer'
            }`}
          >
            <option value="" disabled>
              {!selectedStateId
                ? 'Select State first'
                : isLoadingDistricts
                ? 'Loading districts...'
                : 'Select District'}
            </option>
            {districts.map((d) => (
              <option key={d.district_id} value={d.district_id} className="bg-slate-900 text-slate-100">
                {d.district_name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400 group-hover:text-slate-300 transition-colors">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Station Selection */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-200 font-medium">
            <span className="w-5 h-5 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Radio className="w-3 h-3" />
            </span>
            <span>Station</span>
          </span>
          {selectedDistrictId && (
            <span className="text-[11px] text-slate-500 font-mono">
              {isLoadingStations ? 'Loading...' : `${stations.length} Stations`}
            </span>
          )}
        </label>
        <div className="relative group">
          <select
            value={selectedStationId}
            onChange={(e) => onSelectStation(e.target.value)}
            disabled={!selectedDistrictId || isLoadingStations}
            className={`w-full appearance-none rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all pr-10 shadow-xs outline-hidden ${
              !selectedDistrictId || isLoadingStations
                ? 'bg-slate-950/40 border border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-950/90 hover:bg-slate-950 focus:bg-slate-950 border border-slate-700/80 hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-100 cursor-pointer'
            }`}
          >
            <option value="" disabled>
              {!selectedDistrictId
                ? 'Select District first'
                : isLoadingStations
                ? 'Loading stations...'
                : 'Select Station'}
            </option>
            {stations.map((st) => (
              <option key={st.station_id} value={st.station_id} className="bg-slate-900 text-slate-100">
                {st.station_name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400 group-hover:text-slate-300 transition-colors">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
