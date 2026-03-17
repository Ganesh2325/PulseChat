import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { getSocket } from '@/lib/socket';
import { DeleteMessageModal } from './DeleteMessageModal';

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
  isGrouped?: boolean;
  isLastInGroup?: boolean;
}

export function MessageBubble({ message, isOwn, showAvatar, isGrouped, isLastInGroup }: MessageBubbleProps) {
  const time = format(new Date(message.createdAt), 'HH:mm');
  const { user } = useAuthStore();
  const { createConversation, setCurrentConversation, fetchConversationMessages, setReplyingTo, setForwardingMessage } = useChatStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    if (!showMenu) return;
    const handleClickAway = () => setShowMenu(false);
    window.addEventListener('click', handleClickAway);
    return () => window.removeEventListener('click', handleClickAway);
  }, [showMenu]);

  const handleUserClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
    setShowMenu(false);
  };

  const onDeleteEveryone = () => {
    const socket = getSocket();
    socket?.emit('message:delete', { messageId: message.id });
    setShowDeleteModal(false);
  };

  const onDeleteMe = () => {
    const socket = getSocket();
    socket?.emit('message:delete:me', { messageId: message.id });
    setShowDeleteModal(false);
  };

  const onCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleEdit = () => {
    if (!isOwn) return;
    // We will trigger a global edit state that MessageComposer can listen to
    window.dispatchEvent(new CustomEvent('message:edit:trigger', { detail: message }));
    setShowMenu(false);
  };

  const handleReply = () => {
    setReplyingTo(message);
    setShowMenu(false);
    // Focus composer
    document.getElementById('message-input')?.focus();
  };

  const handleForward = () => {
    setForwardingMessage(message);
    setShowMenu(false);
  };

  const handlePin = () => {
    const socket = getSocket();
    socket?.emit('message:pin:toggle', { messageId: message.id });
    setShowMenu(false);
  };

  if (message.isDeleted) {
    return (
      <div className={`flex gap-2.5 ${showAvatar ? 'mt-4' : 'mt-1'} ${isOwn ? 'flex-row-reverse' : ''} opacity-40`}>
        {!isOwn && <div className="w-10 shrink-0" />}
        <div className={`max-w-[70%] px-4 py-2 rounded-2xl border border-white/5 text-[var(--text-secondary)] italic text-sm bg-white/5 shadow-sm`}>
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div 
      id={`message-${message.id}`}
      className={`flex gap-2.5 animate-pop-in transition-transform duration-200 hover:-translate-y-0.5 group ${showAvatar ? 'mt-4' : 'mt-1'} ${isOwn ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className="w-10 shrink-0 text-center">
        {showAvatar && (
          <button
            onClick={handleUserClick}
            disabled={isOwn}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[15px] font-black shadow-lg transition-all hover:scale-105 active:scale-95 ${!isOwn ? 'cursor-pointer hover:shadow-[0_0_20px_var(--accent-glow)]' : 'cursor-default'}`}
            style={{
              background: isOwn ? 'linear-gradient(135deg, var(--accent), #7e22ce)' : 'var(--bg-surface-l3)',
              color: 'white',
              boxShadow: isOwn ? '0 4px 12px var(--accent-glow)' : undefined
            }}
            title={!isOwn ? `Message ${message.sender.username}` : undefined}
          >
            {message.sender.username.charAt(0).toUpperCase()}
          </button>
        )}
      </div>

      {/* Content */}
      <div className={`relative max-w-[70%] min-w-0 flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Action Menu (Desktop Hover / Mobile Double Click) */}
        {showMenu && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`absolute -top-12 flex bg-[var(--bg-surface-l3)]/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10 rounded-full px-3 py-1.5 gap-2 z-30 transition-all animate-pop-in ${isOwn ? 'right-0' : 'left-0'}`}
          >
            <button onClick={handleReply} className="p-1.5 hover:bg-white/10 rounded-lg text-[var(--text-secondary)] hover:text-white" title="Reply">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 10h10a8 8 0 018 8v2M3 10l5-5m-5 5l5 5" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>

            {isOwn && (
              <button onClick={handleEdit} className="p-1.5 hover:bg-white/10 rounded-lg text-[var(--text-secondary)] hover:text-white" title="Edit">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            )}

            <button onClick={handleForward} className="p-1.5 hover:bg-white/10 rounded-lg text-[var(--text-secondary)] hover:text-white" title="Forward">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>

            <button onClick={handlePin} className={`p-1.5 hover:bg-white/10 rounded-lg ${message.isPinned ? 'text-amber-400' : 'text-[var(--text-secondary)] hover:text-white'}`} title="Pin">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.414a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            <button onClick={handleDeleteClick} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg" title="Delete">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
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
            <span className="text-[11px] font-bold text-[var(--text-muted)] opacity-80">{time}</span>
            {message.isPinned && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-500 px-2.5 py-0.5 rounded-full font-black border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.414a6 6 0 108.486 8.486L20.5 13" /></svg>
                Pinned
              </span>
            )}
          </div>
        )}

        <div
          onClick={(e) => {
            if (!isMobile) {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }
          }}
          onDoubleClick={(e) => {
            if (isMobile) {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }
          }}
          className="px-4 py-2.5 rounded-2xl text-[15px] font-medium transition-all duration-200 group-hover:shadow-md relative cursor-pointer select-none"
          style={{
            background: isOwn ? 'var(--message-own)' : 'var(--message-other)',
            borderTopLeftRadius: !isOwn && showAvatar ? '4px' : undefined,
            borderTopRightRadius: isOwn && showAvatar ? '4px' : undefined,
            color: 'white',
            boxShadow: isOwn ? '0 8px 16px -4px var(--accent-glow)' : '0 4px 12px -2px rgba(0,0,0,0.2)'
          }}
        >
          {/* Dropdown Indicator (Desktop) */}
          {!isMobile && (
            <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}

          {/* Forwarded label */}
          {message.isForwarded && (
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] italic mb-1 opacity-80 border-b border-black/5 pb-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
              Forwarded
            </div>
          )}

          {/* Reply Preview */}
          {message.parentMessage && (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                const element = document.getElementById(`message-${message.parentMessageId}`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  element.classList.add('highlight-flash');
                  setTimeout(() => element.classList.remove('highlight-flash'), 2000);
                }
              }}
              className="mb-2 px-3 py-2 bg-white/5 border-l-4 border-[var(--accent)] rounded-r-xl text-[13px] opacity-90 cursor-alias select-none hover:bg-white/10 transition-colors"
            >
              <p className="font-extrabold text-[11px] mb-0.5" style={{ color: 'var(--accent)' }}>
                {message.parentMessage.sender.username}
              </p>
              <p className="truncate text-[var(--text-secondary)] font-medium italic">
                {message.parentMessage.content}
              </p>
            </div>
          )}

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
                onClick={(e) => { e.stopPropagation(); handleReact(emoji); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border transition-all hover:scale-105 active:scale-95 ${
                  message.reactions?.some(r => r.emoji === emoji && r.userId === user?.id)
                    ? 'bg-[var(--accent)]/20 border-[var(--accent)]/30 text-white shadow-[0_0_12px_var(--accent-glow)]'
                    : 'bg-white/5 border-white/10 text-[var(--text-secondary)] hover:border-white/20'
                }`}
              >
                <span className="text-[14px]">{emoji}</span>
                <span className="opacity-90">{message.reactions?.filter(r => r.emoji === emoji).length}</span>
              </button>
            ))}
          </div>
        )}

        {isOwn && !isGrouped && (
          <div className="flex justify-end mt-1 px-1">
            <span 
              className={`text-[11px] font-black ${message.status === 'READ' ? 'text-indigo-400' : 'text-[var(--text-muted)]'}`}
              title={message.status}
            >
              {message.status === 'READ' || message.status === 'DELIVERED' ? '✓✓' : '✓'}
            </span>
          </div>
        )}
      </div>

      <DeleteMessageModal 
        isOpen={showDeleteModal}
        canDeleteForEveryone={isOwn}
        onDeleteEveryone={onDeleteEveryone}
        onDeleteMe={onDeleteMe}
        onCancel={onCancelDelete}
      />
    </div>
  );
}
