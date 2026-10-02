import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Users,
  Database,
  Activity,
  BarChart3,
  Globe,
  Radio,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sliders,
  Sparkles,
  Server,
  Zap,
  TrendingUp,
  MapPin,
  ExternalLink,
  ChevronRight,
  Eye,
  Trash2,
  Edit2,
  UserCheck,
  UserX,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { SPATIAL_EVENT_NODES, SpatialEventNode } from '../spatial/SpatialAtmosphericCanvas.tsx';

type AdminTab =
  | 'OVERVIEW'
  | 'USER_MANAGEMENT'
  | 'EVENT_MANAGEMENT'
  | 'VERIFICATION_CENTER'
  | 'DATA_SOURCES'
  | 'ANALYTICS'
  | 'NATIONAL_MAP'
  | 'SYSTEM_MONITOR'
  | 'AUDIT_LOG'
  | 'SETTINGS';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  location: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  role: 'ADMIN' | 'USER';
  lastActive: string;
}

const INITIAL_ADMIN_USERS: AdminUser[] = [
  { id: 'USR-001', name: 'Dr. Poornima Ayodhi', email: 'poornima@weather.gov.in', location: 'Chennai, TN', status: 'ACTIVE', role: 'ADMIN', lastActive: 'Just now' },
  { id: 'USR-002', name: 'Rajesh Kumar', email: 'rajesh.field@tn-disaster.gov.in', location: 'Chennai, TN', status: 'ACTIVE', role: 'USER', lastActive: '12m ago' },
  { id: 'USR-003', name: 'Ananya Sharma', email: 'ananya.s@imd.gov.in', location: 'New Delhi, DL', status: 'ACTIVE', role: 'ADMIN', lastActive: '2h ago' },
  { id: 'USR-004', name: 'Vikramaditya Roy', email: 'v.roy@cwc.gov.in', location: 'Guwahati, AS', status: 'ACTIVE', role: 'USER', lastActive: '45m ago' },
  { id: 'USR-005', name: 'Manoj Patil', email: 'manoj.patil@mcgm.gov.in', location: 'Mumbai, MH', status: 'ACTIVE', role: 'USER', lastActive: '1d ago' },
  { id: 'USR-006', name: 'Kavitha Swaminathan', email: 'kavitha.ngo@chennaiaid.org', location: 'Chennai, TN', status: 'SUSPENDED', role: 'USER', lastActive: '3d ago' },
];

interface PendingVerificationItem {
  id: string;
  title: string;
  location: string;
  sourcesCount: number;
  agreement: number;
  duplicateProbability: number;
  evidenceScore: number;
  category: string;
  timestamp: string;
  sourceBreakdown: { name: string; type: string; confidence: number }[];
}

const PENDING_VERIFICATION_QUEUE: PendingVerificationItem[] = [
  {
    id: 'VER-QUE-01',
    title: 'Adyar River Overbank Inundation (Velachery-Saidapet Bridge)',
    location: 'Chennai, Tamil Nadu',
    sourcesCount: 12,
    agreement: 94,
    duplicateProbability: 3,
    evidenceScore: 91,
    category: 'SEVERE FLASH FLOOD',
    timestamp: '21:32 IST',
    sourceBreakdown: [
      { name: 'IMD Doppler Radar Meenambakkam', type: 'DOPPLER', confidence: 96 },
      { name: 'TNSDMA River Ultrasonic Sensor #AD-04', type: 'IOT SENSOR', confidence: 98 },
      { name: 'GCC Ward 142 Flood Telemetry', type: 'CIVIC API', confidence: 92 },
      { name: '@chennairains Verified Spotter Ping', type: 'TWITTER / X', confidence: 88 },
    ],
  },
  {
    id: 'VER-QUE-02',
    title: 'Arabian Sea Marine Squall Line (Western Seaboard)',
    location: 'Mumbai, Maharashtra',
    sourcesCount: 8,
    agreement: 89,
    duplicateProbability: 5,
    evidenceScore: 87,
    category: 'COASTAL SQUALL & GALE',
    timestamp: '20:50 IST',
    sourceBreakdown: [
      { name: 'Colaba Observatory AWS Anemometer', type: 'AWS', confidence: 94 },
      { name: 'INCOIS Marine Ocean Buoy #MB-02', type: 'BUOY SENSOR', confidence: 91 },
      { name: 'Mumbai Police Traffic Inundation Feed', type: 'CCTV API', confidence: 86 },
    ],
  },
  {
    id: 'VER-QUE-03',
    title: 'Brahmaputra Riparian Surge Watch',
    location: 'Guwahati, Assam',
    sourcesCount: 11,
    agreement: 91,
    duplicateProbability: 4,
    evidenceScore: 89,
    category: 'RIVERINE SURGE',
    timestamp: '19:45 IST',
    sourceBreakdown: [
      { name: 'CWC Pandu Telemetry Station', type: 'RIVER GAUGE', confidence: 96 },
      { name: 'SDRF River Patrol Spotters', type: 'HUMAN SENSOR', confidence: 89 },
      { name: 'Sentinel-1 SAR Radar Altimetry', type: 'SATELLITE', confidence: 92 },
    ],
  },
];

