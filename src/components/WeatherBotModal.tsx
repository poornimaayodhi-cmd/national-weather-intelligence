import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Terminal,
  MessageSquare,
  ShieldAlert,
  CloudRain,
  ExternalLink,
  ChevronRight,
  MapPin,
  Flame,
} from 'lucide-react';
import { useLocation } from '../context/LocationContext.tsx';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  source?: 'gemini' | 'grounded_rules';
}

interface WeatherBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const WeatherBotModal: React.FC<WeatherBotModalProps> = ({
  isOpen,
  onClose,
  initialQuery,
}) => {
  const { location } = useLocation();
  const [activeTab, setActiveTab] = useState<'chat' | 'api'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content:
        '👋 Hello! I am **AeroBot**, your AI Disaster Intelligence & Weather Assistant.\n\nI can analyze real-time automated weather station (AWS) telemetry, explain multi-source disaster reports (social, citizen, radar), clarify correlation confidence scores, or assist with our REST APIs. How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'gemini',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([
    'What is the current weather at my location?',
    'Explain the flood severity in Saidapet, Chennai',
    'What emergency actions are recommended by NDMA?',
    'How do I ingest a report via API?',
    'Show correlation confidence factors',
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      if (initialQuery && initialQuery.trim()) {
        handleSendMessage(initialQuery);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const payload = {
        message: query,
        history: messages.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        })),
        locationMeta: location
          ? {
              city: location.city,
              latitude: location.latitude,
              longitude: location.longitude,
              stationName: location.station?.station_name,
            }
          : undefined,
      };

      const res = await fetch('/api/bot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'model',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: data.source,
        };
        setMessages((prev) => [...prev, botMsg]);

        if (Array.isArray(data.suggested_followups) && data.suggested_followups.length > 0) {
          setSuggestions(data.suggested_followups);
        }
      } else {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'model',
          content: `⚠️ Error: ${data.error || 'Failed to process request.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      const networkErrorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `⚠️ Network error: Could not contact bot server (${err.message}).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, networkErrorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'model',
        content: 'Conversation history reset. How can I assist you with meteorological telemetry or disaster correlation?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'gemini',
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl h-[85vh] max-h-[800px] flex flex-col rounded-2xl bg-slate-900 border border-slate-750 shadow-2xl overflow-hidden text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-900/30">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>AeroBot AI Assistant</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Gemini 3.8 Flash
                  </span>
                </h3>
              </div>
              <p className="text-[11px] text-slate-400">
                Grounded Disaster Intelligence & Telemetry Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tabs */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'chat'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('api')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'api'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>API Specs</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Bot Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Interactive Chat */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-950/60">
            {/* Location Context Banner */}
            {location && (
              <div className="px-4 py-1.5 bg-blue-950/40 border-b border-blue-900/30 text-[11px] text-blue-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>
                    Location Context Active:{' '}
                    <strong className="text-white">
                      {location.city}, {location.state}
                    </strong>{' '}
                    ({location.mode === 'gps' ? 'GPS Telemetry' : 'Manual Selection'}
                    {location.accuracy !== undefined ? ` • ±${Math.round(location.accuracy)}m` : ''})
                  </span>
                </span>
                <span className="text-[10px] text-blue-400/80 shrink-0">Auto-injected in queries</span>
              </div>
            )}

            {/* Chat Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-semibold text-slate-400">
                      {msg.role === 'user' ? 'You' : 'AeroBot AI'}
                    </span>
                    <span className="text-[10px] text-slate-500">• {msg.timestamp}</span>
                    {msg.source && (
                      <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {msg.source === 'gemini' ? 'Gemini 3.8 Flash' : 'Grounded Telemetry'}
                      </span>
                    )}
                  </div>

                  <div
                    className={`group relative max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-xs'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-xs whitespace-pre-wrap'
                    }`}
                  >
                    {/* Render message text with simple markdown styling */}
                    <div className="prose prose-invert prose-xs max-w-none space-y-2">
                      {msg.content.split('\n\n').map((paragraph, idx) => (
                        <p key={idx} className="my-1 whitespace-pre-wrap">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    {/* Copy action on hover for bot messages */}
                    {msg.role === 'model' && (
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="absolute top-2 right-2 p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-semibold text-slate-400">AeroBot AI</span>
                    <span className="text-[10px] text-blue-400 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Analyzing weather telemetry & reports...
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-xs p-3.5 text-xs text-slate-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                    <span>Consulting Gemini & multi-source engine models...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Followups */}
            {suggestions.length > 0 && (
              <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-900/60 overflow-x-auto">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Suggestions:
                  </span>
                  {suggestions.slice(0, 4).map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSendMessage(sug)}
                      disabled={isLoading}
                      className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors cursor-pointer shrink-0"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors shrink-0"
                  title="Clear conversation history"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask AeroBot about weather, Saidapet flooding, or REST APIs..."
                  disabled={isLoading}
                  className="flex-1 bg-slate-900 border border-slate-750 focus:border-blue-500 focus:outline-none rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 transition-colors"
                />

                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs shrink-0 cursor-pointer"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: REST API Documentation & Playground */}
        {activeTab === 'api' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs bg-slate-950/70">
            <div>
              <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                Weather Engine & Bot Programmatic API Specifications
              </h4>
              <p className="text-slate-400 text-xs">
                Integrate external disaster platforms, command centers, and automated scripts with our backend endpoints.
              </p>
            </div>

            {/* Endpoint 1: Bot Chat API */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-900/60 text-blue-300 border border-blue-700/60">
                    POST
                  </span>
                  <span className="font-mono text-slate-200 font-semibold">/api/bot/chat</span>
                </div>
                <span className="text-[11px] text-slate-400">Gemini 3.8 Flash Engine</span>
              </div>
              <p className="text-slate-300 text-xs">
                Query the AI disaster assistant with custom messages and optional location coordinates.
              </p>
              <pre className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-blue-200 border border-slate-800 overflow-x-auto">
{`curl -X POST "http://localhost:3000/api/bot/chat" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "What is the correlation confidence score for Saidapet flash-flood?",
    "locationMeta": {
      "city": "Chennai",
      "latitude": 13.015,
      "longitude": 80.221
    }
  }'`}
              </pre>
            </div>

            {/* Endpoint 2: Live Weather Telemetry */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700/60">
                    GET
                  </span>
                  <span className="font-mono text-slate-200 font-semibold">/api/weather/current</span>
                </div>
                <span className="text-[11px] text-slate-400">Real-Time Telemetry</span>
              </div>
              <p className="text-slate-300 text-xs">
                Retrieve 100% genuine automated surface station readings for given GPS coordinates.
              </p>
              <pre className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-emerald-200 border border-slate-800 overflow-x-auto">
{`curl -X GET "http://localhost:3000/api/weather/current?lat=13.015&lon=80.221&city=Chennai"`}
              </pre>
            </div>

            {/* Endpoint 3: Report Ingestion */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-900/60 text-blue-300 border border-blue-700/60">
                    POST
                  </span>
                  <span className="font-mono text-slate-200 font-semibold">/api/ingest</span>
                </div>
                <span className="text-[11px] text-slate-400">Common Data Model Ingestion</span>
              </div>
              <p className="text-slate-300 text-xs">
                Ingest heterogeneous disaster or weather reports into the standardized 17-field pipeline.
              </p>
              <pre className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-purple-200 border border-slate-800 overflow-x-auto">
{`curl -X POST "http://localhost:3000/api/ingest" \\
  -H "Content-Type: application/json" \\
  -d '{
    "source_type": "CITIZEN",
    "text": "Water logging rising to 3 feet under Maraimalai Adigal bridge",
    "city": "Chennai",
    "event_category": "FLOOD"
  }'`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
