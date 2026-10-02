import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Clock,
  Edit2,
  Lock,
  CheckCircle2,
  LogOut,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useAuth, UserRole } from '../../context/AuthContext.tsx';

interface UserProfileViewProps {
  onNavigateToSettings: () => void;
  onNavigateToAlerts: () => void;
  onSignOut: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  onNavigateToSettings,
  onNavigateToAlerts,
  onSignOut,
}) => {
  const { currentUser, updateProfile, switchRole } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [location, setLocation] = useState(currentUser?.preferredLocation || '');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      phone,
      preferredLocation: location,
    });
    setIsEditing(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccess(true);
    setTimeout(() => {
      setPassSuccess(false);
      setIsChangingPass(false);
    }, 2000);
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase font-bold text-cyan-400 tracking-widest mb-1">
            <User className="w-4 h-4 text-cyan-400" />
            <span>AUTHENTICATED USER IDENTITY</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Institutional User Profile
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Credentials, operational jurisdiction, and role-based permissions.
          </p>
        </div>

        {/* Demo Switch Role Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => switchRole(currentUser.role === 'ADMIN' ? 'USER' : 'ADMIN')}
            className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Toggle between Administrator and Standard Field User role"
          >
            <RotateCcw className="w-3.5 h-3.5 text-purple-300" />
            <span>Switch Role to {currentUser.role === 'ADMIN' ? 'USER' : 'ADMIN'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Avatar & ID Card (4 Cols) */}
        <div className="md:col-span-4 p-6 rounded-3xl bg-slate-950/85 border border-cyan-500/25 backdrop-blur-xl shadow-xl flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-cyan-950/50 border-2 border-cyan-400/50">
              {currentUser.name.charAt(0)}
            </div>
            <div
              className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider text-white border ${
                currentUser.role === 'ADMIN'
                  ? 'bg-purple-600 border-purple-400'
                  : 'bg-cyan-600 border-cyan-400'
              }`}
            >
              {currentUser.role}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-white">{currentUser.name}</h3>
            <p className="text-xs font-mono text-cyan-300 mt-0.5">{currentUser.email}</p>
            <p className="text-[11px] font-mono text-slate-400 mt-1">{currentUser.preferredLocation}</p>
          </div>

          <div className="w-full pt-3 border-t border-slate-850 space-y-2 text-xs font-mono text-left">
            <div className="flex justify-between">
              <span className="text-slate-400">USER ID:</span>
              <span className="text-slate-200 font-bold">{currentUser.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ACCESS ROLE:</span>
              <span
                className={`font-bold ${
                  currentUser.role === 'ADMIN' ? 'text-purple-400' : 'text-cyan-400'
                }`}
              >
                {currentUser.role}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">STATUS:</span>
              <span className="text-emerald-400 font-bold">● {currentUser.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">JOINED:</span>
              <span className="text-slate-200">
                {new Date(currentUser.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onSignOut}
            className="w-full py-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 text-xs font-mono font-bold uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Right Column: Editable Information & Security (8 Cols) */}
        <div className="md:col-span-8 space-y-4">
          {/* Profile Details Card */}
          <div className="p-6 rounded-3xl bg-slate-950/85 border border-cyan-500/25 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                PERSONAL & REGIONAL INFORMATION
              </h3>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-mono text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs font-mono">
                <div>
                  <label className="block text-slate-400 uppercase font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 uppercase font-bold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 uppercase font-bold mb-1">
                    Preferred Location / Station
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold uppercase transition-colors"
                >
                  Save Profile Updates
                </button>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-850">
                  <span className="text-slate-400 text-[10.5px]">OFFICIAL NAME</span>
                  <div className="font-bold text-white text-sm mt-0.5">{currentUser.name}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-850">
                  <span className="text-slate-400 text-[10.5px]">REGISTERED EMAIL</span>
                  <div className="font-bold text-cyan-300 text-sm mt-0.5">{currentUser.email}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-850">
                  <span className="text-slate-400 text-[10.5px]">DIRECT TELEPHONE</span>
                  <div className="font-bold text-white text-sm mt-0.5">{currentUser.phone}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-850">
                  <span className="text-slate-400 text-[10.5px]">DEFAULT JURISDICTION</span>
                  <div className="font-bold text-white text-sm mt-0.5">{currentUser.preferredLocation}</div>
                </div>
              </div>
            )}
          </div>

          {/* Security & Password Card */}
          <div className="p-6 rounded-3xl bg-slate-950/85 border border-cyan-500/25 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>SECURITY & PASSWORD CREDENTIALS</span>
              </h3>
              {!isChangingPass ? (
                <button
                  type="button"
                  onClick={() => setIsChangingPass(true)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800 text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
                >
                  Change Password
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsChangingPass(false)}
                  className="text-xs font-mono text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              )}
            </div>

            {isChangingPass ? (
              <form onSubmit={handleChangePassword} className="space-y-3 text-xs font-mono">
                <div>
                  <label className="block text-slate-400 uppercase font-bold mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 uppercase font-bold mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 uppercase font-bold mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1.5"
                >
                  {passSuccess ? <CheckCircle2 className="w-4 h-4" /> : null}
                  <span>{passSuccess ? 'PASSWORD UPDATED' : 'CONFIRM PASSWORD CHANGE'}</span>
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Password last changed 14 days ago. Two-Factor Authentication (2FA) active.</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>SECURE</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
