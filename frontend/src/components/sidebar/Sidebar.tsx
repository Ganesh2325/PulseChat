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
    <div className="w-80 h-full flex flex-col border-r" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, var(--accent), #60a5fa)' }}>
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="font-extrabold text-xl bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">PulseChat</span>
        </div>

        {/* Notification bell */}
        <div className="relative">
          <svg className="w-5 h-5 text-[var(--text-secondary)] cursor-pointer hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white" style={{ background: 'var(--danger)' }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
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
            {conversations.map((conv) => {
              const other = conv.participants.find((p) => p.id !== user?.id);
              const isActive = currentConversation?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => handleConversationClick(conv)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
                  style={{
                    background: isActive ? 'var(--bg-active)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="truncate font-semibold text-[15px] text-slate-800">{other?.username || 'Unknown'}</div>
                      {other && onlineUsers.has(other.id) && (
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                      )}
                    </div>
                    {conv.lastMessage && (
                      <div className="truncate text-xs font-medium text-[var(--text-muted)] mt-0.5">
                        {conv.lastMessage.content}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
            {conversations.length === 0 && (
              <p className="text-xs text-[var(--text-muted)] px-3 py-2">No conversations yet</p>
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
                      <div className="truncate font-semibold text-[14px] text-slate-700 group-hover:text-slate-900 transition-colors">
                        {activeUser.username}
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* User profile */}
      <div className="border-t p-3" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold text-white shadow-md" style={{ background: 'linear-gradient(135deg, var(--accent), #60a5fa)' }}>
              {user?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-[3px]" style={{ background: 'var(--success)', borderColor: 'var(--bg-secondary)' }} />
          </div>
          <div className="flex-1 min-w-0 pl-1">
            <div className="font-bold text-[15px] text-slate-800 truncate">{user?.username}</div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">{user?.isGuest ? 'Guest User' : 'Online'}</div>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center p-2.5 rounded-xl text-white transition-all duration-200 shadow hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
            style={{ background: 'var(--danger)' }}
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
