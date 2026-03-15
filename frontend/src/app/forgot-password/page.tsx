'use client';

import { useState } from 'react';
import { AuthCard } from '@/components/auth/AuthCard';
import { TextField } from '@/components/auth/TextField';
import { PrimaryButton } from '@/components/auth/PrimaryButton';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <AuthCard 
        title="Check your email" 
        subtitle={`We've sent a password reset link to ${email}`}
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-pop-in">
            <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-[#64748b] font-medium mb-8 leading-relaxed px-4">
            Didn't receive the email? Check your spam folder or try another email address.
          </p>
          <PrimaryButton onClick={() => setIsSubmitted(false)}>
            Try again
          </PrimaryButton>
          <a href="/login" className="block mt-8 text-[15px] font-bold text-[#2563eb] hover:text-[#1d4ed8] transition-colors">
            Back to Sign In
          </a>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard 
      title="Forgot password?" 
      subtitle="No worries, we'll send you reset instructions"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <TextField
          label="Email address"
          type="email"
          placeholder="ganesh@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <PrimaryButton type="submit" isLoading={isLoading}>
          Send Reset Link
        </PrimaryButton>
      </form>

      <p className="text-center text-[15px] font-semibold text-[#64748b] mt-10">
        Remembered your password?{' '}
        <a href="/login" className="text-[#2563eb] hover:text-[#1d4ed8] font-bold transition-colors">
          Sign In
        </a>
      </p>
    </AuthCard>
  );
}
