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
    <div className="px-6 py-5 shrink-0 bg-white border-t border-slate-200 shadow-[0_-8px_20px_-10px_rgba(0,0,0,0.05)] z-20">
      {replyingTo && (
        <div className="mb-3 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between animate-pop-in">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 10h10a8 8 0 018 8v2M3 10l5-5m-5 5l5 5" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div>
              <p className="text-[13px] font-bold text-indigo-900">Replying to {replyingTo.sender.username}</p>
              <p className="text-[11px] text-indigo-600 truncate max-w-[400px]">{replyingTo.content}</p>
            </div>
          </div>
          <button 
            onClick={() => setReplyingTo(null)}
            className="text-[11px] font-bold text-indigo-400 hover:text-indigo-600 transition-colors uppercase tracking-wider"
          >
            Cancel
          </button>
        </div>
      )}
      {editingMessage && (
        <div className="mb-3 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between animate-pop-in">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div>
              <p className="text-[13px] font-bold text-indigo-900">Editing Message</p>
              <p className="text-[11px] text-indigo-600 truncate max-w-[400px]">Original: {editingMessage.content}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setEditingMessage(null);
              setContent('');
            }}
            className="text-[11px] font-bold text-indigo-400 hover:text-indigo-600 transition-colors uppercase tracking-wider"
          >
            Cancel
          </button>
        </div>
      )}
      <div className="flex items-end gap-3 rounded-[28px] p-3 bg-slate-50 border border-slate-200 focus-within:bg-white focus-within:border-[#1a73e8] focus-within:ring-4 focus-within:ring-[#1a73e8]/15 focus-within:shadow-lg transition-all duration-300">
        <textarea
          id="message-input"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder={targetName ? `Message ${targetType === 'room' ? '' : '@'}${targetName}...` : "Message PulseChat..."}
          className="flex-1 bg-transparent text-[16px] resize-none outline-none py-2 px-2 max-h-40 min-h-[32px] text-slate-800 placeholder-slate-400 font-medium"
          rows={1}
        />



        {/* Send button */}
        <button
          id="send-button"
          onClick={handleSend}
          disabled={!content.trim()}
          className="p-3 rounded-2xl transition-all duration-300 shrink-0 disabled:opacity-30 disabled:scale-95"
          style={{ 
            background: content.trim() ? '#25D366' : 'transparent', 
            color: content.trim() ? 'white' : 'var(--text-muted)', 
            boxShadow: content.trim() ? '0 4px 12px rgba(37, 211, 102, 0.4)' : 'none' 
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
