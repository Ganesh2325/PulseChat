'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
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
    }, 450);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleJumpTo = (message: any) => {
    const element = document.getElementById(`message-${message.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight-flash');
      setTimeout(() => element.classList.remove('highlight-flash'), 2000);
      onClose();
    } else {
       window.alert('Message found in another room/conversation. Navigation coming soon.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-slate-900/25 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white/90 backdrop-blur-xl w-full max-w-2xl rounded-[30px] shadow-[0_24px_50px_-12px_rgba(139,92,246,0.12)] overflow-hidden animate-slide-up border border-[var(--border)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-[var(--border)] flex items-center gap-4 bg-slate-50/50">
          <svg className="w-5 h-5 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            autoFocus
            type="text" 
            placeholder="Search messages, keywords, or mentions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-[17px] font-bold text-slate-800 focus:ring-0 placeholder-slate-400 outline-none"
          />
          <button 
            onClick={onClose}
            className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200/60 hover:bg-slate-200 hover:text-slate-600 transition-all cursor-pointer"
          >
            Esc
          </button>
        </div>

        <div className="max-h-[450px] overflow-y-auto p-3 custom-scrollbar min-h-[120px]">
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-[#8B5CF6] border-t-transparent animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => handleJumpTo(msg)}
                  className="w-full flex items-start gap-4 p-4 hover:bg-[#8B5CF6]/5 rounded-2xl transition-all text-left group border border-transparent hover:border-[#8B5CF6]/10 cursor-pointer"
                >
                  <div className="w-10 h-10 shrink-0 rounded-2xl bg-[#8B5CF6]/10 flex items-center justify-center font-black text-[#8B5CF6] shadow-sm select-none">
                    {msg.sender.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 select-none">
                      <span className="font-extrabold text-slate-800 text-[14px] group-hover:text-[#8B5CF6] transition-colors">{msg.sender.username}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{format(new Date(msg.createdAt), 'MMM d, HH:mm')}</span>
                    </div>
                    <p className="text-[14px] text-slate-600 line-clamp-2 leading-relaxed font-semibold">
                      {msg.content}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="py-12 text-center select-none">
              <p className="text-slate-400 font-bold text-sm">No messages matching &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 select-none">
              <svg className="w-10 h-10 mx-auto mb-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.246.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-[13px] font-bold tracking-tight">Search for anything from your chat history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
