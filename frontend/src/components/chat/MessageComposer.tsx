'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useRef, useCallback, useEffect } from 'react';
import { getSocket } from '@/lib/socket';
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
      if (replyingTo) setReplyingTo(null);
      document.getElementById('message-input')?.focus();
    };

    window.addEventListener('message:edit:trigger', handleEditTrigger);
    return () => window.removeEventListener('message:edit:trigger', handleEditTrigger);
  }, [replyingTo, setReplyingTo]);

  return (
    <div className="px-6 py-5 shrink-0 bg-[var(--bg-secondary)] border-t border-[var(--border)] shadow-[0_-8px_32px_rgba(139,92,246,0.02)] z-20">
      {replyingTo && (
        <div className="mb-4 px-4 py-3 bg-white/70 border border-[var(--border)] rounded-2xl flex items-center justify-between animate-pop-in shadow-sm select-none">
          <div className="flex items-center gap-4">
            <div className="p-1.5 bg-[#8B5CF6]/15 rounded-lg text-[#8B5CF6]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 10h10a8 8 0 018 8v2M3 10l5-5m-5 5l5 5" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Replying to {replyingTo.sender.username}</p>
              <p className="text-[13px] text-slate-500 truncate max-w-[400px] mt-0.5 font-semibold">{replyingTo.content}</p>
            </div>
          </div>
          <button 
            onClick={() => setReplyingTo(null)}
            className="text-[10px] font-bold text-[#8B5CF6] hover:text-[#7C3AED] cursor-pointer transition-colors uppercase tracking-widest px-3 py-1 bg-[#8B5CF6]/5 rounded-lg border border-[#8B5CF6]/10"
          >
            Cancel
          </button>
        </div>
      )}
      {editingMessage && (
        <div className="mb-4 px-4 py-3 bg-white/70 border border-[var(--border)] rounded-2xl flex items-center justify-between animate-pop-in shadow-sm select-none">
          <div className="flex items-center gap-4">
            <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-600 border border-amber-500/20">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Editing Message</p>
              <p className="text-[13px] text-slate-500 truncate max-w-[400px] mt-0.5 font-semibold">Original: {editingMessage.content}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setEditingMessage(null);
              setContent('');
            }}
            className="text-[10px] font-bold text-amber-600 hover:text-amber-700 cursor-pointer transition-colors uppercase tracking-widest px-3 py-1 bg-amber-500/5 rounded-lg border border-amber-500/10"
          >
            Cancel
          </button>
        </div>
      )}
      
      <div className="flex items-end gap-3 rounded-2xl p-1.5 bg-white border border-slate-200/80 focus-within:border-[#8B5CF6] focus-within:ring-2 focus-within:ring-[#8B5CF6]/15 transition-all duration-300 shadow-sm">
        <textarea
          id="message-input"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder={targetName ? `Message ${targetType === 'room' ? '' : '@'}${targetName}...` : "Message PulseChat..."}
          className="flex-1 bg-transparent text-[15px] resize-none outline-none py-2 px-3.5 max-h-36 min-h-[40px] text-slate-800 placeholder-slate-400 font-semibold leading-relaxed"
          rows={1}
        />

        {/* Send button */}
        <button
          id="send-button"
          onClick={handleSend}
          disabled={!content.trim()}
          className={`p-2.5 rounded-xl transition-all duration-300 shrink-0 disabled:opacity-30 disabled:scale-95 cursor-pointer flex items-center justify-center ${
            content.trim() 
              ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white shadow-[0_4px_12px_rgba(139,92,246,0.25)]' 
              : 'text-slate-400'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
