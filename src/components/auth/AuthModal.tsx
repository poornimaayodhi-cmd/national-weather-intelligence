import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  KeyRound,
  Shield,
  Layers,
} from 'lucide-react';
import { useAuth, UserRole } from '../../context/AuthContext.tsx';

type AuthViewMode = 'SIGN_IN' | 'SIGN_UP' | 'VERIFY_EMAIL' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'SIGN_IN' | 'SIGN_UP';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'SIGN_IN',
}) => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthViewMode>(initialMode);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');

  // Sign Up Form State
  const [fullName, setFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('Chennai, Tamil Nadu');

  // Verification & Reset State
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const email = signInEmail.trim() || (selectedRole === 'ADMIN' ? 'poornima@weather.gov.in' : 'rajesh.field@tn-disaster.gov.in');
      await signIn(email, selectedRole);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!fullName.trim() || !signUpEmail.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    if (password && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setMode('VERIFY_EMAIL');
  };

  const handleVerifyEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signUp({
        name: fullName,
        email: signUpEmail,
        phone: phone || '+91 98401 00000',
        preferredLocation,
        role: 'USER',
      });
      onClose();
    } catch (err: any) {
      setErrorMsg('Verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (role: UserRole) => {
    setIsSubmitting(true);
    if (role === 'ADMIN') {
      await signIn('poornima@weather.gov.in', 'ADMIN');
    } else {
      await signIn('rajesh.field@tn-disaster.gov.in', 'USER');
    }
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#030919] border border-cyan-500/30 shadow-2xl shadow-cyan-950/60 overflow-hidden">
        {/* Ambient Top Glow Line */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600" />

        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header Identity */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 border border-cyan-400/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase font-bold text-cyan-400 tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                SECURITY IDENTITY ACCESS
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                NATIONAL WEATHER INTELLIGENCE
              </h3>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ===================================================================== */}
          {/* SIGN IN VIEW                                                          */}
          {/* ===================================================================== */}
          {mode === 'SIGN_IN' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-xl font-bold text-white tracking-tight">WELCOME BACK</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Sign in to access national real-time weather analytics & AI verification.
                </p>
              </div>

              {/* Role Toggle Selector */}
              <div className="p-1 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center text-xs font-mono font-bold">
                <button
                  type="button"
                  onClick={() => setSelectedRole('ADMIN')}
                  className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                    selectedRole === 'ADMIN'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-purple-300" />
                  <span>ADMINISTRATOR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('USER')}
                  className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                    selectedRole === 'USER'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-cyan-200" />
                  <span>FIELD USER / CITIZEN</span>
                </button>
              </div>

              <form onSubmit={handleSignInSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 font-bold mb-1">
                    Email / Official Identifier
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder={selectedRole === 'ADMIN' ? 'poornima@weather.gov.in' : 'rajesh.field@tn-disaster.gov.in'}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 font-mono transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono uppercase text-slate-300 font-bold">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('FORGOT_PASSWORD')}
                      className="text-[10.5px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 font-mono transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isSubmitting ? 'AUTHENTICATING...' : 'SIGN IN'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* 1-Click Evaluation Demo Logins */}
              <div className="pt-3 border-t border-slate-850">
                <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider text-center mb-2">
                  ⚡ QUICK DEMO LOGIN (SIH EVALUATION)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('ADMIN')}
                    className="p-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/40 text-purple-200 text-[10.5px] font-mono font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Shield className="w-3 h-3 text-purple-400" />
                    <span>Login as Director (Admin)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('USER')}
                    className="p-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 text-cyan-200 text-[10.5px] font-mono font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <User className="w-3 h-3 text-cyan-400" />
                    <span>Login as Officer (User)</span>
                  </button>
                </div>
              </div>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => setMode('SIGN_UP')}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 underline font-mono"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* SIGN UP VIEW                                                          */}
          {/* ===================================================================== */}
          {mode === 'SIGN_UP' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-bold text-white tracking-tight">CREATE YOUR ACCOUNT</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Register for weather telemetry feeds and spatial alert streams.
                </p>
              </div>

              <form onSubmit={handleSignUpSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10.5px] font-mono uppercase text-slate-300 font-bold mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Dr. Rajesh Raman"
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-mono uppercase text-slate-300 font-bold mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="rajesh@tn-disaster.gov.in"
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10.5px] font-mono uppercase text-slate-300 font-bold mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98400 12345"
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-mono uppercase text-slate-300 font-bold mb-1">
                      Preferred Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={preferredLocation}
                        onChange={(e) => setPreferredLocation(e.target.value)}
                        placeholder="Chennai, Tamil Nadu"
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10.5px] font-mono uppercase text-slate-300 font-bold mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-mono uppercase text-slate-300 font-bold mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>CREATE ACCOUNT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">Already registered? </span>
                <button
                  type="button"
                  onClick={() => setMode('SIGN_IN')}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 underline font-mono"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* VERIFY EMAIL VIEW                                                     */}
          {/* ===================================================================== */}
          {mode === 'VERIFY_EMAIL' && (
            <div className="space-y-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 mx-auto flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-900/30">
                <Mail className="w-6 h-6 animate-pulse" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-white tracking-tight">VERIFY YOUR EMAIL</h4>
                <p className="text-xs text-slate-300 font-mono mt-1">
                  We sent a 6-digit confirmation token to:
                </p>
                <p className="text-xs font-mono font-bold text-cyan-300 mt-0.5">{signUpEmail}</p>
              </div>

              <form onSubmit={handleVerifyEmailSubmit} className="space-y-4">
                <div className="flex justify-center gap-2">
                  {verificationCode.map((digit, idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      value={digit || (idx === 0 ? '7' : idx === 1 ? '4' : idx === 2 ? '2' : idx === 3 ? '9' : idx === 4 ? '1' : '8')}
                      onChange={(e) => {
                        const val = e.target.value;
                        const copy = [...verificationCode];
                        copy[idx] = val;
                        setVerificationCode(copy);
                      }}
                      className="w-10 h-12 rounded-xl bg-slate-900 border border-cyan-500/40 text-center font-mono text-base font-bold text-white focus:outline-none focus:border-cyan-400"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'CONFIRMING...' : 'VERIFY & ACCESS PLATFORM'}</span>
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('SIGN_IN')}
                  className="text-xs font-mono text-slate-400 hover:text-white"
                >
                  ← Return to Sign In
                </button>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* FORGOT PASSWORD VIEW                                                  */}
          {/* ===================================================================== */}
          {mode === 'FORGOT_PASSWORD' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-xl font-bold text-white tracking-tight">PASSWORD RECOVERY</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Enter your registered institutional email to receive an instant recovery link.
                </p>
              </div>

              {resetSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>RESET INSTRUCTIONS DISPATCHED</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    A secure password reset link has been dispatched to <strong>{resetEmail}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setMode('SIGN_IN')}
                    className="mt-2 text-cyan-400 hover:text-cyan-300 underline font-bold"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setResetSuccess(true);
                  }}
                  className="space-y-3.5"
                >
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-300 font-bold mb-1">
                      Account Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="poornima@weather.gov.in"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>SEND RECOVERY INSTRUCTIONS</span>
                  </button>
                </form>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('SIGN_IN')}
                  className="text-xs font-mono text-slate-400 hover:text-white"
                >
                  ← Back to Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
