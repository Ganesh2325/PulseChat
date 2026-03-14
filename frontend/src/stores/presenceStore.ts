import { create } from 'zustand';

interface PresenceState {
  onlineUsers: Set<string>;
  typingUsers: Map<string, { username: string; timeout: NodeJS.Timeout }>;

  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;
  setTyping: (userId: string, username: string) => void;
  clearTyping: (userId: string) => void;
  isOnline: (userId: string) => boolean;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineUsers: new Set<string>(),
  typingUsers: new Map(),

  setUserOnline: (userId) => {
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      newSet.add(userId);
      return { onlineUsers: newSet };
    });
  },

  setUserOffline: (userId) => {
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      newSet.delete(userId);
      return { onlineUsers: newSet };
    });
  },

  setTyping: (userId, username) => {
    set((state) => {
      const newMap = new Map(state.typingUsers);
      const existing = newMap.get(userId);
      if (existing) clearTimeout(existing.timeout);

      const timeout = setTimeout(() => {
        get().clearTyping(userId);
      }, 5000);

      newMap.set(userId, { username, timeout });
      return { typingUsers: newMap };
    });
  },

  clearTyping: (userId) => {
    set((state) => {
      const newMap = new Map(state.typingUsers);
      const existing = newMap.get(userId);
      if (existing) clearTimeout(existing.timeout);
      newMap.delete(userId);
      return { typingUsers: newMap };
    });
  },

  isOnline: (userId) => get().onlineUsers.has(userId),
}));
