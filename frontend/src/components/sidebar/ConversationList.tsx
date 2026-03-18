'use client';

import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { usePresenceStore } from '@/stores/presenceStore';

interface ConversationListProps {
  onConversationClick: (conversation: any) => void;
  currentConversationId?: string;
}

export function ConversationList({ onConversationClick, currentConversationId }: ConversationListProps) {
  const { user } = useAuthStore();
  const { conversations, deleteConversation } = useChatStore();
  const { onlineUsers } = usePresenceStore();

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-[11px] text-[var(--text-muted)] italic opacity-60">No private chats yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((conv) => {
        const other = conv.participants.find((p) => p.id !== user?.id);
        const isActive = currentConversationId === conv.id;
        const isOnline = other && onlineUsers.has(other.id);

        return (
          <div key={conv.id} className="group relative">
            <button
              onClick={() => onConversationClick(conv)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 pr-10 relative group-hover:shadow-lg ${isActive ? 'bg-[var(--accent)] shadow-[0_8px_20px_var(--accent-glow)]' : 'hover:bg-[var(--bg-hover)]'}`}
            >
              <div className="relative">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-sm ${isActive ? 'bg-white/20 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}>
                  {other?.username?.charAt(0).toUpperCase() || '?'}
                </div>
                {isOnline && (
                  <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 ${isActive ? 'bg-white border-[var(--accent)]' : 'bg-green-500 border-[var(--bg-secondary)]'} shadow-sm`} />
                )}
              </div>

              <div className="flex-1 text-left min-w-0 pr-2">
                <div className={`truncate font-bold text-[15px] ${isActive ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                  {other?.username || 'Unknown'}
                </div>
                <div className={`truncate text-xs font-medium mt-0.5 opacity-80 ${isActive ? 'text-white/80' : 'text-[var(--text-secondary)]'}`}>
                  {conv.lastMessage ? conv.lastMessage.content : <span className="italic opacity-50">Empty conversation</span>}
                </div>
              </div>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this conversation?')) {
                  deleteConversation(conv.id);
                }
              }}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 ${isActive ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-[var(--text-muted)] hover:text-red-400 hover:bg-red-400/10'}`}
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
