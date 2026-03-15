'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { AuthCard } from '@/components/auth/AuthCard';
import { TextField } from '@/components/auth/TextField';
import { PrimaryButton } from '@/components/auth/PrimaryButton';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Weak', color: 'bg-red-500' });
  const { signup } = useAuthStore();
  const router = useRouter();

  // Warm up the backend as soon as the user arrives
  useEffect(() => {
    api.get('/health').catch(() => {});
  }, []);

  useEffect(() => {
    // Basic password strength logic
    let score = 0;
    if (password.length > 5) score++;
    if (password.length > 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
      { label: 'Very Weak', color: 'bg-red-400' },
      { label: 'Weak', color: 'bg-red-500' },
      { label: 'Fair', color: 'bg-orange-500' },
      { label: 'Good', color: 'bg-blue-500' },
      { label: 'Strong', color: 'bg-emerald-500' },
      { label: 'Very Strong', color: 'bg-emerald-600' },
    ];
    setPasswordStrength({ score: Math.min(score, 5), ...levels[Math.min(score, 5)] });
  }, [password]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await signup(email, username, password);
      router.push('/chat');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (typeof msg === 'string' ? msg : 'Signup failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard 
      title="Create account" 
      subtitle="Join PulseChat and start messaging today"
    >
      <form onSubmit={handleSignup} className="space-y-6">
        {error && (
          <div className="p-4 rounded-[20px] text-[15px] font-semibold text-red-600 bg-red-50 border border-red-100 flex items-center gap-3 animate-pop-in">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <TextField
          label="Email address"
          type="email"
          placeholder="ganesh@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <TextField
          label="Username"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <div>
          <TextField
            label="Password"
            type="password"
            placeholder="Create a strong password"
            isPassword
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {password && (
            <div className="mt-4 px-1 animate-fade-in">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[13px] font-bold text-[#64748b]">Password Strength</span>
                <span className={`text-[13px] font-black uppercase tracking-wider ${passwordStrength.color.replace('bg-', 'text-')}`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#f1f5f9] rounded-full overflow-hidden">
                <div 
                  className={`h-full ${passwordStrength.color} transition-all duration-500`} 
                  style={{ width: `${(passwordStrength.score + 1) * 16.66}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-1">
          <p className="text-[13px] leading-relaxed text-[#94a3b8] font-medium">
            By clicking "Create Account", you agree to our{' '}
            <a href="#" className="text-[#2563eb] font-bold hover:underline">Terms of Service</a> and{' '}
            <a href="#" className="text-[#2563eb] font-bold hover:underline">Privacy Policy</a>.
          </p>
        </div>

        <PrimaryButton type="submit" isLoading={isSubmitting}>
          Create Account
        </PrimaryButton>
      </form>

      <p className="text-center text-[15px] font-semibold text-[#64748b] mt-10">
        Already have an account?{' '}
        <a href="/login" className="text-[#2563eb] hover:text-[#1d4ed8] font-bold transition-colors">
          Sign In
        </a>
      </p>
    </AuthCard>
  );
}
