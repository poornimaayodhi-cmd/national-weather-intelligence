import React, { useState } from 'react';
import {
  Sliders,
  Radio,
  Clock,
  Volume2,
  Database,
  Shield,
  CheckCircle2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const UserSettingsView: React.FC = () => {
  const [refreshInterval, setRefreshInterval] = useState('10');
  const [defaultMode, setDefaultMode] = useState('RADAR');
  const [audioAlerts, setAudioAlerts] = useState(false);
  const [unitSystem, setUnitSystem] = useState('METRIC');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase font-bold text-cyan-400 tracking-widest mb-1">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>SYSTEM TELEMETRY PREFERENCES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            User Interface Settings
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Configure data polling rate, default 3D Earth layers, units, and audio alarms.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="p-6 rounded-3xl bg-slate-950/85 border border-cyan-500/25 backdrop-blur-xl shadow-xl space-y-5 text-xs font-mono">
          {/* Polling Interval */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-850">
            <div>
              <div className="font-bold text-white text-sm">Telemetry Ingestion Interval</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Frequency of live API synchronization from IMD AWS stations & social channels.
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {[
                { label: '5s (Rapid)', val: '5' },
                { label: '10s (Standard)', val: '10' },
                { label: '30s (Eco)', val: '30' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setRefreshInterval(opt.val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    refreshInterval === opt.val
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Default 3D Earth Mode */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-850">
            <div>
              <div className="font-bold text-white text-sm">Default 3D Earth View Mode</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Initial operational visualization layer loaded on startup.
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {['RADAR', 'SATELLITE', 'EVENTS', 'THREAT'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDefaultMode(m)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    defaultMode === m
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Audio Alerts */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-850">
            <div>
              <div className="font-bold text-white text-sm">Audio Dispatch Tones</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Audible acoustic alert ping when a Level 4/5 Severe Threat is verified.
              </div>
            </div>
            <input
              type="checkbox"
              checked={audioAlerts}
              onChange={(e) => setAudioAlerts(e.target.checked)}
              className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
            />
          </div>

          {/* Unit System */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-850">
            <div>
              <div className="font-bold text-white text-sm">Measurement Unit Standard</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Metric (°C, mm/hr, km/h, hPa) vs Imperial (°F, in/hr, mph, inHg).
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {[
                { label: 'Metric (SI)', val: 'METRIC' },
                { label: 'Imperial (US)', val: 'IMPERIAL' },
              ].map((u) => (
                <button
                  key={u.val}
                  type="button"
                  onClick={() => setUnitSystem(u.val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    unitSystem === u.val
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-950/50"
          >
            {saveSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : null}
            <span>{saveSuccess ? 'SETTINGS SAVED & APPLIED' : 'SAVE SETTINGS'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
