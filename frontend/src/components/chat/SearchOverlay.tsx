'use client';

import { useState, useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import api from '@/lib/api';
import { format } from 'date-fns';

export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await api.get(`/messages/search/${encodeURIComponent(query)}`);
        setResults(data);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleJumpTo = (message: any) => {
    // Logic to open the room/conversation and scroll to the message 
    // This requires some complexity in chatStore, but for now we'll just jump if in the same view
    const element = document.getElementById(`message-${message.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight-flash');
      setTimeout(() => element.classList.remove('highlight-flash'), 2000);
      onClose();
    } else {
       // Future: Open the room/conversation first
       window.alert('Message found in another room/conversation. Navigation coming soon.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-xl animate-fade-in" onClick={onClose}>
      <div 
        className="bg-[var(--bg-surface-l3)] w-full max-w-2xl rounded-[32px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)] overflow-hidden animate-slide-up border border-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/5 flex items-center gap-5 bg-[var(--bg-secondary)]/50">
          <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            autoFocus
            type="text" 
            placeholder="Search messages, keywords, or mentions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-[18px] font-black text-white focus:ring-0 placeholder:text-[var(--text-muted)]"
          />
          <button 
            onClick={onClose}
            className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] hover:text-white transition-colors px-3 py-1.5 bg-white/5 rounded-lg border border-white/5"
          >
            Esc
          </button>
        </div>

        <div className="max-h-[500px] overflow-y-auto p-2 custom-scrollbar min-h-[100px]">
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => handleJumpTo(msg)}
                  className="w-full flex items-start gap-4 p-4 hover:bg-white/5 rounded-2xl transition-all text-left group border border-transparent hover:border-white/5"
                >
                  <div className="w-10 h-10 shrink-0 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center font-black text-[var(--accent)] shadow-sm">
                    {msg.sender.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-white text-[14px] group-hover:text-[var(--accent)] transition-colors">{msg.sender.username}</span>
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">{format(new Date(msg.createdAt), 'MMM d, HH:mm')}</span>
                    </div>
                    <p className="text-[14px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed font-medium">
                      {msg.content}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="py-12 text-center">
              <p className="text-slate-400 font-medium">No messages matching "{query}"</p>
            </div>
          ) : (
            <div className="py-12 text-center opacity-40">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.246.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-[14px] font-medium tracking-tight">Search for anything from your history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
