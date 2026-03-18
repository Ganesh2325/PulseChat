'use client';

import { useChatStore } from '@/stores/chatStore';

interface DiscoverySectionProps {
  onUserClick: (userId: string) => void;
}

export function DiscoverySection({ onUserClick }: DiscoverySectionProps) {
  const { discoverableUsers, fetchDiscoverableUsers } = useChatStore();

  if (discoverableUsers.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-[11px] text-[var(--text-muted)] italic mb-2 opacity-60">No new people found.</p>
        <button 
          onClick={() => fetchDiscoverableUsers()}
          className="text-[10px] text-[var(--accent)] font-bold uppercase tracking-wider hover:underline"
        >
          Refresh People
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {discoverableUsers.map((u) => (
        <div key={u.id} className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center text-sm font-black border border-white/5 group-hover:border-[var(--accent)] transition-colors">
              {u.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-[var(--text-primary)] truncate">{u.username}</div>
              <div className="text-[11px] text-green-400 font-medium">Available now</div>
            </div>
          </div>
          <button
            onClick={() => onUserClick(u.id)}
            className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-bold hover:shadow-[0_4px_12px_var(--accent-glow)] transition-all active:scale-95"
          >
            Chat
          </button>
        </div>
      ))}
    </div>
  );
}
