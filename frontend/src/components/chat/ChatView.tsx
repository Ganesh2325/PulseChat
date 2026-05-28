'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useEffect, useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { usePresenceStore } from '@/stores/presenceStore';
import { getSocket } from '@/lib/socket';
import { MessageBubble } from './MessageBubble';
import { MessageComposer } from './MessageComposer';
import { TypingIndicator } from './TypingIndicator';
import dynamic from 'next/dynamic';

const SearchOverlay = dynamic(
  () => import('./SearchOverlay').then((m) => m.SearchOverlay),
  { ssr: false }
);

export function ChatView() {
  const { currentRoom, currentConversation, messages, isLoadingMessages } = useChatStore();
  const { user } = useAuthStore();
  const { typingUsers } = usePresenceStore();
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const title = currentRoom?.name || currentConversation?.participants.find((p) => p.id !== user?.id)?.username || 'Chat';
  const targetId = currentRoom?.id || currentConversation?.id || '';
  const targetType = currentRoom ? 'room' as const : 'conversation' as const;

  const { todayStr, yesterdayStr } = useMemo(() => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 86400000);
    return {
      todayStr: now.toDateString(),
      yesterdayStr: yesterday.toDateString(),
    };
  }, []);

  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  // Mark as read
  useEffect(() => {
    if (!targetId) return;
    const socket = getSocket();
    if (socket) {
      socket.emit('mark:read', { [targetType === 'room' ? 'roomId' : 'conversationId']: targetId });
    }
  }, [targetId, targetType, messages.length]); // Mark read when thread changes or new messages arrive

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      setAutoScroll(scrollHeight - scrollTop - clientHeight < 100);
    }
  };

  const typingEntries = Array.from(typingUsers.values()).filter((t) => t.username !== user?.username);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-full relative bg-transparent overflow-hidden">
      {/* Header */}
      <header className="h-[76px] flex items-center justify-between px-6 border-b border-[var(--border)] bg-[var(--bg-secondary)] backdrop-blur-md z-10">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-black text-white shadow-sm bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA]">
            {(currentRoom?.name || currentConversation?.participants.find(p => p.id !== user?.id)?.username || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 pr-4">
            <h2 className="text-base font-extrabold text-slate-800 truncate flex items-center gap-2">
              {currentRoom?.name || currentConversation?.participants.find(p => p.id !== user?.id)?.username}
              {currentRoom && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/15 text-[#8B5CF6] uppercase tracking-wider">
                  Channel
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ACTIVE NOW</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(true)}
            className="p-2.5 text-slate-500 hover:text-[#8B5CF6] hover:bg-[#8B5CF6]/8 rounded-xl transition-all border border-transparent hover:border-[#8B5CF6]/10 cursor-pointer"
            title="Search (Ctrl+F)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {currentRoom && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500 bg-white/60 px-3.5 py-2 rounded-xl border border-slate-100 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]"></span>
              {currentRoom.memberCount} MEMBERS
            </div>
          )}
        </div>
      </header>

      {showSearch && <SearchOverlay onClose={() => setShowSearch(false)} />}

      {/* Pinned Messages Header */}
      {messages.some(m => m.isPinned) && (
        <div className="bg-amber-50/70 backdrop-blur-md border-b border-amber-200/50 flex items-center gap-3 px-6 py-2 shrink-0 animate-slide-down">
          <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-600 border border-amber-500/20">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.414a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </div>
          <div className="flex-1 min-w-0 flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth">
            {messages.filter(m => m.isPinned).map(msg => (
              <button
                key={msg.id}
                onClick={() => {
                  const element = document.getElementById(`message-${msg.id}`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('highlight-flash');
                    setTimeout(() => element.classList.remove('highlight-flash'), 2000);
                  }
                }}
                className="shrink-0 flex items-center gap-2 max-w-[250px] group transition-all text-left cursor-pointer"
              >
                <span className="text-xs font-bold text-amber-700 truncate group-hover:text-amber-800">
                  {msg.sender.username}: <span className="font-medium text-slate-700">{msg.content}</span>
                </span>
              </button>
            ))}
          </div>
          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest shrink-0 ml-auto mr-1 opacity-80">
            PINNED ({messages.filter(m => m.isPinned).length})
          </p>
        </div>
      )}

      {/* Messages */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-1 bg-transparent"
      >
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 rounded-full border-3 border-[var(--accent)] border-t-transparent animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 rounded-[28px] flex items-center justify-center mb-6 shadow-sm bg-white border border-slate-100 transform transition-transform hover:scale-105">
              <svg className="w-10 h-10 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-extrabold text-lg text-slate-800 tracking-tight">No messages yet</h3>
            <p className="text-sm font-semibold text-slate-500 mt-2 max-w-[240px] leading-relaxed">Start a premium conversation in this space.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.reduce((groups: any[], message, index) => {
              const prevMessage = messages[index - 1];
              const nextMessage = messages[index + 1];

              const messageDate = new Date(message.createdAt);
              const prevMessageDate = prevMessage ? new Date(prevMessage.createdAt) : null;

              const isNewDay = !prevMessageDate ||
                messageDate.toDateString() !== prevMessageDate.toDateString();

              if (isNewDay) {
                const dateLabel = format(messageDate, 'MMMM d, yyyy');
                const isToday = messageDate.toDateString() === todayStr;
                const isYesterday = messageDate.toDateString() === yesterdayStr;

                groups.push(
                  <div key={`date-${message.id}`} className="flex items-center gap-4 my-8 animate-fade-in select-none">
                    <div className="flex-1 h-px bg-slate-200"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-white/60 px-4 py-1.5 rounded-full border border-slate-100 shadow-sm backdrop-blur-sm">
                      {isToday ? 'Today' : isYesterday ? 'Yesterday' : dateLabel}
                    </span>
                    <div className="flex-1 h-px bg-slate-200"></div>
                  </div>
                );
              }

              const isGrouped = prevMessage &&
                prevMessage.senderId === message.senderId &&
                !isNewDay &&
                (messageDate.getTime() - prevMessageDate!.getTime()) < 300000;

              const isLastInGroup = !nextMessage ||
                nextMessage.senderId !== message.senderId ||
                (new Date(nextMessage.createdAt).getTime() - messageDate.getTime()) > 300000;

              const lastReadAt = targetType === 'room'
                ? currentRoom?.lastReadAt
                : currentConversation?.participants.find(p => p.id === user?.id)?.lastReadAt;

              const isNew = lastReadAt && new Date(message.createdAt) > new Date(lastReadAt) && message.senderId !== user?.id;
              const showNewDivider = isNew && (!prevMessage || (lastReadAt && new Date(prevMessage.createdAt) <= new Date(lastReadAt)));

              groups.push(
                <div key={message.id}>
                  {showNewDivider && (
                    <div className="flex items-center gap-4 my-6 select-none">
                      <div className="flex-1 h-px bg-red-200"></div>
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-[0.15em] bg-red-50 px-3.5 py-1 rounded-full border border-red-100 shadow-sm">
                        New Messages
                      </span>
                      <div className="flex-1 h-px bg-red-200"></div>
                    </div>
                  )}
                  {index > 0 && index % 50 === 0 && (
                    <div className="my-6 p-3 rounded-2xl text-center text-xs font-bold border border-violet-100 bg-[#8B5CF6]/5 text-slate-500 shadow-sm select-none">
                      📌 Sponsored — <span className="underline cursor-pointer hover:text-[#8B5CF6] transition-colors">Join PulseChat Premium</span>
                    </div>
                  )}
                  <MessageBubble
                    message={message}
                    isOwn={message.senderId === user?.id}
                    showAvatar={!isGrouped}
                    isGrouped={isGrouped}
                    isLastInGroup={isLastInGroup}
                  />
                </div>
              );

              return groups;
            }, [])}
          </div>
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
