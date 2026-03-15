'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, guestLogin } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(emailOrUsername, password);
      router.push('/chat');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (typeof msg === 'string' ? msg : 'Login failed'));
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 50%, #e0e7ff 100%)' }}>
      
      {/* Animated Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ background: '#3b82f6' }}></div>
        <div className="absolute top-[20%] -right-[10%] w-[400px] h-[400px] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float-delayed" style={{ background: '#a855f7' }}></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[600px] h-[600px] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ background: '#60a5fa' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-[540px] animate-fade-in shadow-2xl rounded-[32px] bg-white/95 backdrop-blur-xl p-10 sm:p-12 border border-white/50">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[28px] mb-4 shadow-sm animate-slide-up" style={{ background: '#3b82f6' }}>
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 animate-slide-up delay-75 tracking-tight">
            PulseChat
          </h1>
          <p className="text-[var(--text-secondary)] mt-2 animate-slide-up delay-150">Real-time messaging, reimagined</p>
        </div>

        <div className="animate-slide-up delay-300 w-full mt-6">
          <form onSubmit={handleLogin} className="space-y-7">
            {error && (
              <div className="p-3 rounded-lg text-sm text-red-300 border border-red-500/30" style={{ background: 'rgba(239,68,68,0.1)' }}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-[16px] font-semibold text-slate-600 mb-3 pl-1">
                Email address
              </label>
              <input
                id="login-email"
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl text-[16px] bg-[#f0f4f8] border border-transparent text-slate-900 placeholder-slate-400 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all duration-200"
                placeholder="Enter email address"
                required
              />
            </div>

            <div>
              <label className="block text-[16px] font-semibold text-slate-600 mb-3 pl-1">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl text-[16px] bg-[#f0f4f8] border border-transparent text-slate-900 placeholder-slate-400 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all duration-200"
                placeholder="Enter password"
                required
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 mt-6 rounded-2xl font-bold text-white text-[17px] transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 hover:shadow-blue-500/30 active:scale-[0.98] disabled:opacity-50"
              style={{ background: '#3b82f6' }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[13px] font-medium">
              <span className="px-4 text-slate-400 bg-white">or</span>
            </div>
          </div>

          <button
            id="guest-login"
            onClick={handleGuest}
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl font-semibold text-[16px] text-slate-600 bg-[#f0f4f8] transition-all duration-200 hover:bg-[#e2e8f0] active:scale-[0.98] disabled:opacity-50"
          >
            🎭 Continue as Guest
          </button>

          <p className="text-center text-[15px] font-medium text-slate-500 mt-6">
            Don&apos;t have an account?{' '}
            <a href="/signup" className="text-blue-500 hover:text-blue-600 transition-colors">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
