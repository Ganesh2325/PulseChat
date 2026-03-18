'use client';

import { useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { getSocket } from '@/lib/socket';
import { ConversationList } from './ConversationList';

const CHANNELS = [
  { id: 'coding',   name: 'coding',   icon: '💻' },
  { id: 'gaming',   name: 'gaming',   icon: '🎮' },
  { id: 'global',   name: 'global',   icon: '🌍' },
  { id: 'random',   name: 'random',   icon: '🎲' },
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

  return (
    <div
      className="w-72 h-full flex flex-col"
      style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}
    >
      {/* App Header */}
      <div
        className="px-5 py-4 flex items-center gap-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg flex-shrink-0"
          style={{ background: 'var(--accent)' }}
        >
          P
        </div>
        <div className="font-black text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>
          PulseChat
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">

        {/* CHANNELS */}
        <div>
          <div className="px-2 mb-2">
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              Channels
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
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
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
          <div className="px-2 mb-2">
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              Direct Messages
            </span>
          </div>
          <ConversationList
            onConversationClick={handleConversationClick}
            currentConversationId={currentConversationId}
          />
          {conversations.length === 0 && (
            <p className="px-3 py-2 text-xs italic" style={{ color: 'var(--text-muted)' }}>
              No direct messages yet.
            </p>
          )}
        </div>

      </div>

      {/* Footer */}
      <div className="px-3 py-3 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>

        {/* Professional Logout Button */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group"
          style={{
            background: 'transparent',
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
            e.currentTarget.style.color = '#f87171';
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>Sign Out</span>
        </button>

        {/* User Card */}
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{ background: 'var(--bg-tertiary)' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base relative flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {user?.username?.charAt(0).toUpperCase()}
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2"
              style={{ borderColor: 'var(--bg-tertiary)' }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="font-bold text-sm truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {user?.username}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
