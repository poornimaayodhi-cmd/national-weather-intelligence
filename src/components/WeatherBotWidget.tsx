import React from 'react';
import { Bot, Sparkles, MessageSquare } from 'lucide-react';

interface WeatherBotWidgetProps {
  onClick: () => void;
  isOpen: boolean;
}

export const WeatherBotWidget: React.FC<WeatherBotWidgetProps> = ({ onClick, isOpen }) => {
  if (isOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
      <button
        type="button"
        onClick={onClick}
        className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-xl shadow-blue-950/60 border border-blue-400/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        title="Open AeroBot AI Disaster & Weather Assistant"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>

        <Bot className="w-4 h-4 text-blue-100 group-hover:rotate-12 transition-transform duration-300" />
        <span className="tracking-wide">AI Weather Bot</span>
        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-white/20 text-white border border-white/30 uppercase tracking-wider">
          Ask AI
        </span>
      </button>
    </div>
  );
};
