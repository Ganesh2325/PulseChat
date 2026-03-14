import { create } from 'zustand';
import api from '@/lib/api';

interface Message {
  id: string;
  content: string;
  type: string;
  status: string;
  senderId: string;
  sender: { id: string; username: string; avatar: string | null };
  roomId?: string;
  conversationId?: string;
  mediaFiles?: any[];
  createdAt: string;
}

interface Room {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  isSponsored: boolean;
  memberCount: number;
}

interface Conversation {
  id: string;
  type: string;
  participants: Array<{ id: string; username: string; avatar: string | null; lastReadAt?: string }>;
  lastMessage: Message | null;
  updatedAt: string;
}

interface ChatState {
  rooms: Room[];
  currentRoom: Room | null;
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoadingMessages: boolean;

  fetchRooms: () => Promise<void>;
  setCurrentRoom: (room: Room | null) => void;
  fetchRoomMessages: (roomId: string) => Promise<void>;
  fetchConversations: () => Promise<void>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  fetchConversationMessages: (conversationId: string) => Promise<void>;
  addMessage: (message: Message) => void;
  joinRoom: (roomId: string) => Promise<void>;
  createConversation: (participantId: string) => Promise<Conversation>;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: [],
  currentRoom: null,
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoadingMessages: false,

  fetchRooms: async () => {
    const { data } = await api.get('/rooms');
    set({ rooms: data });
  },

  setCurrentRoom: (room) => {
    set({ currentRoom: room, currentConversation: null, messages: [] });
  },

  fetchRoomMessages: async (roomId) => {
    set({ isLoadingMessages: true });
    try {
      const { data } = await api.get(`/rooms/${roomId}/messages`);
      set({ messages: data });
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  fetchConversations: async () => {
    const { data } = await api.get('/conversations');
    set({ conversations: data });
  },

  setCurrentConversation: (conversation) => {
    set({ currentConversation: conversation, currentRoom: null, messages: [] });
  },

  fetchConversationMessages: async (conversationId) => {
    set({ isLoadingMessages: true });
    try {
      const { data } = await api.get(`/conversations/${conversationId}/messages`);
      set({ messages: data });
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  addMessage: (message) => {
    set((state) => {
      // 1. Check if the message is for the currently active view
      const isRelevant = (state.currentRoom && message.roomId === state.currentRoom.id) ||
                        (state.currentConversation && message.conversationId === state.currentConversation.id);
      
      const exists = state.messages.some((m) => m.id === message.id);
      
      // 2. Update conversations list with the last message preview (affects Sidebar)
      let nextConversations = state.conversations;
      if (message.conversationId) {
        nextConversations = state.conversations.map(conv => 
          conv.id === message.conversationId 
            ? { ...conv, lastMessage: message, updatedAt: message.createdAt }
            : conv
        );
      }

      // 3. Update active message list if relevant
      if (!isRelevant || exists) return { conversations: nextConversations };
      
      return { 
        messages: [...state.messages, message],
        conversations: nextConversations
      };
    });
  },

  joinRoom: async (roomId) => {
    await api.post(`/rooms/${roomId}/join`);
  },

  createConversation: async (participantId) => {
    const { data } = await api.post('/conversations', { participantId });
    const { conversations } = get();
    const exists = conversations.find((c) => c.id === data.id);
    if (!exists) {
      set({ conversations: [...conversations, data] });
    }
    return data;
  },

  clearMessages: () => set({ messages: [] }),
}));
