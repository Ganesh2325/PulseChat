'use client';

import { useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { getSocket } from '@/lib/socket';
import { ConversationList } from './ConversationList';

const CHANNELS = [
  { id: 'coding', name: 'coding', icon: '💻' },
  { id: 'gaming', name: 'gaming', icon: '🎮' },
  { id: 'global', name: 'global', icon: '🌍' },
  { id: 'random', name: 'random', icon: '🎲' },
  { id: 'students', name: 'students', icon: '📚' },
];

interface SidebarProps {
  onClose: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const {
    rooms,
    conversations,
    fetchRooms,
    fetchConversations,
    createConversation,
    setCurrentRoom,
    setCurrentConversation,
    fetchRoomMessages,
    fetchConversationMessages,
  } = useChatStore();

  const currentRoomId = useChatStore((s) => s.currentRoom?.id);
  const currentConversationId = useChatStore((s) => s.currentConversation?.id);

  useEffect(() => {
    fetchRooms();
    fetchConversations();
  }, []);

  const handleChannelClick = async (channelName: string) => {
    // Find the room by name (case-insensitive)
    const room = rooms.find((r) => r.name.toLowerCase() === channelName.toLowerCase());
    if (room) {
      setCurrentRoom(room);
      await fetchRoomMessages(room.id);
      getSocket()?.emit('room:join', { roomId: room.id });
    }
    onClose();
  };

  const handleConversationClick = async (conv: any) => {
    setCurrentConversation(conv);
    await fetchConversationMessages(conv.id);
    getSocket()?.emit('conversation:join', { conversationId: conv.id });
    onClose();
  };

  const handleStartDM = async (userId: string) => {
    const conv = await createConversation(userId);
    if (conv) handleConversationClick(conv);
  };

  return (
    <div className="w-72 h-full flex flex-col" style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>

      {/* App Header */}
      <div className="px-5 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg" style={{ background: 'var(--accent)' }}>
          P
        </div>
        <div>
          <div className="font-black text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>PulseChat</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#22c55e' }}>Online</span>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">

        {/* CHANNELS */}
        <div>
          <div className="px-2 mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Channels</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
              {CHANNELS.length}
            </span>
          </div>
          <div className="space-y-0.5">
            {CHANNELS.map((ch) => {
              const room = rooms.find((r) => r.name.toLowerCase() === ch.name.toLowerCase());
              const isActive = room && currentRoomId === room.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => handleChannelClick(ch.name)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 text-left"
                  style={{
                    background: isActive ? 'var(--accent)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span className="text-base">{ch.icon}</span>
                  <span># {ch.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* DIRECT MESSAGES */}
        <div>
          <div className="px-2 mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Direct Messages</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
              {conversations.length}
            </span>
          </div>
          <ConversationList
            onConversationClick={handleConversationClick}
            currentConversationId={currentConversationId}
          />
          {conversations.length === 0 && (
            <p className="px-3 text-xs italic" style={{ color: 'var(--text-muted)' }}>No direct messages yet.</p>
          )}
        </div>

      </div>

      {/* Footer — Logout + User */}
      <div className="px-4 py-4 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#ef444420'; e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base relative" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {user?.username?.charAt(0).toUpperCase()}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2" style={{ borderColor: 'var(--bg-tertiary)' }} />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{user?.username}</div>
            <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>
              {user?.isGuest ? 'Guest' : 'Verified User'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
