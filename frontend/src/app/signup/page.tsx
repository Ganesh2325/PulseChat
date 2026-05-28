'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';

export default function SignupPage() {
  const [isLogin, setIsLogin] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, signup, guestLogin } = useAuthStore();
  const router = useRouter();

  // Warm up the backend
  useEffect(() => {
    api.get('/health').catch(() => { });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login(email, password);
        router.push('/chat');
      } else {
        await signup(email, username, password);
        setIsLogin(true);
        setSuccess('Account created successfully! Please sign in.');
        setPassword('');
        setEmail('');
        setUsername('');
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number, data?: { message?: any } } };
      const status = error.response?.status;
      let msg = error.response?.data?.message;

      if (msg && typeof msg === 'object' && msg.message) {
        msg = msg.message;
      }

      if (Array.isArray(msg)) {
        setError(msg[0]);
      } else if (typeof msg === 'string') {
        setError(msg);
      } else if (!isLogin && status === 409) {
        setError('Email or username is already taken.');
      } else if (!error.response) {
        setError('Cannot reach the server. Please try again.');
      } else {
        setError(`${isLogin ? 'Login' : 'Signup'} failed. Please try again.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuest = async () => {
    setIsSubmitting(true);
    try {
      await guestLogin();
      router.push('/chat');
    } catch {
      setError('Guest login failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 overflow-hidden relative" style={{ backgroundColor: '#F8FAFC', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Premium ambient glowing backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-float pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-25 animate-float-delayed pointer-events-none" />

      {/* Main Container */}
      <div
        className="relative z-10 w-full max-w-[1000px] min-h-[600px] rounded-[30px] shadow-[0_20px_50px_rgba(139,92,246,0.06),0_0_40px_rgba(255,255,255,0.4)] overflow-hidden flex flex-col md:flex-row animate-slide-up bg-white/40 backdrop-blur-2xl border"
        style={{ borderColor: 'rgba(139, 92, 246, 0.15)' }}
      >
        
        {/* LEFT PANEL - BRANDING SECTION (Translucent violet glass backdrop) */}
        <div
          className={`w-full md:w-1/2 flex flex-col items-center justify-center p-12 text-center text-slate-800 relative overflow-hidden transition-all duration-700 ease-in-out border-b md:border-b-0 md:border-r ${
            isLogin ? 'md:order-first' : 'md:order-last'
          }`}
          style={{ 
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(196, 181, 253, 0.15))',
            borderColor: 'rgba(139, 92, 246, 0.12)'
          }}
        >
          {/* Subtle decoration elements */}
          <div className="absolute top-[-20%] left-[-20%] w-[320px] h-[320px] bg-white/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[250px] h-[250px] bg-violet-200/30 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center max-w-[340px]">
            {/* Logo */}
            <div className="w-16 h-16 bg-white rounded-2xl border border-violet-100 flex items-center justify-center mb-8 shadow-[0_12px_24px_rgba(139,92,246,0.12)] animate-pulse-slow">
              <svg className="w-8 h-8 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>

            <h1 className="text-3xl font-extrabold mb-4 tracking-tight text-slate-900 leading-tight">
              {isLogin ? 'Welcome to PulseChat' : 'Start Your Journey'}
            </h1>
            <p className="text-slate-600 text-base mb-8 leading-relaxed font-medium">
              {isLogin
                ? 'Experience real-time lightning-fast conversations in a minimal, frosted interface.'
                : 'Create an account to connect instantly with communities around the globe.'}
            </p>

            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
              className="px-6 py-2.5 rounded-xl font-bold border border-[#8B5CF6] text-[#8B5CF6] transition-all duration-300 hover:bg-[#8B5CF6]/10 hover:shadow-[0_8px_20px_rgba(139,92,246,0.1)] hover:scale-105 active:scale-95 text-sm cursor-pointer"
            >
              {isLogin ? 'Create Account' : 'Sign In Instead'}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL - FORM SECTION */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12">
          <div className="w-full max-w-[360px] m-auto text-center">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                {isLogin ? 'Sign In' : 'Sign Up'}
              </h2>
              <p className="text-slate-500 text-sm">
                {isLogin ? 'Enter your details below to access your account' : 'Provide your information to sign up'}
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl text-xs text-red-600 border border-red-200 bg-red-50/80 backdrop-blur-sm text-left font-semibold">
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div className="mb-5 p-3.5 rounded-xl text-xs text-emerald-600 border border-emerald-200 bg-emerald-50/80 backdrop-blur-sm text-left font-semibold">
                ✓ {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username field (Signup only) */}
              {(!isLogin) && (
                <div className="text-left">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Username</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full h-12 pl-11 pr-4 bg-white/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/15 transition-all shadow-sm"
                      placeholder="e.g. ganesh_pulse"
                      required={!isLogin}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div className="text-left">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  {isLogin ? 'Email or Username' : 'Email Address'}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 bg-white/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/15 transition-all shadow-sm"
                    placeholder={isLogin ? "username or email" : "you@example.com"}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="text-left">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 bg-white/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/15 transition-all shadow-sm"
                    placeholder="••••••••"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 mt-4 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(139,92,246,0.3)] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}
              >
                {isSubmitting
                  ? (isLogin ? 'Signing In...' : 'Registering...')
                  : (isLogin ? 'Sign In' : 'Sign Up')}
              </button>
            </form>

            <div className="mt-4">
              {isLogin && (
                <button
                  onClick={handleGuest}
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl font-bold text-[#8B5CF6] bg-violet-50 border border-violet-100 transition-all duration-300 hover:bg-violet-100 hover:border-violet-200 active:scale-[0.98] cursor-pointer"
                >
                  Continue as Guest
                </button>
              )}

              <p className="text-center text-xs text-slate-500 mt-6 font-semibold">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-[#8B5CF6] font-bold hover:text-[#7C3AED] hover:underline underline-offset-4 cursor-pointer"
                  type="button"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
        .animate-pulse-slow {
          animation: pulse-slow 5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.03); opacity: 0.95; }
        }
      `}} />
    </div>
  );
}
