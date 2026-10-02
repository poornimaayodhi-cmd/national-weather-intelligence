import React from 'react';
import {
  Compass,
  Map,
  Radio,
  Layers,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export type DockSection = 'OVERVIEW' | 'LIVE_MAP' | 'EVENTS' | 'SOURCES' | 'ANALYTICS' | 'ADMIN';

interface CommandCenterDockProps {
  activeSection: DockSection;
  onSelectSection: (section: DockSection) => void;
}

export const CommandCenterDock: React.FC<CommandCenterDockProps> = ({
  activeSection,
  onSelectSection,
}) => {
  const dockItems: Array<{ id: DockSection; label: string; icon: React.ReactNode; tooltip: string }> = [
    { id: 'OVERVIEW', label: 'OVERVIEW', icon: <Compass className="w-3.5 h-3.5" />, tooltip: '3D Spatial Command Center' },
    { id: 'LIVE_MAP', label: 'LIVE MAP', icon: <Map className="w-3.5 h-3.5" />, tooltip: 'IMD Station Surface Telemetry' },
    { id: 'EVENTS', label: 'EVENTS', icon: <Radio className="w-3.5 h-3.5" />, tooltip: 'Module 1: Multi-Source Ingestion Feed' },
    { id: 'SOURCES', label: 'SOURCES', icon: <Layers className="w-3.5 h-3.5" />, tooltip: 'Module 2: Evidence Correlation' },
    { id: 'ANALYTICS', label: 'ANALYTICS', icon: <Sparkles className="w-3.5 h-3.5" />, tooltip: 'Module 3: AI Verification Engine' },
    { id: 'ADMIN', label: 'ADMIN', icon: <ShieldAlert className="w-3.5 h-3.5" />, tooltip: 'Module 4: Decision Action Panel' },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] sm:w-auto">
      <nav
        aria-label="Command Center Dock"
        className="p-1.5 rounded-2xl bg-slate-950/90 border border-cyan-500/30 backdrop-blur-xl shadow-2xl flex items-center justify-between sm:justify-center gap-1 overflow-x-auto select-none"
      >
        {dockItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSection(item.id)}
              className={`px-3 py-1.5 rounded-xl font-mono text-[10.5px] font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5 relative shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600/90 to-blue-600/90 text-white shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-400/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
              title={item.tooltip}
            >
              {item.icon}
              <span>{item.label}</span>

              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-cyan-400 rounded-full shadow-xs shadow-cyan-400" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
