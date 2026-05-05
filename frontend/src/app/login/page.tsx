'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

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
        await login(email, password); // Note: email field acts as emailOrUsername for login
        router.push('/chat');
      } else {
        await signup(email, username, password);
        // Automatically switch to login upon successful signup, or auto-login. The previous logic went to /login.
        setIsLogin(true);
        setSuccess('Account created successfully! Please sign in.');
        // Optionally clear password
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
    <div className="flex items-center justify-center min-h-screen p-4 overflow-hidden" style={{ backgroundColor: '#0B1120', fontFamily: '"Inter", sans-serif' }}>

      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#8B5CF6] rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#7C3AED] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-float delay-1000" />

      {/* Main Container */}
      <div
        className="relative z-10 w-full max-w-[1000px] h-[600px] rounded-[20px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),0_0_40px_rgba(139,92,246,0.15)] overflow-hidden flex animate-slide-up bg-[#111827] border"
        style={{ borderColor: 'rgba(139, 92, 246, 0.2)' }}
      >

        {/* RIGHT PANEL - FORM SECTION (Rendered first in DOM, physically right or left depending on toggle) */}
        <div
          className={`absolute top-0 w-1/2 h-full transition-all duration-700 ease-in-out flex items-center justify-center p-[48px] ${isLogin ? 'right-0 translate-x-0' : 'right-0 -translate-x-full'
            }`}
        >
          <div className="w-full max-w-[360px] m-auto text-center">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-[#E5E7EB] mb-2">
                {isLogin ? 'Sign In' : 'Create Account'}
              </h2>
              <p className="text-[#9CA3AF]">
                {isLogin ? 'Welcome back! Please enter your details.' : 'Join PulseChat and connect instantly.'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-lg text-sm text-red-400 border border-red-500/20 bg-red-500/10">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 p-3 rounded-lg text-sm text-emerald-400 border border-emerald-500/20 bg-emerald-500/10">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-[18px]">
              {/* Username field (Signup only) */}
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isLogin ? 'max-h-0 opacity-0' : 'max-h-[70px] opacity-100'}`}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-[14px] flex items-center pointer-events-none text-[#9CA3AF]"> </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-[52px] pl-[44px] pr-[16px] py-[14px] bg-[#1F2937] border border-transparent rounded-[12px] text-[#E5E7EB] text-left placeholder-[#9CA3AF] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all duration-300 shadow-sm"
                    placeholder="Username"
                    required={!isLogin}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Email field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-[14px] flex items-center pointer-events-none text-[#9CA3AF]">
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[52px] pl-[44px] pr-[16px] py-[14px] bg-[#1F2937] border border-transparent rounded-[12px] text-[#E5E7EB] text-left placeholder-[#9CA3AF] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all duration-300 shadow-sm"
                  placeholder={isLogin ? 'Email or Username' : 'Email address'}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Password field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-[14px] flex items-center pointer-events-none text-[#9CA3AF]">
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[52px] pl-[44px] pr-[16px] py-[14px] bg-[#1F2937] border border-transparent rounded-[12px] text-[#E5E7EB] text-left placeholder-[#9CA3AF] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all duration-300 shadow-sm"
                  placeholder="Password"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[52px] mt-[26px] rounded-[12px] font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}
              >
                {isSubmitting
                  ? (isLogin ? 'Signing In...' : 'Creating Account...')
                  : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div className="mt-4">
              {isLogin && (
                <button
                  onClick={handleGuest}
                  disabled={isSubmitting}
                  className="w-full h-[52px] mb-4 rounded-[12px] font-medium text-[#E5E7EB] bg-[#1F2937] border border-[rgba(139,92,246,0.3)] transition-all duration-300 hover:bg-[#374151] hover:border-[#8B5CF6] active:scale-[0.98]"
                >
                  Continue as Guest
                </button>
              )}

              <p className="text-center text-sm text-[#9CA3AF] mt-4">
                {isLogin ? "New user don't have an account ? " : 'Already have an account? '}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-[#8B5CF6] font-medium hover:text-[#A78BFA] transition-colors hover:underline underline-offset-4"
                  type="button"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* LEFT PANEL - BRANDING SECTION (Sliding overlay) */}
        <div
          className={`absolute top-0 w-1/2 h-full z-20 transition-all duration-700 ease-in-out flex flex-col items-center justify-center p-12 text-center text-white overflow-hidden ${isLogin ? 'left-0' : 'left-1/2'
            }`}
          style={{ background: 'linear-gradient(135deg, #7C3AED, #4C1D95)' }}
        >
          {/* Decorative shapes */}
          <div className="absolute top-[-10%] left-[-20%] w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-20%] w-[300px] h-[300px] bg-black/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Logo */}
            <div className="w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 flex items-center justify-center mb-6 shadow-xl animate-pulse-slow">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>

            <div className="transition-all duration-500 transform">
              <h1 className="text-4xl font-bold mb-4 tracking-tight">
                {isLogin ? 'Welcome Back' : 'Hello, Friend'}
              </h1>
              <p className="text-white/80 text-lg mb-8 leading-relaxed max-w-[250px]">
                {isLogin
                  ? 'Connect instantly with your network on PulseChat.'
                  : 'Enter your details and start your journey with us.'}
              </p>
            </div>

            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
              className="px-8 py-3 rounded-md font-semibold border border-white/40 text-white transition-all duration-300 hover:bg-white/10 hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>

      {/* Additional inline styles for specific focus glow if tailwind variants aren't enough */}
      <style dangerouslySetInnerHTML={{
        __html: `
        input:focus {
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.6) !important;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}} />
    </div>
  );
}
