'use client';

import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { getSocket } from '@/lib/socket';
import { useState } from 'react';

export function ForwardingModal() {
  const { forwardingMessage, setForwardingMessage, rooms, conversations } = useChatStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  if (!forwardingMessage) return null;

  const handleForwardTo = (targetId: string, targetType: 'room' | 'conversation') => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit('message:send', {
      content: forwardingMessage.content,
      [targetType === 'room' ? 'roomId' : 'conversationId']: targetId,
      forwarded: true,
    });

    setForwardingMessage(null);
  };

  const filteredRooms = rooms.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredConvs = conversations.filter(c => {
    const otherParticipant = c.participants.find(p => p.id !== user?.id);
    return otherParticipant?.username.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/25 backdrop-blur-sm animate-fade-in" onClick={() => setForwardingMessage(null)}>
      <div 
        className="bg-white/90 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-[0_24px_50px_rgba(139,92,246,0.12)] overflow-hidden animate-pop-in border border-[var(--border)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4.5 border-b border-[var(--border)] flex items-center justify-between bg-slate-50/50">
          <h2 className="text-base font-extrabold text-slate-800">Forward Message</h2>
          <button 
            onClick={() => setForwardingMessage(null)}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors cursor-pointer text-slate-500"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          <div className="relative mb-5">
            <input 
              type="text" 
              placeholder="Search people and rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100/70 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/15 transition-all text-slate-800 placeholder-slate-400 font-semibold shadow-inner"
            />
            <svg className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            {filteredRooms.length > 0 && (
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Rooms</h3>
                <div className="space-y-1">
                  {filteredRooms.map(room => (
                    <button
                      key={room.id}
                      onClick={() => handleForwardTo(room.id, 'room')}
                      className="w-full flex items-center gap-3 p-2.5 hover:bg-[#8B5CF6]/5 rounded-xl transition-colors text-left group cursor-pointer border border-transparent hover:border-[#8B5CF6]/10"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold group-hover:bg-[#8B5CF6]/10 group-hover:text-[#8B5CF6] transition-colors">#</div>
                      <span className="font-extrabold text-slate-700 text-sm">{room.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredConvs.length > 0 && (
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Direct Messages</h3>
                <div className="space-y-1">
                  {filteredConvs.map(conv => {
                    const otherParticipant = conv.participants.find(p => p.id !== user?.id);
                    return (
                      <button
                        key={conv.id}
                        onClick={() => handleForwardTo(conv.id, 'conversation')}
                        className="w-full flex items-center gap-3 p-2.5 hover:bg-[#8B5CF6]/5 rounded-xl transition-colors text-left group cursor-pointer border border-transparent hover:border-[#8B5CF6]/10"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center font-bold">
                          {otherParticipant?.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-extrabold text-slate-700 text-sm">{otherParticipant?.username}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {filteredRooms.length === 0 && filteredConvs.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-slate-400 font-bold text-sm">No results found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
