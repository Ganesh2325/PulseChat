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
  isOptimistic?: boolean;
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
  deleteConversation: (conversationId: string) => Promise<void>;
  addOptimisticMessage: (message: Partial<Message>) => string;
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

  deleteConversation: async (conversationId) => {
    try {
      set((state) => ({
        conversations: state.conversations.filter(c => c.id !== conversationId),
        currentConversation: state.currentConversation?.id === conversationId ? null : state.currentConversation
      }));
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  },

  addOptimisticMessage: (msgData) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      content: msgData.content || '',
      type: msgData.type || 'TEXT',
      status: 'SENDING',
      senderId: msgData.senderId || '',
      sender: msgData.sender || { id: '', username: '', avatar: null },
      createdAt: new Date().toISOString(),
      isOptimistic: true,
      roomId: msgData.roomId,
      conversationId: msgData.conversationId,
    };

    set((state) => ({
      messages: [...state.messages, optimisticMsg]
    }));

    return tempId;
  },

  addMessage: (message) => {
    set((state) => {
      // 1. Check if this real message should replace an optimistic one
      // We look for a message with the same content and sender sent in the last 5 seconds
      const optimisticMatch = state.messages.find(m => 
        m.isOptimistic && 
        m.content === message.content && 
        m.senderId === message.senderId &&
        (new Date(message.createdAt).getTime() - new Date(m.createdAt).getTime()) < 5000
      );

      let nextMessages = state.messages;
      if (optimisticMatch) {
        nextMessages = state.messages.map(m => m.id === optimisticMatch.id ? message : m);
      } else {
        const isRelevant = (state.currentRoom && message.roomId === state.currentRoom.id) ||
                          (state.currentConversation && message.conversationId === state.currentConversation.id);
        const exists = state.messages.some((m) => m.id === message.id);
        
        if (isRelevant && !exists) {
          nextMessages = [...state.messages, message];
        }
      }

      // 2. Update conversations list
      let nextConversations = state.conversations;
      if (message.conversationId) {
        nextConversations = state.conversations.map(conv => 
          conv.id === message.conversationId 
            ? { ...conv, lastMessage: message, updatedAt: message.createdAt }
            : conv
        );
      }

      return { 
        messages: nextMessages,
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
      set({ conversations: [data, ...conversations] });
    }
    return data;
  },

  clearMessages: () => set({ messages: [] }),
}));
