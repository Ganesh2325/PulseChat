'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

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
    <aside className="w-72 h-full flex flex-col bg-[var(--bg-secondary)] backdrop-blur-xl border-r border-[var(--border)] select-none">
      {/* App Header */}
      <div className="px-6 py-5 flex items-center gap-3 border-b border-[var(--border)]">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-[0_8px_16px_rgba(139,92,246,0.25)] flex-shrink-0 bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA]">
          P
        </div>
        <div className="font-extrabold text-base tracking-tight text-slate-800">
          PulseChat
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">

        {/* CHANNELS */}
        <div>
          <div className="px-2 mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Channels
            </span>
          </div>
          <div className="space-y-1">
            {CHANNELS.map((ch) => {
              const room = rooms.find((r) => r.name.toLowerCase() === ch.name.toLowerCase());
              const isActive = room && currentRoomId === room.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => handleChannelClick(ch.name)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-left cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white shadow-[0_4px_12px_rgba(139,92,246,0.2)] font-bold' 
                      : 'text-slate-600 hover:bg-[#8B5CF6]/8 hover:text-[#8B5CF6]'
                  }`}
                >
                  <span className="text-base">{ch.icon}</span>
                  <span>{ch.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* DIRECT MESSAGES */}
        <div>
          <div className="px-2 mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Direct Messages
            </span>
          </div>
          <ConversationList
            onConversationClick={handleConversationClick}
            currentConversationId={currentConversationId}
          />
          {conversations.length === 0 && (
            <p className="px-3 py-4 text-xs italic text-slate-400">
              No direct messages yet.
            </p>
          )}
        </div>

      </div>

      {/* Footer (Padded wrapper) */}
      <div className="p-4 border-t border-[var(--border)] bg-white/20 backdrop-blur-md flex flex-col gap-3 shrink-0">
        {/* Professional Logout Button (Above User, No Icon) */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 cursor-pointer"
        >
          <span>Log Out</span>
        </button>

        {/* User Card (Below Logout Button) */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl border border-[var(--border)] bg-white/40 shadow-sm">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm relative flex-shrink-0 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)' }}
          >
            {user?.username?.charAt(0).toUpperCase()}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-extrabold text-sm text-slate-800 truncate">
              {user?.username}
            </div>
            <div className="text-[10px] font-semibold text-green-600 tracking-wider uppercase mt-0.5">
              Online
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
