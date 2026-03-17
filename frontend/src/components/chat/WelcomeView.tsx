'use client';

export function WelcomeView() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-[var(--bg-primary)] overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--accent-glow),transparent_70%)] opacity-20 pointer-events-none" />
      
      <div className="w-28 h-28 rounded-[40px] flex items-center justify-center mb-10 shadow-[0_0_40px_var(--accent-glow)] relative z-10" style={{ background: 'linear-gradient(135deg, var(--accent), #7e22ce)' }}>
        <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>

      <h1 className="text-4xl font-black text-white mb-4 tracking-tighter relative z-10">
        Welcome to <span className="text-[var(--accent)]">PulseChat</span>
      </h1>
      
      <p className="text-[var(--text-secondary)] max-w-lg mb-12 font-bold text-[17px] leading-relaxed opacity-80 relative z-10">
        Experience real-time communication in a premium, cinematic environment designed for professional scale.
      </p>

      <div className="grid grid-cols-3 gap-6 max-w-lg relative z-10">
        {[
          { icon: '⚡', label: 'Real-time', desc: 'Instant precision' },
          { icon: '🔒', label: 'Secure', desc: 'Enterprise grade' },
          { icon: '🎨', label: 'Premium', desc: 'Cinematic UI' }
        ].map((item, i) => (
          <div key={i} className="p-5 rounded-3xl text-center bg-[var(--bg-secondary)] border border-white/5 shadow-xl transition-transform hover:-translate-y-2 group">
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
            <div className="text-[13px] font-black text-white mb-1 uppercase tracking-tighter">{item.label}</div>
            <div className="text-[10px] text-[var(--text-muted)] font-bold uppercase opacity-60 tracking-widest">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
