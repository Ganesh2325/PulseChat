'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { RoomList } from './RoomList';
import { ConversationList } from './ConversationList';
import { getSocket } from '@/lib/socket';

export default function Sidebar() {
  const router = useRouter();
  const params = useParams();
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

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use a ref to prevent double-join on strict mode
  const refreshAll = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchRooms(),
        fetchConversations(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleRoomClick = async (room: any) => {
    setCurrentRoom(room);
    await fetchRoomMessages(room.id);
    getSocket()?.emit('room:join', { roomId: room.id });
  };

  const handleConversationClick = async (conv: any) => {
    setCurrentConversation(conv);
    await fetchConversationMessages(conv.id);
    getSocket()?.emit('conversation:join', { conversationId: conv.id });
  };

  const handleStartDM = async (userId: string) => {
    const conv = await createConversation(userId);
    if (conv) handleConversationClick(conv);
  };

  const currentRoomId = useChatStore(s => s.currentRoom?.id);
  const currentConversationId = useChatStore(s => s.currentConversation?.id);

  return (
    <div className="w-80 h-full flex flex-col bg-[var(--bg-secondary)] border-r border-white/5 relative overflow-hidden">
      {/* Cinematic Header */}
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--accent)] to-purple-500 flex items-center justify-center shadow-[0_8px_20px_var(--accent-glow)]">
              <span className="text-white text-xl font-black italic">P</span>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter text-[var(--text-primary)]">PULSECHAT</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-green-500/80 uppercase tracking-widest leading-none mt-0.5">Systems Online</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={refreshAll}
            className={`p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all ${isRefreshing ? 'animate-spin opacity-50' : ''}`}
            title="Force Global Refresh"
          >
            <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Navigation Categories */}
        <div className="flex items-center gap-1 p-1 bg-[var(--bg-tertiary)] rounded-2xl mb-6">
          <button className="flex-1 py-1.5 rounded-xl bg-[var(--bg-active)] text-white text-xs font-black shadow-sm tracking-wide uppercase">Chats</button>
          <button className="flex-1 py-1.5 rounded-xl text-[var(--text-muted)] hover:text-white transition-colors text-xs font-black tracking-wide uppercase">Files</button>
          <button className="flex-1 py-1.5 rounded-xl text-[var(--text-muted)] hover:text-white transition-colors text-xs font-black tracking-wide uppercase">Store</button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 space-y-8 scrollbar-hide py-2">
        {/* ROOMS / CHANNELS */}
        <section>
          <div className="flex items-center justify-between mb-3 px-2">
            <h2 className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Public Channels</h2>
            <span className="text-[10px] font-bold bg-white/5 px-1.5 py-0.5 rounded text-[var(--text-muted)]">{rooms.length}</span>
          </div>
          <RoomList 
            onRoomClick={handleRoomClick} 
            currentRoomId={currentRoomId} 
          />
        </section>

        {/* PRIVATE MESSAGES */}
        <section>
          <div className="flex items-center justify-between mb-3 px-2">
            <h2 className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Direct Messages</h2>
            <span className="text-[10px] font-bold bg-white/5 px-1.5 py-0.5 rounded text-[var(--text-muted)]">{conversations.length}</span>
          </div>
          <ConversationList 
            onConversationClick={handleConversationClick}
            currentConversationId={currentConversationId}
          />
        </section>
      </div>

      {/* User Status Bar */}
      <div className="p-4 bg-[var(--bg-tertiary)] border-t border-white/5">
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/2 token-card shadow-sm group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-lg border-2 border-white/10 shadow-lg">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-4 border-[var(--bg-tertiary)]" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-black text-[var(--text-primary)] truncate block group-hover:text-[var(--accent)] transition-colors">
                {user?.username}
              </span>
              <button 
                onClick={logout}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-500/10 rounded-lg text-[var(--text-muted)] hover:text-red-400"
                title="Exit Session"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-1">
               <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{user?.isGuest ? 'Hacker/Guest' : 'Verified User'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