interface AuditLogEntry {
  id: string;
  time: string;
  action: string;
  user: string;
  type: 'VERIFY' | 'ALERT' | 'SYSTEM' | 'USER' | 'INGEST';
}

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'LOG-01', time: '21:42:08', action: 'Director verified Event EVT-CHE-2026-001 (Saidapet Flash Inundation)', user: 'poornima@weather.gov.in', type: 'VERIFY' },
  { id: 'LOG-02', time: '21:35:14', action: 'Doppler Meenambakkam radar packet synchronized (52 dBZ core)', user: 'SYSTEM (Auto)', type: 'INGEST' },
  { id: 'LOG-03', time: '21:28:45', action: 'Duplicate social media tweet clustered into Incident #CHE-001', user: 'AI ML Engine', type: 'SYSTEM' },
  { id: 'LOG-04', time: '21:15:30', action: 'NDMA Level 4 Severe Alert dispatched to Tamil Nadu SDMA control room', user: 'poornima@weather.gov.in', type: 'ALERT' },
  { id: 'LOG-05', time: '21:02:11', action: 'New field responder account registered (Rajesh Kumar)', user: 'Auth Service', type: 'USER' },
  { id: 'LOG-06', time: '20:55:00', action: 'CWC River Gauge #AD-04 heartbeat acknowledged (+1.1m reading)', user: 'IoT Hub', type: 'INGEST' },
];

