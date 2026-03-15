import React from 'react';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
}

export function PrimaryButton({ isLoading, children, ...props }: PrimaryButtonProps) {
  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={`
        relative w-full py-4.5 rounded-[20px] font-bold text-white text-[17px] tracking-tight
        transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:scale-100
        flex items-center justify-center gap-2 overflow-hidden group
        bg-[#2563eb] hover:bg-[#1d4ed8] hover:shadow-[0_20px_40px_-12px_rgba(37,99,235,0.35)]
        hover:-translate-y-0.5
      `}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : (
        <>
          {children}
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </>
      )}
    </button>
  );
}
