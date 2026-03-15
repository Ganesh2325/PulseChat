'use client';

import { format } from 'date-fns';
import { useChatStore } from '@/stores/chatStore';
import { getSocket } from '@/lib/socket';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    type: string;
    status: string;
    sender: { id: string; username: string; avatar: string | null };
    mediaFiles?: any[];
    createdAt: string;
  };
  isOwn: boolean;
  showAvatar: boolean;
}

export function MessageBubble({ message, isOwn, showAvatar }: MessageBubbleProps) {
  const time = format(new Date(message.createdAt), 'HH:mm');
  const { createConversation, setCurrentConversation, fetchConversationMessages } = useChatStore();

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

  return (
    <div className={`flex gap-2.5 animate-pop-in transition-transform duration-200 hover:-translate-y-0.5 group ${showAvatar ? 'mt-3' : 'mt-0.5'} ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className="w-10 shrink-0">
        {showAvatar && (
          <button
            onClick={handleUserClick}
            disabled={isOwn}
            className={`w-10 h-10 rounded-[14px] flex items-center justify-center text-[15px] font-bold shadow-sm transition-transform hover:scale-105 active:scale-95 ${!isOwn ? 'cursor-pointer hover:shadow-md' : 'cursor-default'}`}
            style={{
              background: isOwn
                ? 'linear-gradient(135deg, var(--accent), #60a5fa)'
                : 'var(--bg-tertiary)',
              color: isOwn ? 'white' : 'inherit'
            }}
            title={!isOwn ? `Message ${message.sender.username}` : undefined}
          >
            {message.sender.username.charAt(0).toUpperCase()}
          </button>
        )}
      </div>

      {/* Content */}
      <div className={`max-w-[70%] min-w-0 ${isOwn ? 'items-end' : 'items-start'}`}>
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
          </div>
        )}

        <div
          className="px-4 py-2.5 rounded-2xl text-[15px] font-medium leading-relaxed break-words transition-all duration-200 group-hover:shadow-md"
          style={{
            background: isOwn ? 'var(--message-own)' : 'var(--message-other)',
            borderTopLeftRadius: !isOwn && showAvatar ? '4px' : undefined,
            borderTopRightRadius: isOwn && showAvatar ? '4px' : undefined,
          }}
        >
          {/* Render content with @mention highlighting */}
          {message.content.split(/(@\w+)/g).map((part, i) =>
            part.startsWith('@') ? (
              <span key={i} className="font-semibold" style={{ color: 'var(--accent)' }}>{part}</span>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}

          {/* Status indicator for own messages */}
          {isOwn && !showAvatar && (
            <span className="inline-flex ml-1.5 text-[10px] text-[var(--text-muted)]">
              {time}
            </span>
          )}
        </div>

        {isOwn && (
          <div className={`text-[10px] text-[var(--text-muted)] mt-0.5 ${isOwn ? 'text-right' : ''}`}>
            {message.status === 'READ' ? '✓✓' : message.status === 'DELIVERED' ? '✓✓' : '✓'}
          </div>
        )}
      </div>
    </div>
  );
}
