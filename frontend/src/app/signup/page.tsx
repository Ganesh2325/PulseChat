'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuthStore();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await signup(email, username, password);
      router.push('/login');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (typeof msg === 'string' ? msg : 'Signup failed'));
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 animate-slide-up delay-75 tracking-tight">
            Create Account
          </h1>
          <p className="text-[var(--text-secondary)] mt-2 animate-slide-up delay-150">Join PulseChat today</p>
        </div>

        <div className="animate-slide-up delay-300 w-full mt-6">
          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg text-sm text-red-300 border border-red-500/30" style={{ background: 'rgba(239,68,68,0.1)' }}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-[16px] font-semibold text-slate-600 mb-3 pl-1">Email</label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl text-[16px] bg-[#f0f4f8] border border-transparent text-slate-900 placeholder-slate-400 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all duration-200"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-[16px] font-semibold text-slate-600 mb-3 pl-1">Username</label>
              <input
                id="signup-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl text-[16px] bg-[#f0f4f8] border border-transparent text-slate-900 placeholder-slate-400 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all duration-200"
                placeholder="Choose a username"
                required
                minLength={3}
                maxLength={30}
              />
            </div>

            <div>
              <label className="block text-[16px] font-semibold text-slate-600 mb-3 pl-1">Password</label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl text-[16px] bg-[#f0f4f8] border border-transparent text-slate-900 placeholder-slate-400 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all duration-200"
                placeholder="Min 8 characters"
                required
                minLength={8}
              />
            </div>

            <button
              id="signup-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 mt-8 rounded-2xl font-bold text-white text-[17px] transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 hover:shadow-blue-500/30 active:scale-[0.98] disabled:opacity-50"
              style={{ background: '#3b82f6' }}
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-[16px] font-medium text-slate-500 mt-8">
            Already have an account?{' '}
            <a href="/login" className="text-blue-500 hover:text-blue-600 transition-colors">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
