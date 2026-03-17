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
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden bg-[var(--bg-primary)]">
      
      {/* Animated Background Orbs - Cinematic Edition */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-float" style={{ background: 'var(--accent)' }}></div>
        <div className="absolute top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full mix-blend-screen filter blur-[100px] opacity-5 animate-float-delayed" style={{ background: '#7e22ce' }}></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[700px] h-[700px] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-float" style={{ background: 'var(--bg-secondary)' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-[500px] animate-pop-in shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)] rounded-[40px] bg-[var(--bg-secondary)]/40 backdrop-blur-3xl p-10 sm:p-14 border border-white/5">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[32px] mb-6 shadow-[0_0_40px_var(--accent-glow)] animate-slide-up" style={{ background: 'linear-gradient(135deg, var(--accent), #7e22ce)' }}>
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-5xl font-black text-white animate-slide-up delay-75 tracking-tighter">
            PulseChat
          </h1>
          <p className="text-[var(--text-secondary)] mt-3 font-bold text-[17px] animate-slide-up delay-150 opacity-80 uppercase tracking-widest">Premium Messaging</p>
        </div>

        <div className="animate-slide-up delay-300 w-full">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 rounded-2xl text-[14px] font-black text-red-400 border border-red-500/20 bg-red-500/5 backdrop-blur-md animate-shake">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[13px] font-black text-[var(--text-muted)] mb-3 pl-1 uppercase tracking-[0.2em] opacity-80">
                Email Address
              </label>
              <input
                id="login-email"
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full px-6 py-4.5 rounded-[22px] text-[16px] bg-[var(--bg-primary)] border border-white/5 text-white placeholder-[var(--text-muted)] focus:border-[var(--accent)]/50 focus:ring-4 focus:ring-[var(--accent)]/10 transition-all duration-300 font-medium"
                placeholder="Enter email address"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-black text-[var(--text-muted)] mb-3 pl-1 uppercase tracking-[0.2em] opacity-80">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4.5 rounded-[22px] text-[16px] bg-[var(--bg-primary)] border border-white/5 text-white placeholder-[var(--text-muted)] focus:border-[var(--accent)]/50 focus:ring-4 focus:ring-[var(--accent)]/10 transition-all duration-300 font-medium"
                placeholder="Enter password"
                required
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 mt-4 rounded-[22px] font-black text-white text-[18px] tracking-tight transition-all duration-300 hover:shadow-[0_12px_40px_var(--accent-glow)] hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
              style={{ background: 'var(--accent)' }}
            >
              {isSubmitting ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-[11px] font-black uppercase tracking-[0.3em]">
              <span className="px-5 text-[var(--text-muted)] bg-transparent">or</span>
            </div>
          </div>

          <button
            id="guest-login"
            onClick={handleGuest}
            disabled={isSubmitting}
            className="w-full py-4.5 rounded-[22px] font-black text-[15px] text-white/80 bg-white/5 border border-white/5 transition-all duration-300 hover:bg-white/10 hover:text-white active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest"
          >
            Continue as Guest
          </button>

          <p className="text-center text-[15px] font-bold text-[var(--text-muted)] mt-10">
            Don&apos;t have an account?{' '}
            <a href="/signup" className="text-[var(--accent)] hover:text-white transition-colors underline-offset-4 hover:underline">
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
