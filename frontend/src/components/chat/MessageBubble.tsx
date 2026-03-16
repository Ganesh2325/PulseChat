'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { getSocket } from '@/lib/socket';

interface Message {
  id: string;
  content: string;
  type: string;
  status: string;
  senderId: string;
  sender: { id: string; username: string; avatar: string | null };
  roomId?: string;
  conversationId?: string;
  mediaFiles?: any[];
  createdAt: string;
  isOptimistic?: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
  isPinned?: boolean;
  isForwarded?: boolean;
  reactions?: Array<{ id: string; emoji: string; userId: string; user: { username: string } }>;
  parentMessageId?: string | null;
  parentMessage?: Message | null;
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}

export function MessageBubble({ message, isOwn, showAvatar }: MessageBubbleProps) {
  const time = format(new Date(message.createdAt), 'HH:mm');
  const { user } = useAuthStore();
  const { createConversation, setCurrentConversation, fetchConversationMessages } = useChatStore();
  const [showMenu, setShowMenu] = useState(false);

  const handleUserClick = async () => {
    if (isOwn) return;
    try {
      const conversation = await createConversation(message.sender.id);
      setCurrentConversation(conversation);
      await fetchConversationMessages(conversation.id);
      
      const socket = getSocket();
      socket?.emit('conversation:join', { conversationId: conversation.id });
    } catch (err) {
      console.error('Failed to create/open DM:', err);
    }
  };

  const handleReact = (emoji: string) => {
    const socket = getSocket();
    socket?.emit('message:react', { messageId: message.id, emoji });
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (window.confirm('Delete this message for everyone?')) {
      const socket = getSocket();
      socket?.emit('message:delete', { messageId: message.id });
    }
  };

  const handleEdit = () => {
    // We will trigger a global edit state that MessageComposer can listen to
    window.dispatchEvent(new CustomEvent('message:edit:trigger', { detail: message }));
    setShowMenu(false);
  };

  const handlePin = () => {
    const socket = getSocket();
    socket?.emit('message:pin:toggle', { messageId: message.id });
    setShowMenu(false);
  };

  if (message.isDeleted) {
    return (
      <div className={`flex gap-2.5 ${showAvatar ? 'mt-3' : 'mt-0.5'} ${isOwn ? 'flex-row-reverse' : ''} opacity-60`}>
        <div className="w-10 shrink-0" />
        <div className={`max-w-[70%] px-4 py-2 rounded-2xl border border-slate-200 text-slate-400 italic text-sm ${isOwn ? 'bg-slate-50' : 'bg-white'}`}>
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex gap-2.5 animate-pop-in transition-transform duration-200 hover:-translate-y-0.5 group ${showAvatar ? 'mt-3' : 'mt-0.5'} ${isOwn ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className="w-10 shrink-0 text-center">
        {showAvatar && (
          <button
            onClick={handleUserClick}
            disabled={isOwn}
            className={`w-10 h-10 rounded-[14px] flex items-center justify-center text-[15px] font-bold shadow-sm transition-transform hover:scale-105 active:scale-95 ${!isOwn ? 'cursor-pointer hover:shadow-md' : 'cursor-default'}`}
            style={{
              background: isOwn ? 'linear-gradient(135deg, var(--accent), #60a5fa)' : 'var(--bg-tertiary)',
              color: isOwn ? 'white' : 'inherit'
            }}
            title={!isOwn ? `Message ${message.sender.username}` : undefined}
          >
            {message.sender.username.charAt(0).toUpperCase()}
          </button>
        )}
      </div>

      {/* Content */}
      <div className={`relative max-w-[70%] min-w-0 flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Action Menu (Desktop Hover) */}
        {showMenu && !message.isDeleted && (
          <div className={`absolute -top-8 flex bg-white/90 backdrop-blur shadow-lg border border-slate-100 rounded-full px-2 py-1 gap-1.5 z-30 transition-all animate-pop-in ${isOwn ? 'right-0' : 'left-0'}`}>
            <button onClick={() => handleReact('👍')} className="hover:scale-125 transition-transform">👍</button>
            <button onClick={() => handleReact('❤️')} className="hover:scale-125 transition-transform">❤️</button>
            <button onClick={() => handleReact('😂')} className="hover:scale-125 transition-transform">😂</button>
            <div className="w-px h-4 bg-slate-200 self-center mx-1" />
            <button onClick={handleEdit} className="p-1 hover:bg-slate-100 rounded-md" title="Edit">
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button onClick={handlePin} className={`p-1 hover:bg-slate-100 rounded-md ${message.isPinned ? 'text-amber-500' : 'text-slate-500'}`} title="Pin">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button onClick={handleDelete} className="p-1 hover:bg-red-50 text-red-400 rounded-md" title="Delete">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        )}

        {showAvatar && (
          <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
            <button 
              onClick={handleUserClick}
              disabled={isOwn}
              className={`text-[14px] font-bold ${!isOwn ? 'hover:underline cursor-pointer' : 'cursor-default'}`} 
              style={{ color: isOwn ? 'var(--accent)' : 'var(--text-primary)' }}
            >
              {message.sender.username}
            </button>
            <span className="text-[11px] font-medium text-[var(--text-muted)]">{time}</span>
            {message.isPinned && (
              <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full font-bold border border-amber-100">📌 Pinned</span>
            )}
          </div>
        )}

        <div
          onDoubleClick={() => setShowMenu(!showMenu)}
          className="px-4 py-2.5 rounded-2xl text-[15px] font-medium transition-all duration-200 group-hover:shadow-md relative cursor-pointer select-none"
          style={{
            background: isOwn ? 'var(--message-own)' : 'var(--message-other)',
            borderTopLeftRadius: !isOwn && showAvatar ? '4px' : undefined,
            borderTopRightRadius: isOwn && showAvatar ? '4px' : undefined,
          }}
        >
          {message.content.split(/(@\w+)/g).map((part, i) =>
            part.startsWith('@') ? (
              <span key={i} className="font-semibold" style={{ color: 'var(--accent)' }}>{part}</span>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}

          {message.isEdited && (
            <span className="text-[10px] text-[var(--text-muted)] italic ml-1 opacity-70">(edited)</span>
          )}

          {/* Status indicator for own messages or just timestamp */}
          {!showAvatar && (
            <span className="inline-flex ml-1.5 text-[10px] text-[var(--text-muted)] opacity-60">
              {time}
            </span>
          )}
        </div>

        {/* Reactions List */}
        {message.reactions && message.reactions.length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            {Array.from(new Set(message.reactions.map(r => r.emoji))).map(emoji => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border transition-all ${
                  message.reactions?.some(r => r.emoji === emoji && r.userId === user?.id)
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                    : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                }`}
              >
                <span>{emoji}</span>
                <span>{message.reactions?.filter(r => r.emoji === emoji).length}</span>
              </button>
            ))}
          </div>
        )}

        {isOwn && (
          <div className="text-[10px] text-[var(--text-muted)] mt-0.5 min-h-[14px]">
            {message.status === 'READ' ? '✓✓' : message.status === 'DELIVERED' ? '✓✓' : '✓'}
          </div>
        )}
      </div>
    </div>
  );
}