export const AdminCommandCenter: React.FC = () => {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');

  // User Management State
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [userFilter, setUserFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ADMIN' | 'USER'>('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'ADMIN' | 'USER'>('USER');
  const [newUserLocation, setNewUserLocation] = useState('Chennai, TN');

  // Verification Center State
  const [verificationQueue, setVerificationQueue] = useState<PendingVerificationItem[]>(PENDING_VERIFICATION_QUEUE);
  const [reviewedId, setReviewedId] = useState<string | null>(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Settings State
  const [confidenceThreshold, setConfidenceThreshold] = useState('85');
  const [autoVerifyAgreement, setAutoVerifyAgreement] = useState('92');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // User Management Actions
  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const handleChangeUserRole = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return { ...u, role: u.role === 'ADMIN' ? 'USER' : 'ADMIN' };
        }
        return u;
      })
    );
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    const added: AdminUser = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: newUserName,
      email: newUserEmail,
      location: newUserLocation,
      role: newUserRole,
      status: 'ACTIVE',
      lastActive: 'Just now',
    };
    setUsers((prev) => [added, ...prev]);
    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  // Verification Actions
  const handleVerifyIncident = (id: string, decision: 'VERIFY' | 'REJECT') => {
    const item = verificationQueue.find((q) => q.id === id);
    if (!item) return;

    setVerificationQueue((prev) => prev.filter((q) => q.id !== id));
    setAuditLogs((prev) => [
      {
        id: `LOG-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        action: `Director ${decision === 'VERIFY' ? 'verified' : 'rejected'} incident ${item.title}`,
        user: 'poornima@weather.gov.in',
        type: 'VERIFY',
      },
      ...prev,
    ]);
  };

  const filteredUsers = users.filter((u) => {
    const matchesFilter =
      userFilter === 'ALL'
        ? true
        : userFilter === 'ADMIN' || userFilter === 'USER'
        ? u.role === userFilter
        : u.status === userFilter;
    const matchesSearch =
      !userSearch.trim() ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.location.toLowerCase().includes(userSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* ========================================================================= */}
      {/* 1. ADMIN HEADER & TITLE STRIP                                             */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/90 border border-purple-500/30 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-purple-950/60 border border-purple-400/40">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase font-bold text-purple-400 tracking-widest">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span>NATIONAL COMMAND & CONTROL CENTER • ROLE: ADMINISTRATOR</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Weather Big Data Management Console
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 font-bold flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            <span>AUTHENTICATED ACCESS</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold">
            LATENCY: <strong className="text-emerald-400">14ms</strong>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ADMIN SUB-NAVIGATION BAR                                               */}
      {/* ========================================================================= */}
      <div className="p-1.5 rounded-2xl bg-slate-950/85 border border-slate-800/90 backdrop-blur-md flex items-center gap-1 overflow-x-auto no-scrollbar text-xs font-mono font-bold">
        {[
          { key: 'OVERVIEW', label: 'Overview', icon: <Activity className="w-3.5 h-3.5" /> },
          { key: 'USER_MANAGEMENT', label: 'User Management', icon: <Users className="w-3.5 h-3.5" /> },
          { key: 'EVENT_MANAGEMENT', label: 'Event Management', icon: <Radio className="w-3.5 h-3.5" /> },
          { key: 'VERIFICATION_CENTER', label: `AI Verification (${verificationQueue.length})`, icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> },
          { key: 'DATA_SOURCES', label: 'Data Sources (6)', icon: <Database className="w-3.5 h-3.5" /> },
          { key: 'ANALYTICS', label: 'Analytics', icon: <BarChart3 className="w-3.5 h-3.5" /> },
          { key: 'NATIONAL_MAP', label: 'Admin Map', icon: <Globe className="w-3.5 h-3.5" /> },
          { key: 'SYSTEM_MONITOR', label: 'System Health', icon: <Server className="w-3.5 h-3.5" /> },
          { key: 'AUDIT_LOG', label: 'Audit Log', icon: <FileText className="w-3.5 h-3.5" /> },
          { key: 'SETTINGS', label: 'Settings', icon: <Sliders className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as AdminTab)}
            className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === tab.key
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW                                                           */}
      {/* ========================================================================= */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Top 7 Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 font-mono">
            <div className="p-4 rounded-2xl bg-slate-950/85 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold">ACTIVE USERS</span>
              <div className="text-2xl font-black text-white mt-1">1,428</div>
              <span className="text-[10px] text-emerald-400">● 42 Field Responders</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/85 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold">ACTIVE EVENTS</span>
              <div className="text-2xl font-black text-cyan-300 mt-1">24</div>
              <span className="text-[10px] text-cyan-400">● Across 8 States</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/85 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold">VERIFIED</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">18</div>
              <span className="text-[10px] text-slate-400">● 75% Verification Rate</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/85 border border-purple-500/30">
              <span className="text-[10px] text-purple-300 uppercase font-bold">PENDING QUEUE</span>
              <div className="text-2xl font-black text-purple-400 mt-1">{verificationQueue.length}</div>
              <span className="text-[10px] text-purple-300 animate-pulse">● Awaiting Review</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/85 border border-rose-500/30">
              <span className="text-[10px] text-rose-400 uppercase font-bold">HIGH-RISK</span>
              <div className="text-2xl font-black text-rose-400 mt-1">4</div>
              <span className="text-[10px] text-rose-300">● NDRF Corridors</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/85 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold">DATA SOURCES</span>
              <div className="text-2xl font-black text-emerald-300 mt-1">6 / 6</div>
              <span className="text-[10px] text-emerald-400">● All Streams Online</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/85 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold">SYSTEM HEALTH</span>
              <div className="text-2xl font-black text-white mt-1">99.98%</div>
              <span className="text-[10px] text-cyan-400">● 14ms Avg Latency</span>
            </div>
          </div>

          {/* Quick Review Row: AI Verification Queue Preview & Ingestion Health */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-950/85 border border-cyan-500/25 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    PRIORITY INCIDENT VERIFICATION QUEUE
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('VERIFICATION_CENTER')}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline"
                >
                  Open Full Center →
                </button>
              </div>

              <div className="space-y-3">
                {verificationQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase bg-rose-950 text-rose-300 border border-rose-800">
                          {item.category}
                        </span>
                        <span className="text-slate-400">{item.timestamp}</span>
                      </div>
                      <h4 className="font-bold text-white mt-1">{item.title}</h4>
                      <p className="text-slate-400">{item.location}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right mr-2">
                        <div className="text-emerald-400 font-bold">{item.evidenceScore}% Score</div>
                        <div className="text-[10px] text-slate-400">{item.sourcesCount} Sources</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleVerifyIncident(item.id, 'VERIFY')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors cursor-pointer"
                      >
                        Verify
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVerifyIncident(item.id, 'REJECT')}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Operational Audit Trail */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-950/85 border border-purple-500/25 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    SYSTEM AUDIT CHRONOLOGY
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('AUDIT_LOG')}
                  className="text-xs font-mono text-purple-400 hover:text-purple-300 underline"
                >
                  View All Logs →
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {auditLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-850 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="text-white text-[11.5px] leading-snug">{log.action}</div>
                      <div className="text-[10px] text-slate-500 mt-1">OPERATOR: {log.user}</div>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: USER MANAGEMENT                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'USER_MANAGEMENT' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950/85 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 font-mono text-xs">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user by name, email, or jurisdiction..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
              {(['ALL', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'ADMIN', 'USER'] as const).map((flt) => (
                <button
                  key={flt}
                  type="button"
                  onClick={() => setUserFilter(flt)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    userFilter === flt
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {flt}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowAddUserModal(true)}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="rounded-3xl bg-slate-950/85 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10.5px] border-b border-slate-800">
                  <tr>
                    <th className="p-3.5 pl-5">User</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Jurisdiction</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Last Active</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3.5 pl-5 font-bold text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 text-cyan-300 flex items-center justify-center font-bold">
                          {u.name.charAt(0)}
                        </div>
                        <span>{u.name}</span>
                      </td>
                      <td className="p-3.5 text-cyan-300">{u.email}</td>
                      <td className="p-3.5 text-slate-300">{u.location}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">{u.lastActive}</td>
                      <td className="p-3.5 pr-5 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => handleToggleUserStatus(u.id)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="Suspend/Activate"
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChangeUserRole(u.id)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-purple-950 text-slate-300 hover:text-purple-300"
                          title="Toggle Role"
                        >
                          Role
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1 rounded bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add User Modal */}
          {showAddUserModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <div className="w-full max-w-md p-6 rounded-3xl bg-slate-950 border border-cyan-500/40 shadow-2xl space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-sm">ADD INSTITUTIONAL USER</h3>
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleAddUser} className="space-y-3">
                  <div>
                    <label className="block text-slate-400 uppercase font-bold mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="Dr. Anand Varma"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 uppercase font-bold mb-1">Official Email</label>
                    <input
                      type="email"
                      required
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="anand@weather.gov.in"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 uppercase font-bold mb-1">Assigned Role</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as 'ADMIN' | 'USER')}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="USER">FIELD USER / CITIZEN</option>
                      <option value="ADMIN">ADMINISTRATOR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 uppercase font-bold mb-1">Jurisdiction</label>
                    <input
                      type="text"
                      value={newUserLocation}
                      onChange={(e) => setNewUserLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase transition-colors"
                  >
                    Create User Record
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: EVENT MANAGEMENT                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'EVENT_MANAGEMENT' && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-slate-950/85 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10.5px] border-b border-slate-800">
                  <tr>
                    <th className="p-3.5 pl-5">Event</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Sources</th>
                    <th className="p-3.5">Confidence</th>
                    <th className="p-3.5">Severity</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {SPATIAL_EVENT_NODES.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3.5 pl-5 font-bold text-white">
                        <div>{evt.title}</div>
                        <div className="text-[10px] text-slate-500">{evt.id}</div>
                      </td>
                      <td className="p-3.5 text-slate-300">{evt.city}, {evt.state}</td>
                      <td className="p-3.5 text-cyan-300 font-bold">{evt.sourcesCount} Channels</td>
                      <td className="p-3.5 text-emerald-400 font-bold">{evt.confidence}%</td>
                      <td className="p-3.5">
                        <span
                          className="px-2 py-0.5 rounded text-[9.5px] font-bold text-white uppercase"
                          style={{ backgroundColor: evt.severityColor }}
                        >
                          {evt.category}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {evt.status}
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-right space-x-1.5">
                        <button
                          type="button"
                          className="px-2.5 py-1 rounded bg-blue-600/30 text-blue-300 hover:bg-blue-600 hover:text-white"
                        >
                          Inspect
                        </button>
                        <button
                          type="button"
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-amber-950 text-slate-300 hover:text-amber-300"
                        >
                          Flag
                        </button>
                        <button
                          type="button"
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-purple-950 text-slate-300 hover:text-purple-300"
                        >
                          Merge
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AI VERIFICATION CENTER                                             */}
      {/* ========================================================================= */}
      {activeTab === 'VERIFICATION_CENTER' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-lg font-black text-white font-mono uppercase tracking-tight">
                AI Automated Multi-Source Cross-Corroboration Center
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Inspect cross-channel agreement, Doppler dBZ match, and semantic duplicate probability.
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-purple-950 text-purple-300 border border-purple-800 font-mono text-xs font-bold">
              {verificationQueue.length} PENDING AUDITS
            </span>
          </div>

          <div className="space-y-4">
            {verificationQueue.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-slate-950/90 border border-cyan-500/30 backdrop-blur-xl shadow-xl space-y-4 font-mono text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 uppercase">
                        {item.category}
                      </span>
                      <span className="text-slate-400">{item.timestamp}</span>
                    </div>
                    <h4 className="text-base font-bold text-white">{item.title}</h4>
                    <p className="text-slate-400 mt-0.5">{item.location}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleVerifyIncident(item.id, 'VERIFY')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase transition-colors shadow-md shadow-emerald-950/50 cursor-pointer"
                    >
                      ✓ VERIFY & DISPATCH
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerifyIncident(item.id, 'REJECT')}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-800 transition-colors cursor-pointer"
                    >
                      REJECT
                    </button>
                  </div>
                </div>

                {/* Algorithmic Scoring Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-850">
                    <span className="text-slate-400 text-[10.5px]">CROSS-CHANNEL AGREEMENT</span>
                    <div className="text-lg font-black text-emerald-400 mt-0.5">{item.agreement}%</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-850">
                    <span className="text-slate-400 text-[10.5px]">EVIDENCE CONFIDENCE</span>
                    <div className="text-lg font-black text-cyan-300 mt-0.5">{item.evidenceScore}%</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-850">
                    <span className="text-slate-400 text-[10.5px]">DUPLICATE PROBABILITY</span>
                    <div className="text-lg font-black text-purple-400 mt-0.5">{item.duplicateProbability}%</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-850">
                    <span className="text-slate-400 text-[10.5px]">CORRELATED STREAMS</span>
                    <div className="text-lg font-black text-white mt-0.5">{item.sourcesCount} FEEDS</div>
                  </div>
                </div>

                {/* Evidence Feeds Breakdown */}
                <div>
                  <div className="text-slate-400 text-[11px] uppercase font-bold mb-2">
                    CORROBORATING SENSOR & SOCIAL FEEDS:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {item.sourceBreakdown.map((src, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-850 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-white text-[11px]">{src.name}</div>
                          <div className="text-[10px] text-slate-500">{src.type}</div>
                        </div>
                        <span className="text-emerald-400 font-bold">{src.confidence}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {verificationQueue.length === 0 && (
              <div className="p-12 rounded-3xl bg-slate-950/80 border border-slate-850 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white font-mono">Verification Queue Clear</h4>
                <p className="text-xs text-slate-400">All incoming multi-source incidents have been audited and verified.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DATA SOURCE MONITOR                                                */}
      {/* ========================================================================= */}
      {activeTab === 'DATA_SOURCES' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'IMD Doppler & AWS', type: 'Official IMD API', status: 'ONLINE', latency: '14ms', records: '14,820 / hr', errors: '0.01%', health: 99.9 },
              { name: 'Social Media Streams', type: 'Twitter/X & Geotags', status: 'ONLINE', latency: '32ms', records: '48,200 / hr', errors: '0.24%', health: 98.4 },
              { name: 'Citizen Spotter Network', type: 'Mobile & Web App', status: 'ONLINE', latency: '24ms', records: '2,410 / hr', errors: '0.05%', health: 99.1 },
              { name: 'CWC River Gauges', type: 'Ministry of Jal Shakti', status: 'ONLINE', latency: '45ms', records: '1,200 / hr', errors: '0.00%', health: 99.8 },
              { name: 'Public Weather APIs', type: 'OpenMeteo & ECMWF', status: 'ONLINE', latency: '18ms', records: '6,000 / hr', errors: '0.00%', health: 100 },
              { name: 'Municipal IoT Sensors', type: 'GCC & Smart Cities', status: 'ONLINE', latency: '12ms', records: '8,900 / hr', errors: '0.08%', health: 99.5 },
            ].map((src, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-slate-950/85 border border-slate-800 space-y-3 font-mono text-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
                  <div>
                    <h4 className="font-bold text-white text-sm">{src.name}</h4>
                    <span className="text-[10.5px] text-slate-500">{src.type}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    ● {src.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Latency:</span>
                    <strong className="text-emerald-400 font-bold">{src.latency}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Records Processed:</span>
                    <strong className="text-white">{src.records}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Error Rate:</span>
                    <strong className="text-cyan-300">{src.errors}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Health Uptime:</span>
                    <strong className="text-purple-300">{src.health}%</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full mt-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-cyan-400" />
                  <span>Test Ingestion Ping</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: ANALYTICS                                                          */}
      {/* ========================================================================= */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
            {/* Category Breakdown */}
            <div className="p-6 rounded-3xl bg-slate-950/85 border border-slate-800 space-y-3">
              <h3 className="font-bold text-white text-sm uppercase">Events by Meteorological Category</h3>
              <div className="space-y-2 pt-2">
                {[
                  { cat: 'Severe Inundation & Floods', count: 12, pct: 50, color: 'bg-rose-500' },
                  { cat: 'Heavy Monsoon Rainfall', count: 6, pct: 25, color: 'bg-cyan-500' },
                  { cat: 'Convective Thunderstorms', count: 4, pct: 16, color: 'bg-purple-500' },
                  { cat: 'Thermal & Baseline', count: 2, pct: 9, color: 'bg-emerald-500' },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-300">{item.cat}</span>
                      <strong className="text-white">{item.count} ({item.pct}%)</strong>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* State Distribution */}
            <div className="p-6 rounded-3xl bg-slate-950/85 border border-slate-800 space-y-3">
              <h3 className="font-bold text-white text-sm uppercase">Incidents by State Jurisdiction</h3>
              <div className="space-y-2 pt-2">
                {[
                  { state: 'Tamil Nadu (Chennai focus)', count: 12, pct: 50 },
                  { state: 'Maharashtra (Mumbai coastal)', count: 4, pct: 16 },
                  { state: 'Karnataka (Bengaluru basin)', count: 3, pct: 12 },
                  { state: 'Assam (Brahmaputra basin)', count: 3, pct: 12 },
                  { state: 'Delhi-NCR & Others', count: 2, pct: 10 },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60">
                    <span className="text-slate-300">{s.state}</span>
                    <strong className="text-cyan-300 font-bold">{s.count} Events</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: NATIONAL MAP                                                       */}
      {/* ========================================================================= */}
      {activeTab === 'NATIONAL_MAP' && (
        <div className="p-6 rounded-3xl bg-slate-950/85 border border-cyan-500/25 space-y-4 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-sm uppercase">National Geospatial Command Scope</h3>
              <p className="text-slate-400 mt-0.5">Administrative tactical projection overlaying all radar and civic zones.</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-1 rounded bg-slate-900 text-slate-300">EVENTS ON</span>
              <span className="px-2 py-1 rounded bg-slate-900 text-slate-300">RADAR SWEEP ON</span>
              <span className="px-2 py-1 rounded bg-rose-950 text-rose-300 font-bold">THREAT OVERLAY</span>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-[#02050f] border border-slate-850 flex items-center justify-center text-center">
            <div className="space-y-2">
              <Globe className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
              <div className="text-sm font-bold text-white">Full Geospatial Projection Active</div>
              <p className="text-xs text-slate-400 max-w-sm">
                The main 3D Earth view on the Overview tab renders continuous 60fps telemetry across all 8 sub-national quadrants.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: SYSTEM MONITOR                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'SYSTEM_MONITOR' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            {[
              { service: 'API Gateway Proxy', status: 'HEALTHY', latency: '4ms', uptime: '100%' },
              { service: 'PostgreSQL Relational DB', status: 'HEALTHY', latency: '8ms', uptime: '99.99%' },
              { service: 'Big Data Ingestion Stream', status: 'HEALTHY', latency: '14ms', uptime: '99.98%' },
              { service: 'NLP ML Deduplication', status: 'HEALTHY', latency: '22ms', uptime: '99.95%' },
              { service: 'AI Verification Core', status: 'HEALTHY', latency: '35ms', uptime: '99.94%' },
              { service: 'Spatial Tile Map Server', status: 'HEALTHY', latency: '12ms', uptime: '100%' },
              { service: 'Emergency Dispatch Hub', status: 'HEALTHY', latency: '6ms', uptime: '100%' },
              { service: 'Audit Logging Engine', status: 'HEALTHY', latency: '2ms', uptime: '100%' },
            ].map((srv, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-950/85 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white">{srv.service}</h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Latency:</span>
                  <strong className="text-emerald-400">{srv.latency}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Uptime:</span>
                  <strong className="text-white">{srv.uptime}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: AUDIT LOG                                                          */}
      {/* ========================================================================= */}
      {activeTab === 'AUDIT_LOG' && (
        <div className="rounded-3xl bg-slate-950/85 border border-slate-800 overflow-hidden shadow-xl font-mono text-xs">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm uppercase">Immutable Security & Intelligence Audit Log</h3>
            <span className="text-slate-400">{auditLogs.length} LOGGED ENTRIES</span>
          </div>

          <div className="divide-y divide-slate-850">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 pl-5 pr-5 flex items-center justify-between gap-4 hover:bg-slate-900/40">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[9.5px] font-bold uppercase ${
                      log.type === 'VERIFY'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : log.type === 'ALERT'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-purple-950 text-purple-300 border border-purple-800'
                    }`}
                  >
                    {log.type}
                  </span>
                  <div>
                    <div className="text-white font-bold">{log.action}</div>
                    <div className="text-[10.5px] text-slate-500">OPERATOR: {log.user}</div>
                  </div>
                </div>
                <span className="text-slate-400 text-[11px] shrink-0">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 10: SETTINGS                                                          */}
      {/* ========================================================================= */}
      {activeTab === 'SETTINGS' && (
        <div className="p-6 rounded-3xl bg-slate-950/85 border border-purple-500/30 backdrop-blur-xl shadow-xl space-y-5 font-mono text-xs max-w-3xl">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white uppercase">Platform Administrative Thresholds</h3>
            <p className="text-slate-400 mt-0.5">Control algorithmic consensus standards and emergency dispatch rules.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 uppercase font-bold mb-1">
                Minimum Verification Confidence Threshold (%)
              </label>
              <input
                type="number"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
              />
              <span className="text-[10.5px] text-slate-500 mt-1 block">
                Incidents scoring below this score remain in PROVISIONAL state and require manual review.
              </span>
            </div>

            <div>
              <label className="block text-slate-300 uppercase font-bold mb-1">
                Auto-Verification Source Agreement (%)
              </label>
              <input
                type="number"
                value={autoVerifyAgreement}
                onChange={(e) => setAutoVerifyAgreement(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
              />
              <span className="text-[10.5px] text-slate-500 mt-1 block">
                Events with cross-channel agreement matching or exceeding this value are automatically promoted to VERIFIED.
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setSettingsSaved(true);
                setTimeout(() => setSettingsSaved(false), 2000);
              }}
              className="py-2.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase transition-colors"
            >
              {settingsSaved ? 'RULES SAVED' : 'SAVE THRESHOLDS'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
