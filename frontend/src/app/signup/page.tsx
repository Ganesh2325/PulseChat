'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuthStore();
  const router = useRouter();

  // Warm up the backend as soon as the user arrives
  useEffect(() => {
    api.get('/health').catch(() => {});
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await signup(email, username, password);
      router.push('/login');
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) {
        setError(msg[0]);
      } else if (typeof msg === 'string') {
        setError(msg);
      } else if (status === 409) {
        setError('Email or username is already taken.');
      } else if (!err.response) {
        setError('Cannot reach the server. It may be starting up — please wait a moment and try again.');
      } else {
        setError('Signup failed. Please check your details and try again.');
      }
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-[#0F172A] animate-slide-up delay-75 tracking-tighter">
            Join Us
          </h1>
          <p className="text-[#64748B] mt-1.5 font-semibold text-[14px] animate-slide-up delay-150 uppercase tracking-[0.18em]">
            Create Account
          </p>
        </div>

        <div className="animate-slide-up delay-300 w-full mt-5">
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="p-4 rounded-2xl text-[14px] font-black text-red-400 border border-red-500/20 bg-red-500/5 backdrop-blur-md animate-shake">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[13px] font-black text-[#64748B] mb-1.5 pl-1 uppercase tracking-[0.18em]">Email Address</label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 rounded-none text-[16px] bg-transparent border border-[#CBD5E1] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#A78BFA] focus:ring-4 focus:ring-[rgba(167,139,250,0.18)] transition-all duration-200 font-medium"
                placeholder="Enter email address"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-black text-[#64748B] mb-1.5 pl-1 uppercase tracking-[0.18em]">Username</label>
              <input
                id="signup-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-6 py-4 rounded-none text-[16px] bg-transparent border border-[#CBD5E1] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#A78BFA] focus:ring-4 focus:ring-[rgba(167,139,250,0.18)] transition-all duration-200 font-medium"
                placeholder="Choose username"
                required
                minLength={3}
                maxLength={30}
              />
            </div>

            <div>
              <label className="block text-[13px] font-black text-[#64748B] mb-1.5 pl-1 uppercase tracking-[0.18em]">Password</label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 rounded-none text-[16px] bg-transparent border border-[#CBD5E1] text-[#0F172A] placeholder-[#94A3B8] focus:border-[#A78BFA] focus:ring-4 focus:ring-[rgba(167,139,250,0.18)] transition-all duration-200 font-medium"
                placeholder="Min 8 characters"
                required
                minLength={8}
              />
            </div>

            <button
              id="signup-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 mt-5 rounded-[22px] font-black text-white text-[18px] tracking-tight transition-all duration-300 hover:shadow-[0_12px_40px_var(--accent-glow)] hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #A78BFA, #7C3AED)' }}
            >
              {isSubmitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className="mt-3">
            <p className="text-center text-[15px] font-bold text-[#64748B] mt-[14px]">
              Already have an account?{' '}
              <a href="/login" className="text-[#7C3AED] hover:text-[#5B21B6] transition-colors underline-offset-4 hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
