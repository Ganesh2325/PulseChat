'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { AuthCard } from '@/components/auth/AuthCard';
import { TextField } from '@/components/auth/TextField';
import { PrimaryButton } from '@/components/auth/PrimaryButton';

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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
    <AuthCard 
      title="Welcome back" 
      subtitle="Enter your credentials to access your account"
    >
      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <div className="p-4 rounded-[20px] text-[15px] font-semibold text-red-600 bg-red-50 border border-red-100 flex items-center gap-3 animate-pop-in">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <TextField
          label="Email or Username"
          placeholder="e.g. ganesh@example.com"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          required
        />

        <TextField
          label="Password"
          placeholder="••••••••"
          type="password"
          isPassword
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex items-center justify-between px-1">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-5 h-5 border-2 border-[#e2e8f0] rounded-md transition-all peer-checked:bg-[#2563eb] peer-checked:border-[#2563eb]" />
              <svg className="absolute inset-0 w-5 h-5 text-white opacity-0 transition-opacity peer-checked:opacity-100 p-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-[14px] font-bold text-[#64748b] group-hover:text-[#475569] transition-colors">Remember me</span>
          </label>
          <a href="/forgot-password" className="text-[14px] font-bold text-[#2563eb] hover:text-[#1d4ed8] transition-colors">
            Forgot password?
          </a>
        </div>

        <PrimaryButton type="submit" isLoading={isSubmitting}>
          Sign in
        </PrimaryButton>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#e2e8f0]" />
        </div>
        <div className="relative flex justify-center text-[13px] font-bold uppercase tracking-wider">
          <span className="px-5 text-[#94a3b8] bg-white">or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button className="flex items-center justify-center gap-3 py-3.5 px-4 rounded-[20px] border border-[#e2e8f0] hover:bg-[#f8fafc] hover:border-[#cbd5e1] transition-all duration-200 group">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          <span className="text-[15px] font-bold text-[#475569] group-hover:text-[#1e293b]">Google</span>
        </button>
        <button className="flex items-center justify-center gap-3 py-3.5 px-4 rounded-[20px] border border-[#e2e8f0] hover:bg-[#f8fafc] hover:border-[#cbd5e1] transition-all duration-200 group">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.96.95-2.06 1.18-3.12.73-1.01-.43-1.94-.49-2.98 0-1.2.54-2.1.33-3.12-.73-3.86-3.88-3.18-10.33 1.17-10.33 1.12.01 1.93.59 2.58.59.62 0 1.62-.68 2.92-.56 1.43.14 2.52.88 3.1 1.93-2.61 1.4-2.18 4.79.52 6.03-.53 1.34-1.2 2.65-2.07 3.34zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.21 2.22-1.91 4.2-3.74 4.25z" />
          </svg>
          <span className="text-[15px] font-bold text-[#475569] group-hover:text-[#1e293b]">Apple</span>
        </button>
      </div>

      <button
        onClick={handleGuest}
        className="w-full mt-6 py-4 rounded-[20px] font-bold text-[16px] text-[#475569] bg-[#f1f5f9] hover:bg-[#e2e8f0] transition-all duration-200"
      >
        🎭 Continue as Guest
      </button>

      <p className="text-center text-[15px] font-semibold text-[#64748b] mt-8">
        Don&apos;t have an account?{' '}
        <a href="/signup" className="text-[#2563eb] hover:text-[#1d4ed8] font-bold transition-colors">
          Join PulseChat
        </a>
      </p>
    </AuthCard>
  );
}
