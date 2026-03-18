'use client';

import { useChatStore } from '@/stores/chatStore';

interface RoomListProps {
  onRoomClick: (room: any) => void;
  currentRoomId?: string;
}

export function RoomList({ onRoomClick, currentRoomId }: RoomListProps) {
  const { rooms, fetchRooms } = useChatStore();

  if (rooms.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-[11px] text-[var(--text-muted)] italic mb-2 opacity-60">No channels found.</p>
        <button 
          onClick={() => fetchRooms()}
          className="text-[10px] text-[var(--accent)] font-bold uppercase tracking-wider hover:underline"
        >
          Retry Discovery
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {rooms.map((room) => (
        <button
          key={room.id}
          onClick={() => onRoomClick(room)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-all duration-150 group"
          style={{
            background: currentRoomId === room.id ? 'var(--bg-active)' : 'transparent',
            color: currentRoomId === room.id ? 'var(--text-primary)' : 'var(--text-secondary)',
          }}
          onMouseEnter={(e) => { if (currentRoomId !== room.id) e.currentTarget.style.background = 'var(--bg-hover)'; }}
          onMouseLeave={(e) => { if (currentRoomId !== room.id) e.currentTarget.style.background = 'transparent'; }}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${currentRoomId === room.id ? 'bg-[var(--accent)] text-white shadow-[0_0_15px_var(--accent-glow)]' : 'bg-white/5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'}`}>
            {room.isDefault ? '#' : '🔒'}
          </div>
          <span className="truncate flex-1 text-left font-bold">{room.name}</span>
          {room.isSponsored && <span className="text-[10px] opacity-50 bg-white/10 px-1.5 py-0.5 rounded uppercase tracking-tighter">PRO</span>}
        </button>
      ))}
    </div>
  );
}
