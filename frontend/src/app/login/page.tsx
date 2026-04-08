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
    <div className="auth-surface relative flex items-center justify-center min-h-screen p-4 overflow-hidden bg-[#F3EEFF]">
      
      {/* Animated Background Orbs - Cinematic Edition */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div
          className="absolute -top-[10%] -left-[10%] w-[560px] h-[560px] rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-float"
          style={{ background: 'linear-gradient(135deg, rgba(216,180,254,0.55), rgba(196,181,253,0.22))' }}
        />
        <div
          className="absolute top-[18%] -right-[10%] w-[520px] h-[520px] rounded-full mix-blend-multiply filter blur-[110px] opacity-35 animate-float-delayed"
          style={{ background: 'linear-gradient(135deg, rgba(196,181,253,0.55), rgba(167,139,250,0.22))' }}
        />
        <div
          className="absolute -bottom-[22%] left-[18%] w-[720px] h-[720px] rounded-full mix-blend-multiply filter blur-[150px] opacity-25 animate-float"
          style={{ background: 'linear-gradient(135deg, rgba(237,233,254,0.75), rgba(216,180,254,0.14))' }}
        />
      </div>

      <div className="relative z-10 flex w-full max-w-[520px] flex-col animate-pop-in rounded-[28px] bg-white px-6 pt-8 pb-7 shadow-[0_22px_60px_rgba(124,58,237,0.18)] border border-white/70">
        <div className="text-center">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-[22px] mb-3 shadow-[0_18px_40px_rgba(124,58,237,0.25)] animate-slide-up"
            style={{ background: 'linear-gradient(135deg, #C4B5FD, #A78BFA)' }}
          >
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-[#0F172A] animate-slide-up delay-75 tracking-tighter">
            PulseChat
          </h1>
          <p className="text-[#64748B] mt-1.5 font-semibold text-[14px] animate-slide-up delay-150 uppercase tracking-[0.18em]">
            Premium Messaging
          </p>
        </div>

        <div className="animate-slide-up delay-300 w-full mt-5">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-4 rounded-2xl text-[14px] font-black text-red-400 border border-red-500/20 bg-red-500/5 backdrop-blur-md animate-shake">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[13px] font-black text-[#64748B] mb-1.5 pl-1 uppercase tracking-[0.18em]">
                Email Address
              </label>
              <input
                id="login-email"
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full px-6 py-4 rounded-none text-[16px] bg-transparent border border-[#CBD5E1] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#A78BFA] focus:ring-4 focus:ring-[rgba(167,139,250,0.18)] transition-all duration-200 font-medium"
                placeholder="Enter email address"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-black text-[#64748B] mb-1.5 pl-1 uppercase tracking-[0.18em]">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 rounded-none text-[16px] bg-transparent border border-[#CBD5E1] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#A78BFA] focus:ring-4 focus:ring-[rgba(167,139,250,0.18)] transition-all duration-200 font-medium"
                placeholder="Enter password"
                required
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 mt-5 rounded-[22px] font-black text-white text-[18px] tracking-tight transition-all duration-300 hover:shadow-[0_12px_40px_var(--accent-glow)] hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #A78BFA, #7C3AED)' }}
            >
              {isSubmitting ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative my-6">
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
              className="w-full py-4 rounded-[22px] font-black text-[15px] text-[#0F172A]/70 bg-[#F1ECFF] border border-[#E9D5FF] transition-all duration-200 hover:bg-[#ECE5FF] hover:text-[#0F172A] active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest"
            >
              Continue as Guest
            </button>

            <p className="text-center text-[15px] font-bold text-[#64748B] mt-[14px]">
              Don&apos;t have an account?{' '}
              <a href="/signup" className="text-[#7C3AED] hover:text-[#5B21B6] transition-colors underline-offset-4 hover:underline">
                Create one
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
