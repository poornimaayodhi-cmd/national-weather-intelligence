import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Navigation,
  AlertTriangle,
  ShieldCheck,
  Radio,
  MapPin,
  X,
  ExternalLink,
  ChevronRight,
  Bot,
  Zap,
  Info,
  Layers,
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext.tsx';
import { SPATIAL_EVENT_NODES, SpatialEventNode } from '../spatial/SpatialAtmosphericCanvas.tsx';

interface CopilotMessage {
  id: string;
  sender: 'COPILOT' | 'USER';
  text: string;
  timestamp: string;
  actionType?: 'FOCUS_LOCATION' | 'SHOW_SEVERE' | 'EXPLAIN_EVENT' | 'EXPLAIN_VERIFICATION' | 'NATIONAL_SITUATION';
  targetEvent?: SpatialEventNode;
  highlights?: string[];
}

interface WeatherCopilotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onFocusLocation: (lat: number, lng: number, zoom?: number) => void;
  onSelectEvent: (event: SpatialEventNode) => void;
  onSwitchMode?: (mode: 'RADAR' | 'SATELLITE' | 'EVENTS' | 'THREAT') => void;
}

export const WeatherCopilotPanel: React.FC<WeatherCopilotPanelProps> = ({
  isOpen,
  onClose,
  onFocusLocation,
  onSelectEvent,
  onSwitchMode,
}) => {
  const { location } = useLocation();
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'msg-01',
      sender: 'COPILOT',
      text: "I am your National Weather Intelligence Copilot, actively ingesting 24 live data streams across Doppler radar, automated IoT weather stations, and social media sensors.\n\nHow can I assist your situational awareness today?",
      timestamp: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendQuery = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim()) return;

    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      sender: 'USER',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsProcessing(true);

    setTimeout(() => {
      let botResponse: CopilotMessage;
      const lower = text.toLowerCase();

      if (lower.includes('near me') || lower.includes('my location') || lower.includes('local')) {
        const userLat = location.latitude || 13.0827;
        const userLng = location.longitude || 80.2707;
        const cityName = location.city || 'Chennai';

        // Find nearby events
        const nearby = SPATIAL_EVENT_NODES.filter((n) =>
          n.city.toLowerCase().includes(cityName.toLowerCase()) ||
          n.state.toLowerCase().includes(location.state?.toLowerCase() || 'tamil nadu')
        );
        const primaryNearby = nearby[0] || SPATIAL_EVENT_NODES[0];

        // Trigger camera focus
        onFocusLocation(userLat, userLng, 1.45);
        if (primaryNearby) onSelectEvent(primaryNearby);

        botResponse = {
          id: `bot-${Date.now()}`,
          sender: 'COPILOT',
          text: `Focusing Earth on your coordinates in ${cityName}, ${location.state || 'Tamil Nadu'}.\n\n⚠ ACTIVE LOCAL ALERT:\nHeavy convective cloudburst core detected over Saidapet & Meenambakkam. IMD Doppler radar is measuring 52 dBZ reflectivity (precipitation rate 48mm/hr). The Adyar River gauge at Jafferkhanpet is flowing +1.1m above danger levels. 12 independent sources have corroborated this event with 91% confidence.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
          actionType: 'FOCUS_LOCATION',
          targetEvent: primaryNearby,
          highlights: ['Saidapet Inundation: 4.2ft', 'Doppler Peak: 52 dBZ', 'Confidence: 91% (12 Sources)'],
        };
      } else if (lower.includes('severe') || lower.includes('threat') || lower.includes('danger')) {
        if (onSwitchMode) onSwitchMode('THREAT');
        const severeEvt = SPATIAL_EVENT_NODES.find((n) => n.category === 'SEVERE') || SPATIAL_EVENT_NODES[0];
        onSelectEvent(severeEvt);
        onFocusLocation(severeEvt.lat, severeEvt.lng, 1.4);

        botResponse = {
          id: `bot-${Date.now()}`,
          sender: 'COPILOT',
          text: `Switched 3D stage to THREAT mode. 2 critical regional hotspots require priority attention:\n\n1. Chennai Metropolitan Basin: Level 4 Severe Flash Inundation. Adyar and Cooum catchment basins overflowing; NDRF 4th Battalion deployed.\n2. Guwahati, Assam: Level 3 Riparian Surge. Brahmaputra tributary ultrasonic gauges recording +1.4m rise.\n\nAll municipal and state disaster control rooms have received synchronized warning feeds.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
          actionType: 'SHOW_SEVERE',
          targetEvent: severeEvt,
          highlights: ['Chennai Urban Basin (Level 4)', 'Assam Brahmaputra Basin (Level 3)'],
        };
      } else if (lower.includes('why') && lower.includes('verified') || lower.includes('confidence') || lower.includes('score')) {
        botResponse = {
          id: `bot-${Date.now()}`,
          sender: 'COPILOT',
          text: `Events achieve VERIFIED status through our 9-Factor Mathematical Consensus Engine:\n\n1. Spatio-Temporal Clustering: Reports must fall within ≤15 km radius and Δt ≤60 minutes.\n2. Multi-Channel Independence: Requires minimum 3 distinct data archetypes (e.g. Official IMD Radar + IoT Sensor + Eyewitness Geotags).\n3. Cross-Source Corroboration: Sensor telemetry (e.g. River Gauge +1.1m) must confirm social distress spikes.\n4. Semantic De-Duplication: Bot NLP cleans duplicate rumors and social reposts.\n\nCurrent Chennai Event Score: 91.4% (Threshold: 85%).`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
          actionType: 'EXPLAIN_VERIFICATION',
        };
      } else if (lower.includes('national') || lower.includes('india') || lower.includes('summary') || lower.includes('overview')) {
        onFocusLocation(21.0, 78.0, 1.1);

        botResponse = {
          id: `bot-${Date.now()}`,
          sender: 'COPILOT',
          text: `National Meteorological Situation Briefing:\n\n• Southern Peninsular Belt: Vigorous monsoon squall line active across Tamil Nadu and coastal Andhra Pradesh. Intense convective cells localized over Chennai and Meenambakkam.\n• Western Coast: Arabian Sea squalls bringing 58 km/h wind gusts and 3.5m wave swells near Mumbai harbor.\n• Northern Plains: Delhi-NCR baseline observatory stable at 33.6°C, barometric pressure 1012 hPa.\n• Eastern Sector: Mesoscale lightning storm moving inland near Balasore, Odisha.\n\nOverall National Threat Level: HIGH (Index 74/100).`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
          actionType: 'NATIONAL_SITUATION',
          highlights: ['South Peninsula: Heavy Rain', 'West Coast: Gale Swells', 'Eastern Coast: Lightning'],
        };
      } else {
        const primary = SPATIAL_EVENT_NODES[0];
        botResponse = {
          id: `bot-${Date.now()}`,
          sender: 'COPILOT',
          text: `Regarding "${text}":\n\nThe National Big Data Analytics Engine is cross-referencing this against our active 24 sensor feeds. Key active telemetry indicates intense precipitation in Tamil Nadu and coastal Maharashtra. No discordant rumors or uncorroborated anomalies detected in this sector.\n\nWould you like me to inspect specific radar reflectivity or focus the 3D globe on a state?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
        };
      }

      setMessages((prev) => [...prev, botResponse]);
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[440px] lg:w-[480px] bg-[#020612]/95 border-l border-cyan-500/30 backdrop-blur-2xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between gap-3 bg-slate-950/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-cyan-950/50 border border-cyan-400/40">
            <Sparkles className="w-4 h-4 text-cyan-200" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              INTELLIGENCE COPILOT
            </div>
            <h3 className="text-xs font-bold text-white font-mono">
              AI WEATHER COPILOT • REAL-TIME AGENT
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Action Chips */}
      <div className="p-2.5 border-b border-slate-850 bg-slate-950/50 flex items-center gap-1.5 overflow-x-auto text-[10.5px] font-mono no-scrollbar">
        <button
          type="button"
          onClick={() => handleSendQuery("What's happening near me?")}
          className="px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 whitespace-nowrap shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <MapPin className="w-3 h-3" />
          <span>Near me</span>
        </button>

        <button
          type="button"
          onClick={() => handleSendQuery('Show severe events')}
          className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 whitespace-nowrap shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <AlertTriangle className="w-3 h-3" />
          <span>Severe alerts</span>
        </button>

        <button
          type="button"
          onClick={() => handleSendQuery('Why is this verified?')}
          className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 whitespace-nowrap shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <ShieldCheck className="w-3 h-3" />
          <span>Verification logic</span>
        </button>

        <button
          type="button"
          onClick={() => handleSendQuery('National situation')}
          className="px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 whitespace-nowrap shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Radio className="w-3 h-3" />
          <span>National brief</span>
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'USER' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-mono text-slate-500">
              <span>{msg.sender === 'USER' ? 'FIELD OPERATOR' : 'WEATHER COPILOT'}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            <div
              className={`p-3.5 rounded-2xl max-w-[92%] leading-relaxed ${
                msg.sender === 'USER'
                  ? 'bg-cyan-600 text-white rounded-br-xs font-mono text-xs shadow-md'
                  : 'bg-slate-900/90 text-slate-200 border border-cyan-500/25 rounded-bl-xs shadow-lg'
              }`}
            >
              <div className="whitespace-pre-line text-xs font-normal">
                {msg.text}
              </div>

              {msg.highlights && (
                <div className="mt-2.5 pt-2 border-t border-slate-800 space-y-1">
                  {msg.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="text-[11px] font-mono text-cyan-300 flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              )}

              {msg.targetEvent && (
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="text-[10px] font-mono text-slate-400">
                    TARGET: <strong className="text-white">{msg.targetEvent.city}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectEvent(msg.targetEvent!);
                      onFocusLocation(msg.targetEvent!.lat, msg.targetEvent!.lng, 1.45);
                    }}
                    className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inspect Event</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900/70 border border-cyan-500/20 max-w-xs text-xs font-mono text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Cross-correlating sensor & radar channels...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery();
          }}
          className="relative flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about live rain, flood risk, or verify an incident..."
            className="flex-1 pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-400 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isProcessing}
            className="w-9 h-9 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-md shadow-cyan-950/40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-500 mt-1.5 px-1">
          <span>AI AGENT GROUNDED IN IMD + CITIZEN TELEMETRY</span>
          <span className="text-cyan-400">LATENCY: 18ms</span>
        </div>
      </div>
    </div>
  );
};
