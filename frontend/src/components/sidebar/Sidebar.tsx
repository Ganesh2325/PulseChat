'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { usePresenceStore } from '@/stores/presenceStore';
import { getSocket } from '@/lib/socket';

interface SidebarProps {
  onClose: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const { rooms, conversations, currentRoom, currentConversation, fetchRooms, fetchConversations, setCurrentRoom, setCurrentConversation, fetchRoomMessages, fetchConversationMessages, joinRoom, createConversation } = useChatStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  const { onlineUsers } = usePresenceStore();

  useEffect(() => {
    fetchRooms();
    fetchConversations();
    fetchUnreadCount();
  }, [fetchRooms, fetchConversations, fetchUnreadCount]);

  const handleRoomClick = async (room: any) => {
    setCurrentRoom(room);
    await joinRoom(room.id);
    await fetchRoomMessages(room.id);
    const socket = getSocket();
    socket?.emit('room:join', { roomId: room.id });
    onClose();
  };

  const handleConversationClick = async (conversation: any) => {
    setCurrentConversation(conversation);
    await fetchConversationMessages(conversation.id);
    const socket = getSocket();
    socket?.emit('conversation:join', { conversationId: conversation.id });
    onClose();
  };

  const handleStartDM = async (otherUserId: string) => {
    try {
      const conversation = await createConversation(otherUserId);
      setCurrentConversation(conversation);
      await fetchConversationMessages(conversation.id);

      const socket = getSocket();
      socket?.emit('conversation:join', { conversationId: conversation.id });
      onClose();
    } catch (err) {
      console.error('Failed to start DM:', err);
    }
  };

  // Derive active users from conversations participants who are currently online
  const activeUsersList = Array.from(
    new Map(
      conversations
        .flatMap((c) => c.participants)
        .filter((p) => p.id !== user?.id && onlineUsers.has(p.id))
        .map((p) => [p.id, p])
    ).values()
  );

  return (
    <div className="w-80 h-full flex flex-col border-r border-white/5 bg-[var(--bg-secondary)] shadow-2xl">
      {/* Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-[0_0_20px_var(--accent-glow)]" style={{ background: 'linear-gradient(135deg, var(--accent), #7e22ce)' }}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="font-black text-xl tracking-tight text-[var(--text-primary)]">PulseChat</span>
        </div>
      </div>

      {/* Rooms */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 px-2">
            📢 Channels
          </h3>
          <div className="space-y-1">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => handleRoomClick(room)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-all duration-150 group"
                style={{
                  background: currentRoom?.id === room.id ? 'var(--bg-active)' : 'transparent',
                  color: currentRoom?.id === room.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => { if (currentRoom?.id !== room.id) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={(e) => { if (currentRoom?.id !== room.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <span className="text-base">{room.isDefault ? '#' : '🔒'}</span>
                <span className="truncate flex-1 text-left">{room.name}</span>
                {room.isSponsored && <span className="text-[10px]">⭐</span>}
              </button>
            ))}
          </div>
        </div>

        {/* DMs */}
        <div className="p-3 pt-0">
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 px-2">
            Direct Messages
          </h3>
          <div className="space-y-1">
            {conversations
              .filter(conv => conv.lastMessage !== null || currentConversation?.id === conv.id)
              .map((conv) => {
                const other = conv.participants.find((p) => p.id !== user?.id);
                const isActive = currentConversation?.id === conv.id;
                return (
                  <div key={conv.id} className="group relative">
                    <button
                      onClick={() => handleConversationClick(conv)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 pr-10 relative group-hover:shadow-lg ${isActive ? 'bg-[var(--accent)] shadow-[0_8px_20px_var(--accent-glow)]' : 'hover:bg-[var(--bg-hover)]'}`}
                    >
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2">
                          <div className={`truncate font-bold text-[15px] ${isActive ? 'text-white' : 'text-[var(--text-primary)]'}`}>{other?.username || 'Unknown'}</div>
                          {other && onlineUsers.has(other.id) && (
                            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white shadow-[0_0_8px_white]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'}`} />
                          )}
                        </div>
                        {conv.lastMessage && (
                          <div className={`truncate text-xs font-medium mt-0.5 ${isActive ? 'text-white/80' : 'text-[var(--text-secondary)]'}`}>
                            {conv.lastMessage.content}
                          </div>
                        )}
                      </div>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this conversation?')) {
                          useChatStore.getState().deleteConversation(conv.id);
                        }
                      }}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 ${isActive ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-red-400 hover:bg-red-400/10'}`}
                      title="Delete Conversation"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            {conversations.filter(conv => conv.lastMessage !== null || currentConversation?.id === conv.id).length === 0 && (
              <p className="text-xs text-[var(--text-muted)] px-3 py-2 italic font-medium">Start a chat from the active users list!</p>
            )}
          </div>
        </div>

        {/* Active Users */}
        {activeUsersList.length > 0 && (
          <div className="p-3 pt-0">
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 px-2">
              🟢 Online Now
            </h3>
            <div className="space-y-1">
              {activeUsersList.map((activeUser) => (
                <button
                  key={`online-${activeUser.id}`}
                  onClick={() => handleStartDM(activeUser.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 hover:bg-[var(--bg-hover)] group"
                >
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="truncate font-bold text-[14px] text-[var(--text-primary)] group-hover:text-white transition-colors">
                        {activeUser.username}
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* User profile */}
      <div className="border-t border-white/5 p-5 bg-[var(--bg-primary)]/50">
        <button
          onClick={logout}
          className="w-full mb-4 py-2.5 rounded-xl text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-red-500/10 hover:shadow-red-500/20 active:scale-[0.98] bg-[var(--danger)]/80 hover:bg-[var(--danger)]"
        >
          Logout
        </button>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white shadow-[0_0_20px_var(--accent-glow)]" style={{ background: 'linear-gradient(135deg, var(--accent), #7e22ce)' }}>
              {user?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[3px] shadow-sm" style={{ background: 'var(--success)', borderColor: 'var(--bg-secondary)' }} />
          </div>
          <div className="flex-1 min-w-0 pl-1">
            <div className="font-bold text-[15px] text-[var(--text-primary)] truncate">{user?.username}</div>
            <div className="text-xs font-bold text-[var(--text-secondary)] mt-0.5">{user?.isGuest ? 'Guest User' : 'Online'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
