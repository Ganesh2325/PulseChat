import React from 'react';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden auth-bg-gradient">
      {/* Animated Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[15%] -left-[10%] w-[600px] h-[600px] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-orb" style={{ background: '#3b82f6' }}></div>
        <div className="absolute top-[20%] -right-[15%] w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-orb" style={{ background: '#a855f7', animationDelay: '-5s' }}></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[700px] h-[700px] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-orb" style={{ background: '#60a5fa', animationDelay: '-10s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-[480px] animate-pop-in-large auth-card p-10 sm:p-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[32px] mb-6 shadow-xl animate-slide-up" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[#64748b] text-base sm:text-lg font-medium tracking-tight">
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
