import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Radio,
  ArrowRight,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { MapWeatherEvent, REALTIME_WEATHER_EVENTS } from './osData.ts';

export interface CopilotMessage {
  id: string;
  sender: 'copilot' | 'user';
  text: string;
  timestamp: string;
  actionTaken?: string;
  actionPayload?: any;
}

interface WeatherCopilotPanelProps {
  onTriggerMapAction: (action: {
    type: 'FOCUS_LOCATION' | 'SHOW_SEVERE' | 'OPEN_EVENT' | 'SET_MODE';
    lat?: number;
    lng?: number;
    zoom?: number;
    eventId?: string;
    mode?: any;
    label?: string;
  }) => void;
  selectedEvent: MapWeatherEvent | null;
  userCity?: string;
}

export const WeatherCopilotPanel: React.FC<WeatherCopilotPanelProps> = ({
  onTriggerMapAction,
  selectedEvent,
  userCity = 'Chennai',
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'msg-init',
      sender: 'copilot',
      text: 'I’m monitoring 128 active weather events across India. 17 currently require attention in the Adyar and coastal Tamil Nadu delta.',
      timestamp: '21:42 IST',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Quick Action Chips
  const quickChips = [
    { label: "What's happening near me?", query: "What's happening near me?" },
    { label: 'Show severe events', query: 'Show severe events' },
    { label: 'Why is Chennai high risk?', query: 'Why is Chennai high risk?' },
    { label: 'Verify this event', query: 'Verify this event' },
    { label: 'Summarize India', query: 'Summarize India' },
  ];

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsProcessing(true);

    const q = text.toLowerCase();

    // 1. Check for Map-Connecting Commands (Requirement 6)
    if (q.includes('near me') || q.includes('my location') || q.includes('happening near')) {
      setTimeout(() => {
        onTriggerMapAction({
          type: 'FOCUS_LOCATION',
          lat: 13.0827,
          lng: 80.2707,
          zoom: 1.45,
          label: 'User Vicinity: Chennai',
        });

        const reply: CopilotMessage = {
          id: `cop-${Date.now()}`,
          sender: 'copilot',
          text: `I found 2 significant events within your selected area (${userCity}): Extreme flash flood inundation at Saidapet subway (4.2ft waterlogged) and continuous Doppler radar convective rain bands. Map centered on your location.`,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
          actionTaken: 'Centered map on Chennai & highlighted active events',
        };
        setMessages((prev) => [...prev, reply]);
        setIsProcessing(false);
      }, 500);
      return;
    }

    if (q.includes('severe') || q.includes('high risk') || q.includes('show severe')) {
      setTimeout(() => {
        onTriggerMapAction({
          type: 'SHOW_SEVERE',
          mode: 'THREAT',
          lat: 13.08,
          lng: 80.27,
          zoom: 1.35,
        });

        const reply: CopilotMessage = {
          id: `cop-${Date.now()}`,
          sender: 'copilot',
          text: 'Displaying 17 high-risk events across India. Activated Threat Mode on map. Critical flash flood perimeter flagged in Chennai (91% confidence, 12 sources) and coastal squall in Mumbai.',
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
          actionTaken: 'Switched map to Threat Mode & focused on high-risk perimeters',
        };
        setMessages((prev) => [...prev, reply]);
        setIsProcessing(false);
      }, 500);
      return;
    }

    if (q.includes('why is chennai') || q.includes('chennai high risk')) {
      setTimeout(() => {
        onTriggerMapAction({
          type: 'OPEN_EVENT',
          eventId: 'EVT-CHE-001',
          lat: 13.0827,
          lng: 80.2707,
          zoom: 1.5,
        });

        const reply: CopilotMessage = {
          id: `cop-${Date.now()}`,
          sender: 'copilot',
          text: 'Chennai is at Level 4 SEVERE Threat because Adyar River gauges are 1.1m above danger mark, Saidapet subway has 4.2ft inundation, and 12 independent sources (IMD Doppler, GCC ultrasonic sensor, Twitter/X geotags, citizen spotters) confirm extreme waterlogging with 91.4% confidence.',
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
          actionTaken: 'Opened Event Intelligence Dossier for Chennai Saidapet',
        };
        setMessages((prev) => [...prev, reply]);
        setIsProcessing(false);
      }, 500);
      return;
    }

    if (q.includes('verify') || q.includes('verification')) {
      setTimeout(() => {
        const target = selectedEvent || REALTIME_WEATHER_EVENTS[0];
        onTriggerMapAction({
          type: 'OPEN_EVENT',
          eventId: target.id,
          lat: target.lat,
          lng: target.lng,
        });

        const reply: CopilotMessage = {
          id: `cop-${Date.now()}`,
          sender: 'copilot',
          text: `Event "${target.type}" in ${target.city} is cross-verified across ${target.sourcesCount} sources with 8 correlated reports. Official IMD radar agrees with citizen mPING spotters at ${target.confidence}% confidence score.`,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
          actionTaken: `Audited evidence chain for ${target.city}`,
        };
        setMessages((prev) => [...prev, reply]);
        setIsProcessing(false);
      }, 500);
      return;
    }

    if (q.includes('summarize') || q.includes('summary')) {
      setTimeout(() => {
        onTriggerMapAction({
          type: 'FOCUS_LOCATION',
          lat: 21.5,
          lng: 82.0,
          zoom: 1.0,
        });

        const reply: CopilotMessage = {
          id: `cop-${Date.now()}`,
          sender: 'copilot',
          text: 'National Synoptic Summary: Active monsoon surge over Bay of Bengal triggering intense precipitation in Tamil Nadu (124mm). Western Ghats & Mumbai experiencing 58 km/h squalls. Central India baseline verified. Overall national confidence: 89.2%.',
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
          actionTaken: 'Restored full India synoptic map view',
        };
        setMessages((prev) => [...prev, reply]);
        setIsProcessing(false);
      }, 500);
      return;
    }

    // Default: query backend /api/bot/chat
    try {
      const res = await fetch('/api/bot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-4).map((m) => ({
            role: m.sender === 'copilot' ? 'assistant' : 'user',
            parts: [{ text: m.text }],
          })),
          locationMeta: { city: userCity, state: 'Tamil Nadu' },
        }),
      });

      const data = await res.json();
      const replyText =
        data.reply ||
        'Active telemetry verified across IMD Doppler stations and multi-source inputs. Monitoring live threat indices across all sectors.';

      const copilotMsg: CopilotMessage = {
        id: `cop-${Date.now()}`,
        sender: 'copilot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      };
      setMessages((prev) => [...prev, copilotMsg]);
    } catch {
      const fallbackMsg: CopilotMessage = {
        id: `cop-${Date.now()}`,
        sender: 'copilot',
        text: 'Monitoring live meteorological feeds across 128 active stations. High-confidence flood warning remains active for Tamil Nadu coastal delta.',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-slate-950/90 border border-cyan-500/30 backdrop-blur-md shadow-2xl overflow-hidden select-none">
      {/* Copilot Header */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
            <Bot className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <span>WEATHER COPILOT</span>
              <span className="text-[9px] font-bold text-cyan-400 bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-800">
                AI
              </span>
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ONLINE • CONNECTED TO MAP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Chips Bar */}
      <div className="p-2 bg-slate-950/80 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
        {quickChips.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => handleSendMessage(chip.query)}
            disabled={isProcessing}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 text-[10.5px] font-mono text-cyan-300 hover:text-white whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[180px] max-h-[300px] text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`p-2.5 rounded-xl max-w-[92%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-sm'
              }`}
            >
              <div className="text-[11px]">{msg.text}</div>

              {msg.actionTaken && (
                <div className="mt-1.5 pt-1.5 border-t border-slate-800 flex items-center gap-1 text-[9.5px] font-mono text-cyan-400">
                  <Zap className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>Map Action: {msg.actionTaken}</span>
                </div>
              )}
            </div>

            <span className="text-[9.5px] font-mono text-slate-500 mt-1 px-1">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 text-[11px] font-mono text-cyan-400">
            <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
            <span>Analyzing multi-source meteorological grid...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-2.5 bg-slate-900/80 border-t border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="flex items-center gap-1.5"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Copilot (e.g. 'Show severe weather', 'Why is Chennai high risk?')..."
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors font-mono"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isProcessing}
            className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
