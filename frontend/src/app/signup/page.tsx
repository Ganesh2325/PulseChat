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
      router.push('/chat');
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-5xl font-black text-white animate-slide-up delay-75 tracking-tighter">
            Join Us
          </h1>
          <p className="text-[var(--text-secondary)] mt-3 font-bold text-[17px] animate-slide-up delay-150 opacity-80 uppercase tracking-widest">Create Account</p>
        </div>

        <div className="animate-slide-up delay-300 w-full">
          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="p-4 rounded-2xl text-[14px] font-black text-red-400 border border-red-500/20 bg-red-500/5 backdrop-blur-md animate-shake">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[13px] font-black text-[var(--text-muted)] mb-3 pl-1 uppercase tracking-[0.2em] opacity-80">Email Address</label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4.5 rounded-[22px] text-[16px] bg-[var(--bg-primary)] border border-white/5 text-white placeholder-[var(--text-muted)] focus:border-[var(--accent)]/50 focus:ring-4 focus:ring-[var(--accent)]/10 transition-all duration-300 font-medium"
                placeholder="Enter email address"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-black text-[var(--text-muted)] mb-3 pl-1 uppercase tracking-[0.2em] opacity-80">Username</label>
              <input
                id="signup-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-6 py-4.5 rounded-[22px] text-[16px] bg-[var(--bg-primary)] border border-white/5 text-white placeholder-[var(--text-muted)] focus:border-[var(--accent)]/50 focus:ring-4 focus:ring-[var(--accent)]/10 transition-all duration-300 font-medium"
                placeholder="Choose username"
                required
                minLength={3}
                maxLength={30}
              />
            </div>

            <div>
              <label className="block text-[13px] font-black text-[var(--text-muted)] mb-3 pl-1 uppercase tracking-[0.2em] opacity-80">Password</label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4.5 rounded-[22px] text-[16px] bg-[var(--bg-primary)] border border-white/5 text-white placeholder-[var(--text-muted)] focus:border-[var(--accent)]/50 focus:ring-4 focus:ring-[var(--accent)]/10 transition-all duration-300 font-medium"
                placeholder="Min 8 characters"
                required
                minLength={8}
              />
            </div>

            <button
              id="signup-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 mt-6 rounded-[22px] font-black text-white text-[18px] tracking-tight transition-all duration-300 hover:shadow-[0_12px_40px_var(--accent-glow)] hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
              style={{ background: 'var(--accent)' }}
            >
              {isSubmitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <p className="text-center text-[15px] font-bold text-[var(--text-muted)] mt-10">
            Already have an account?{' '}
            <a href="/login" className="text-[var(--accent)] hover:text-white transition-colors underline-offset-4 hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
