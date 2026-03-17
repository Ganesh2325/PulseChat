'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';


interface MessageComposerProps {
  targetId: string;
  targetType: 'room' | 'conversation';
  targetName?: string;
}

export function MessageComposer({ targetId, targetType, targetName }: MessageComposerProps) {
  const [content, setContent] = useState('');
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSend = useCallback(() => {
    if (!content.trim() || !targetId) return;

    const socket = getSocket();
    if (!socket) return;

    const { replyingTo, setReplyingTo } = useChatStore.getState();

    if (editingMessage) {
      socket.emit('message:edit', {
        messageId: editingMessage.id,
        content: content.trim(),
      });
      setEditingMessage(null);
    } else {
      const currentUserId = useAuthStore.getState().user?.id;
      const currentUser = useAuthStore.getState().user;

      // Add optimistic message
      useChatStore.getState().addOptimisticMessage({
        content: content.trim(),
        senderId: currentUserId || '',
        sender: {
          id: currentUserId || '',
          username: currentUser?.username || 'You',
          avatar: currentUser?.avatar || null
        },
        [targetType === 'room' ? 'roomId' : 'conversationId']: targetId,
        parentMessageId: replyingTo?.id,
        parentMessage: replyingTo,
      });

      socket.emit('message:send', {
        content: content.trim(),
        [targetType === 'room' ? 'roomId' : 'conversationId']: targetId,
        parentMessageId: replyingTo?.id,
      });

      if (replyingTo) setReplyingTo(null);
    }

    setContent('');
    socket.emit('typing:stop', { targetId, targetType });
  }, [content, targetId, targetType, editingMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (!socket || !targetId) return;

    socket.emit('typing:start', { targetId, targetType });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', { targetId, targetType });
    }, 3000);
  };

  const { replyingTo, setReplyingTo } = useChatStore();

  useEffect(() => {
    const handleEditTrigger = (e: any) => {
      const message = e.detail;
      setEditingMessage(message);
      setContent(message.content);
      if (replyingTo) setReplyingTo(null); // Cancel reply if editing
      // Focus the input
      document.getElementById('message-input')?.focus();
    };

    window.addEventListener('message:edit:trigger', handleEditTrigger);
    return () => window.removeEventListener('message:edit:trigger', handleEditTrigger);
  }, [replyingTo, setReplyingTo]);

  return (
    <div className="px-6 py-6 shrink-0 bg-[var(--bg-secondary)] border-t border-white/5 shadow-[0_-24px_48px_-12px_rgba(0,0,0,0.5)] z-20">
      {replyingTo && (
        <div className="mb-4 px-4 py-3 bg-[var(--bg-surface-l3)] border border-white/5 rounded-2xl flex items-center justify-between animate-pop-in shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-[var(--accent)]/20 rounded-xl text-[var(--accent)] shadow-[0_0_15px_var(--accent-glow)]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 10h10a8 8 0 018 8v2M3 10l5-5m-5 5l5 5" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div>
              <p className="text-[12px] font-black text-white/90 uppercase tracking-tighter">Replying to {replyingTo.sender.username}</p>
              <p className="text-[13px] text-[var(--text-secondary)] truncate max-w-[400px] mt-0.5">{replyingTo.content}</p>
            </div>
          </div>
          <button 
            onClick={() => setReplyingTo(null)}
            className="text-[10px] font-black text-[var(--accent)] hover:text-white transition-colors uppercase tracking-[0.2em] px-3 py-1 bg-white/5 rounded-lg border border-white/5"
          >
            Cancel
          </button>
        </div>
      )}
      {editingMessage && (
        <div className="mb-4 px-4 py-3 bg-[var(--bg-surface-l3)] border border-white/5 rounded-2xl flex items-center justify-between animate-pop-in shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div>
              <p className="text-[12px] font-black text-white/90 uppercase tracking-tighter">Editing Message</p>
              <p className="text-[13px] text-[var(--text-secondary)] truncate max-w-[400px] mt-0.5">Original: {editingMessage.content}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setEditingMessage(null);
              setContent('');
            }}
            className="text-[10px] font-black text-amber-500 hover:text-white transition-colors uppercase tracking-[0.2em] px-3 py-1 bg-white/5 rounded-lg border border-white/5"
          >
            Cancel
          </button>
        </div>
      )}
      <div className="flex items-end gap-3 rounded-[32px] p-2 bg-[var(--bg-primary)] border border-white/5 focus-within:border-[var(--accent)]/50 focus-within:shadow-[0_0_30px_var(--accent-glow)] transition-all duration-500">
        <textarea
          id="message-input"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder={targetName ? `Message ${targetType === 'room' ? '' : '@'}${targetName}...` : "Message PulseChat..."}
          className="flex-1 bg-transparent text-[16px] resize-none outline-none py-3 px-4 max-h-40 min-h-[48px] text-white placeholder-[var(--text-muted)] font-medium"
          rows={1}
        />



        {/* Send button */}
        <button
          id="send-button"
          onClick={handleSend}
          disabled={!content.trim()}
          className="p-3 rounded-2xl transition-all duration-300 shrink-0 disabled:opacity-30 disabled:scale-95"
          style={{ 
            background: content.trim() ? 'var(--accent)' : 'transparent', 
            color: content.trim() ? 'white' : 'var(--text-muted)', 
            boxShadow: content.trim() ? '0 8px 20px var(--accent-glow)' : 'none' 
          }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
