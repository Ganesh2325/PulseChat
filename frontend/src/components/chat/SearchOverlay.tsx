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
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-[2px] animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center gap-4 bg-slate-50">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            autoFocus
            type="text" 
            placeholder="Search messages, keywords, or mentions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-lg font-medium text-slate-800 focus:ring-0 placeholder:text-slate-400"
          />
          <button 
            onClick={onClose}
            className="text-[12px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
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
                  className="w-full flex items-start gap-4 p-3 hover:bg-indigo-50 rounded-xl transition-colors text-left group"
                >
                  <div className="w-10 h-10 shrink-0 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                    {msg.sender.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{msg.sender.username}</span>
                      <span className="text-[11px] font-medium text-slate-400">{format(new Date(msg.createdAt), 'MMM d, HH:mm')}</span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
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
