'use client';

export function WelcomeView() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 md:p-12 overflow-hidden relative" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Soft violet glowing light source */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.06),transparent_65%)] opacity-80 pointer-events-none" />
      
      <div className="w-24 h-24 rounded-[32px] flex items-center justify-center mb-8 shadow-[0_12px_36px_rgba(139,92,246,0.25)] relative z-10 bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] animate-pulse-slow">
        <svg className="w-11 h-11 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight relative z-10 leading-none">
        Welcome to <span className="bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] bg-clip-text text-transparent">PulseChat</span>
      </h1>
      
      <p className="text-slate-600 max-w-md mb-10 font-medium text-sm md:text-base leading-relaxed opacity-90 relative z-10">
        Experience real-time communication in a premium, lightweight environment designed for modern teams.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-lg relative z-10">
        {[
          { icon: '⚡', label: 'Real-time', desc: 'Instant precision' },
          { icon: '🔒', label: 'Secure', desc: 'Enterprise grade' },
          { icon: '🎨', label: 'Premium', desc: 'Glassmorphic UI' }
        ].map((item, i) => (
          <div 
            key={i} 
            className="p-5 rounded-2xl text-center bg-white/50 backdrop-blur-md border border-[var(--border)] shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-[#8B5CF6]/20 group"
          >
            <div className="text-2.5xl mb-2.5 group-hover:scale-110 transition-transform">{item.icon}</div>
            <div className="text-xs font-black text-slate-800 mb-1 uppercase tracking-wider">{item.label}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
