'use client';

import { useRef, useEffect, useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { usePresenceStore } from '@/stores/presenceStore';
import { MessageBubble } from './MessageBubble';
import { MessageComposer } from './MessageComposer';
import { TypingIndicator } from './TypingIndicator';

export function ChatView() {
  const { currentRoom, currentConversation, messages, isLoadingMessages } = useChatStore();
  const { user } = useAuthStore();
  const { typingUsers } = usePresenceStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const title = currentRoom?.name || currentConversation?.participants.find((p) => p.id !== user?.id)?.username || 'Chat';
  const description = currentRoom?.description || '';
  const targetId = currentRoom?.id || currentConversation?.id || '';
  const targetType = currentRoom ? 'room' as const : 'conversation' as const;

  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      setAutoScroll(scrollHeight - scrollTop - clientHeight < 100);
    }
  };

  const typingEntries = Array.from(typingUsers.values()).filter((t) => t.username !== user?.username);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center gap-4 shrink-0 shadow-sm z-10" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        {currentRoom && (
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-extrabold shadow-sm" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
            #
          </div>
        )}
        {currentConversation && (
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md" style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)' }}>
            {title.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h2 className="font-extrabold text-[18px] text-slate-800 tracking-tight">{title}</h2>
          {description && <p className="text-[14px] font-medium text-[var(--text-muted)] mt-0.5">{description}</p>}
        </div>
        {currentRoom && (
          <div className="ml-auto flex items-center gap-2 text-[14px] font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            {currentRoom.memberCount} members
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-1"
        style={{ background: 'var(--bg-primary)' }}
      >
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 rounded-full border-3 border-[var(--accent)] border-t-transparent animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-sm" style={{ background: 'var(--bg-tertiary)' }}>
              <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-bold text-[18px] text-slate-800">No messages yet</h3>
            <p className="text-[15px] font-medium text-[var(--text-muted)] mt-2">Be the first to say something!</p>
          </div>
        ) : (
          <>
            {/* Native ad placeholder (roughly every 50 messages) */}
            {messages.map((message, index) => (
              <div key={message.id}>
                {index > 0 && index % 50 === 0 && (
                  <div className="my-4 p-3 rounded-xl text-center text-xs border" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                    📌 Sponsored — <span className="underline cursor-pointer">Learn about PulseChat Pro</span>
                  </div>
                )}
                <MessageBubble
                  message={message}
                  isOwn={message.senderId === user?.id}
                  showAvatar={
                    index === 0 || messages[index - 1]?.senderId !== message.senderId
                  }
                />
              </div>
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {typingEntries.length > 0 && (
        <TypingIndicator usernames={typingEntries.map((t) => t.username)} />
      )}

      {/* Composer */}
      <MessageComposer targetId={targetId} targetType={targetType} targetName={title} />
    </div>
  );
}
