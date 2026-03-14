'use client';

import { useState, useRef, useCallback } from 'react';
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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSend = useCallback(() => {
    if (!content.trim() || !targetId) return;

    const socket = getSocket();
    if (!socket) return;

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
    });

    socket.emit('message:send', {
      content: content.trim(),
      [targetType === 'room' ? 'roomId' : 'conversationId']: targetId,
    });

    setContent('');
    socket.emit('typing:stop', { targetId, targetType });
  }, [content, targetId, targetType]);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data: media } = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const socket = getSocket();
      socket?.emit('message:send', {
        content: `📎 ${file.name}`,
        [targetType === 'room' ? 'roomId' : 'conversationId']: targetId,
        type: file.type.startsWith('image/') ? 'IMAGE' : file.type.startsWith('video/') ? 'VIDEO' : 'FILE',
      });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };



  return (
    <div className="px-6 py-5 shrink-0 bg-white border-t border-slate-200 shadow-[0_-8px_20px_-10px_rgba(0,0,0,0.05)] z-20">
      <div className="flex items-end gap-3 rounded-[28px] p-3 bg-slate-50 border border-slate-200 focus-within:bg-white focus-within:border-[#1a73e8] focus-within:ring-4 focus-within:ring-[#1a73e8]/15 focus-within:shadow-lg transition-all duration-300">
        {/* File upload */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-hover)] shrink-0"
          title="Upload file"
        >
          {isUploading ? (
            <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          ) : (
            <svg className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,video/*,.pdf,.txt"
        />

        {/* Text input */}
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
