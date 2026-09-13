import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  User,
  Building,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthPage: React.FC = () => {
  const { signIn, signUp, forgotPassword, resetPassword, authLoading, authError } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('rk.barua@oilindia.in');
  const [signInPassword, setSignInPassword] = useState('OilIndia@2026');

  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpRole, setSignUpRole] = useState('HSE Field Inspector');
  const [signUpOrg, setSignUpOrg] = useState('Oil India Limited (Duliajan Field)');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'confirm'>('request');

  const handleQuickCredential = (email: string, pass: string) => {
    setSignInEmail(email);
    setSignInPassword(pass);
    setLocalError(null);
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await signIn(signInEmail, signInPassword);
    } catch (err: any) {
      setLocalError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    if (signUpPassword !== signUpConfirmPassword) {
      setLocalError('Passwords do not match. Please re-enter.');
      return;
    }

    if (signUpPassword.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp({
        name: signUpName,
        email: signUpEmail,
        password: signUpPassword,
        role: signUpRole,
        organization: signUpOrg
      });
    } catch (err: any) {
      setLocalError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const res = await forgotPassword(forgotEmail);
      setSuccessMessage(`Reset code generated: ${res.resetCode || '123456'}. Please enter it below along with your new password.`);
      if (res.resetCode) {
        setResetCode(res.resetCode);
      }
      setResetStep('confirm');
    } catch (err: any) {
      setLocalError(err.message || 'Could not find an account with that email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    if (newPassword.length < 6) {
      setLocalError('New password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword(forgotEmail, resetCode, newPassword);
      setSuccessMessage(res.message);
      setResetStep('request');
      setSignInEmail(forgotEmail);
      setSignInPassword(newPassword);
      setTimeout(() => {
        setMode('signin');
        setSuccessMessage('Password reset successfully! You may now sign in.');
      }, 1500);
    } catch (err: any) {
      setLocalError(err.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between text-slate-100 relative selection:bg-oil-500 selection:text-white overflow-y-auto">
      
      {/* Background Industrial Grid Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Top Corporate Strip */}
      <header className="relative z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-oil-600 flex items-center justify-center font-black text-xl text-white shadow-md border border-oil-500">
            OIL
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-white tracking-tight">OIL INDIA LIMITED</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded border border-slate-700">
                Govt. of India Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Corporate Health, Safety &amp; Environment Directorate</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-4 text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>OISD-145 / DGMS Safety Standards</span>
          </div>
        </div>
      </header>

      {/* Main Form Centerpiece */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-lg bg-slate-950/90 border border-slate-800/90 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden">
          
          {/* Card Title Header */}
          <div className="p-6 pb-5 border-b border-slate-800/80 text-center relative bg-gradient-to-b from-slate-900/80 to-slate-950/80">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-oil-600/20 text-oil-400 border border-oil-500/30 mb-3 shadow-inner">
              <Shield className="w-6 h-6 text-oil-400" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">
              Safety Intelligence Platform
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              SIF Precursor Radar, Barrier Degradation, and Field Risk Telemetry
            </p>

            {/* Mode Switcher Tabs */}
            <div className="flex mt-5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setMode('signin'); setLocalError(null); setSuccessMessage(null); }}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  mode === 'signin'
                    ? 'bg-oil-600 text-white shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setLocalError(null); setSuccessMessage(null); }}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-oil-600 text-white shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => { setMode('forgot'); setLocalError(null); setSuccessMessage(null); }}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  mode === 'forgot'
                    ? 'bg-oil-600 text-white shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Forgot Password
              </button>
            </div>
          </div>

          {/* Body Forms */}
          <div className="p-6 space-y-4">

            {/* Error Banner */}
            {(localError || authError) && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{localError || authError}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-start gap-2.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* ================= MODE 1: SIGN IN ================= */}
            {mode === 'signin' && (
              <form onSubmit={handleSignInSubmit} className="space-y-4 text-xs">
                
                {/* Seed Accounts Helper */}
                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Quick Sign-In Credentials:
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Click to fill</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickCredential('rk.barua@oilindia.in', 'OilIndia@2026')}
                      className="text-left p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-oil-500 transition-colors"
                    >
                      <div className="font-bold text-slate-200">R. K. Barua</div>
                      <div className="text-[10px] text-slate-400">Chief HSE Manager (HQ)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickCredential('evaluator@oilindia.in', 'OilIndia@2026')}
                      className="text-left p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-oil-500 transition-colors"
                    >
                      <div className="font-bold text-slate-200">SIH Evaluator</div>
                      <div className="text-[10px] text-slate-400">Lead Safety Assessor</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-1.5">
                    Official Work Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="e.g. rk.barua@oilindia.in"
                      className="w-full bg-slate-900 border border-slate-700/80 text-white rounded-xl pl-10 pr-3.5 py-2.5 text-xs outline-none focus:border-oil-500 focus:ring-1 focus:ring-oil-500 placeholder:text-slate-600 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                      Account Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-oil-400 hover:text-oil-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full bg-slate-900 border border-slate-700/80 text-white rounded-xl pl-10 pr-3.5 py-2.5 text-xs outline-none focus:border-oil-500 focus:ring-1 focus:ring-oil-500 placeholder:text-slate-600 font-medium"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || authLoading}
                    className="w-full py-3 bg-oil-600 hover:bg-oil-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] border border-oil-500"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Authenticating Session...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to Safety Intelligence</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ================= MODE 2: SIGN UP ================= */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUpSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                    Full Name &amp; Designation
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                    <input
                      type="text"
                      required
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      placeholder="e.g. Arun Phukan"
                      className="w-full bg-slate-900 border border-slate-700/80 text-white rounded-xl pl-10 pr-3.5 py-2 text-xs outline-none focus:border-oil-500 focus:ring-1 focus:ring-oil-500 placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                    Official Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                    <input
                      type="email"
                      required
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="e.g. arun.p@oilindia.in"
                      className="w-full bg-slate-900 border border-slate-700/80 text-white rounded-xl pl-10 pr-3.5 py-2 text-xs outline-none focus:border-oil-500 focus:ring-1 focus:ring-oil-500 placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      required
                      value={signUpRole}
                      onChange={(e) => setSignUpRole(e.target.value)}
                      placeholder="HSE Lead / Engineer"
                      className="w-full bg-slate-900 border border-slate-700/80 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-oil-500 focus:ring-1 focus:ring-oil-500 placeholder:text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                      Asset / Installation
                    </label>
                    <input
                      type="text"
                      required
                      value={signUpOrg}
                      onChange={(e) => setSignUpOrg(e.target.value)}
                      placeholder="e.g. Duliajan Field"
                      className="w-full bg-slate-900 border border-slate-700/80 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-oil-500 focus:ring-1 focus:ring-oil-500 placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                      Password (min 6 chars)
                    </label>
                    <input
                      type="password"
                      required
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900 border border-slate-700/80 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-oil-500 focus:ring-1 focus:ring-oil-500 placeholder:text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900 border border-slate-700/80 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-oil-500 focus:ring-1 focus:ring-oil-500 placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || authLoading}
                    className="w-full py-3 bg-oil-600 hover:bg-oil-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] border border-oil-500"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Registering Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Corporate Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ================= MODE 3: FORGOT PASSWORD ================= */}
            {mode === 'forgot' && (
              <div className="space-y-4 text-xs">
                {resetStep === 'request' ? (
                  <form onSubmit={handleForgotRequest} className="space-y-4">
                    <p className="text-slate-400 text-xs">
                      Enter your registered Oil India email address. We will generate a secure reset token to recover your account credentials.
                    </p>

                    <div>
                      <label className="block font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-1.5">
                        Registered Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="e.g. rk.barua@oilindia.in"
                          className="w-full bg-slate-900 border border-slate-700/80 text-white rounded-xl pl-10 pr-3.5 py-2.5 text-xs outline-none focus:border-oil-500 focus:ring-1 focus:ring-oil-500 placeholder:text-slate-600"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setMode('signin')}
                        className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-2/3 py-2.5 bg-oil-600 hover:bg-oil-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <span>Request Reset Code</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleResetSubmit} className="space-y-3.5">
                    <div>
                      <label className="block font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                        6-Digit Verification Code
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                        <input
                          type="text"
                          required
                          value={resetCode}
                          onChange={(e) => setResetCode(e.target.value)}
                          placeholder="Enter 6-digit code"
                          className="w-full bg-slate-900 border border-slate-700/80 text-white rounded-xl pl-10 pr-3.5 py-2 text-xs font-mono outline-none focus:border-oil-500 focus:ring-1 focus:ring-oil-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                        New Password (min 6 characters)
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-900 border border-slate-700/80 text-white rounded-xl pl-10 pr-3.5 py-2 text-xs outline-none focus:border-oil-500 focus:ring-1 focus:ring-oil-500"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setResetStep('request')}
                        className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-2/3 py-2.5 bg-oil-600 hover:bg-oil-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Updating Password...</span>
                          </>
                        ) : (
                          <>
                            <span>Set New Password</span>
                            <CheckCircle2 className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

          </div>

          {/* Footer Card Strip */}
          <div className="px-6 py-3 bg-slate-900/60 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Auth Gateway Active
            </span>
            <span className="font-mono text-[10px]">SHA-512 Salted PBKDF2</span>
          </div>

        </div>
      </main>

      {/* Bottom Footer Compliance */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 px-6 py-3 text-center text-xs text-slate-500">
        <p>© 2026 Oil India Limited. Protected Industrial Safety Intelligence Infrastructure. Unauthorized access prohibited.</p>
      </footer>

    </div>
  );
};
