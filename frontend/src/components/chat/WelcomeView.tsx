'use client';

export function WelcomeView() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-md" style={{ background: 'linear-gradient(135deg, var(--accent), #60a5fa)' }}>
        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">
        Welcome to PulseChat
      </h1>
      <p className="text-[var(--text-secondary)] max-w-md mb-8">
        Select a channel or start a direct message to begin chatting. Your messages are delivered in real-time.
      </p>
      <div className="grid grid-cols-3 gap-4 max-w-sm">
        <div className="p-4 rounded-xl text-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div className="text-2xl mb-1">⚡</div>
          <div className="text-xs text-[var(--text-muted)]">Real-time</div>
        </div>
        <div className="p-4 rounded-xl text-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div className="text-2xl mb-1">🔒</div>
          <div className="text-xs text-[var(--text-muted)]">Secure</div>
        </div>
        <div className="p-4 rounded-xl text-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div className="text-2xl mb-1">🤖</div>
          <div className="text-xs text-[var(--text-muted)]">AI-Enhanced</div>
        </div>
      </div>
    </div>
  );
}
