'use client';

import { useRef, useEffect, useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { usePresenceStore } from '@/stores/presenceStore';
import { getSocket } from '@/lib/socket';
import { MessageBubble } from './MessageBubble';
import { MessageComposer } from './MessageComposer';
import { TypingIndicator } from './TypingIndicator';
import { SearchOverlay } from './SearchOverlay';

export function ChatView() {
  const { currentRoom, currentConversation, messages, isLoadingMessages } = useChatStore();
  const { user } = useAuthStore();
  const { typingUsers } = usePresenceStore();
  const [showSearch, setShowSearch] = useState(false);
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
    <div className="flex flex-col h-full relative bg-[var(--bg-primary)] overflow-hidden">
      {/* Header */}
      <header className="h-[76px] flex items-center justify-between px-6 border-b border-white/5 bg-[var(--bg-secondary)]/80 backdrop-blur-3xl z-10">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-[0_0_20px_var(--accent-glow)]" style={{ background: 'linear-gradient(135deg, var(--accent), #7e22ce)' }}>
            {(currentRoom?.name || currentConversation?.participants.find(p => p.id !== user?.id)?.username || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 pr-4">
            <h2 className="text-[17px] font-black text-[var(--text-primary)] truncate flex items-center gap-2">
              {currentRoom?.name || currentConversation?.participants.find(p => p.id !== user?.id)?.username}
              {currentRoom && <span className="text-[var(--text-muted)] text-[12px] font-black px-2 py-0.5 rounded-full bg-white/5 border border-white/10 uppercase tracking-tighter opacity-80">Channel</span>}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
              <span className="text-xs font-black text-[var(--text-secondary)] opacity-80">ACTIVE NOW</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSearch(true)}
            className="p-3 text-[var(--text-secondary)] hover:text-white hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10 hover:shadow-xl"
            title="Search (Ctrl+F)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
          
          {currentRoom && (
            <div className="hidden sm:flex items-center gap-2 text-[12px] font-black text-[var(--text-secondary)] bg-white/5 px-4 py-2 rounded-2xl border border-white/5 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              {currentRoom.memberCount} MEMBERS
            </div>
          )}
        </div>
      </header>

      {showSearch && <SearchOverlay onClose={() => setShowSearch(false)} />}

      {/* Pinned Messages Header */}
      {messages.some(m => m.isPinned) && (
        <div className="bg-amber-500/10 backdrop-blur-xl border-b border-white/5 flex items-center gap-3 px-6 py-2 shrink-0 animate-slide-down">
          <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                className="shrink-0 flex items-center gap-3 max-w-[250px] group transition-all"
              >
                <span className="text-[12px] font-black text-amber-400 truncate group-hover:text-amber-300">
                  {msg.sender.username}: <span className="font-bold text-[var(--text-primary)] opacity-80">{msg.content}</span>
                </span>
              </button>
            ))}
          </div>
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] shrink-0 ml-auto mr-1 opacity-60">
            PINNED ({messages.filter(m => m.isPinned).length})
          </p>
        </div>
      )}

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
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-24 h-24 rounded-[32px] flex items-center justify-center mb-8 shadow-2xl bg-white/5 border border-white/5 transform transition-transform hover:scale-110">
              <svg className="w-12 h-12 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-black text-[22px] text-white tracking-tight">No messages yet</h3>
            <p className="text-[15px] font-bold text-[var(--text-secondary)] mt-3 max-w-[200px] opacity-80">Start a cinematic conversation in this space.</p>
          </div>
        ) : (
          <>
            {/* Native ad placeholder (roughly every 50 messages) */}
            {messages.map((message, index) => {
              const prevMessage = messages[index - 1];
              const nextMessage = messages[index + 1];
              
              const isGrouped = prevMessage && 
                               prevMessage.senderId === message.senderId && 
                               (new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime()) < 300000;
              
              const isLastInGroup = !nextMessage || 
                                   nextMessage.senderId !== message.senderId || 
                                   (new Date(nextMessage.createdAt).getTime() - new Date(message.createdAt).getTime()) > 300000;

              const lastReadAt = targetType === 'room' 
                ? currentRoom?.lastReadAt 
                : currentConversation?.participants.find(p => p.id === user?.id)?.lastReadAt;
              
              const isNew = lastReadAt && new Date(message.createdAt) > new Date(lastReadAt) && message.senderId !== user?.id;
              const showNewDivider = isNew && (!prevMessage || (lastReadAt && new Date(prevMessage.createdAt) <= new Date(lastReadAt)));

              return (
                <div key={message.id}>
                  {showNewDivider && (
                    <div className="flex items-center gap-4 my-8">
                      <div className="flex-1 h-px bg-red-500/20"></div>
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20 shadow-lg">New Messages</span>
                      <div className="flex-1 h-px bg-red-500/20"></div>
                    </div>
                  )}
                  {index > 0 && index % 50 === 0 && (
                    <div className="my-6 p-4 rounded-2xl text-center text-[11px] font-black uppercase tracking-widest border border-white/5 bg-white/5 text-[var(--text-muted)] shadow-inner">
                      📌 Sponsored — <span className="underline cursor-pointer hover:text-white transition-colors">Join PulseChat Premium</span>
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
            })}
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
