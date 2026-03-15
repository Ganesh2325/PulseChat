'use client';

import React, { useState } from 'react';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export function TextField({ label, error, isPassword, ...props }: TextFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full">
      <label className="block text-[15px] font-bold text-[#475569] mb-2.5 ml-1 tracking-tight">
        {label}
      </label>
      <div className="relative group">
        <input
          {...props}
          type={isPassword ? (showPassword ? 'text' : 'password') : props.type}
          className={`
            w-full px-6 py-4 rounded-[20px] text-[16px] font-medium transition-all duration-300
            bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] placeholder-[#94a3b8]
            focus:bg-white focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}
          `}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 top-1/2 -translate-y-1/2 p-2 text-[#94a3b8] hover:text-[#475569] transition-colors"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-2 ml-1 text-sm font-semibold text-red-500 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
}
