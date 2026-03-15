'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/auth/AuthCard';
import { TextField } from '@/components/auth/TextField';
import { PrimaryButton } from '@/components/auth/PrimaryButton';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Weak', color: 'bg-red-500' });
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsSuccess(true);
      setIsLoading(false);
      setTimeout(() => router.push('/login'), 2000);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <AuthCard 
        title="Password updated" 
        subtitle="Your password has been reset successfully"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-pop-in">
            <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-[#64748b] font-medium mb-10 leading-relaxed">
            Redirecting you to the sign in page in a moment...
          </p>
          <div className="w-full h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 animate-[loading_2s_ease-in-out_forwards]" />
          </div>
        </div>
        <style jsx>{`
          @keyframes loading {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </AuthCard>
    );
  }

  return (
    <AuthCard 
      title="Reset password" 
      subtitle="Choose a new, strong password for your account"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-[20px] text-[15px] font-semibold text-red-600 bg-red-50 border border-red-100 animate-pop-in">
            {error}
          </div>
        )}

        <div>
          <TextField
            label="New Password"
            type="password"
            placeholder="••••••••"
            isPassword
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {password && (
            <div className="mt-4 px-1 animate-fade-in">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[13px] font-bold text-[#64748b]">Security Level</span>
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

        <TextField
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          isPassword
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <PrimaryButton type="submit" isLoading={isLoading}>
          Reset Password
        </PrimaryButton>
      </form>
    </AuthCard>
  );
}
