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

  // Advanced Lifecycle
  isEdited?: boolean;
  isDeleted?: boolean;
  isPinned?: boolean;
  isForwarded?: boolean;
  reactions?: Array<{ id: string; emoji: string; userId: string; user: { username: string } }>;
  parentMessageId?: string | null;
  parentMessage?: Message | null;
}

interface Room {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  isSponsored: boolean;
  memberCount: number;
  lastReadAt: string | null;
}

interface Conversation {
  id: string;
  type: string;
  participants: Array<{ id: string; username: string; avatar: string | null; lastReadAt?: string }>;
  lastMessage: Message | null;
  updatedAt: string;
  lastReadAt?: string;
}

interface ChatState {
  rooms: Room[];
  currentRoom: Room | null;
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  discoverableUsers: any[];
  isLoadingMessages: boolean;
  replyingTo: Message | null;

  fetchRooms: () => Promise<void>;
  setCurrentRoom: (room: Room | null) => void;
  fetchRoomMessages: (roomId: string) => Promise<void>;
  fetchConversations: () => Promise<void>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  fetchConversationMessages: (conversationId: string) => Promise<void>;
  fetchDiscoverableUsers: () => Promise<void>;
  addMessage: (message: Message) => void;
  joinRoom: (roomId: string) => Promise<void>;
  createConversation: (participantId: string) => Promise<Conversation>;
  deleteConversation: (conversationId: string) => Promise<void>;
  addOptimisticMessage: (message: Partial<Message>) => string;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  updateReactions: (messageId: string, reactions: any[]) => void;
  setReplyingTo: (message: Message | null) => void;
  forwardingMessage: Message | null;
  setForwardingMessage: (message: Message | null) => void;
  clearMessages: () => void;
  removeMessage: (messageId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: [],
  currentRoom: null,
  conversations: [],
  currentConversation: null,
  messages: [],
  discoverableUsers: [],
  isLoadingMessages: false,
  replyingTo: null,
  forwardingMessage: null,

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

  fetchDiscoverableUsers: async () => {
    const { data } = await api.get('/users/discover');
    set({ discoverableUsers: data });
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

    set((state) => {
      // Update messages
      const nextMessages = [...state.messages, optimisticMsg];
      
      // Update conversation last message in Sidebar (Optimistic)
      const nextConversations = state.conversations.map(conv => 
        conv.id === optimisticMsg.conversationId 
          ? { ...conv, lastMessage: optimisticMsg, updatedAt: optimisticMsg.createdAt }
          : conv
      );

      return {
        messages: nextMessages,
        conversations: nextConversations
      };
    });

    return tempId;
  },

  addMessage: (message) => {
    set((state) => {
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
        } else if (exists) {
          // Update existing message (useful for background sync)
          nextMessages = state.messages.map(m => m.id === message.id ? { ...m, ...message } : m);
        }
      }

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

  updateMessage: (messageId, updates) => {
    set((state) => ({
      messages: state.messages.map(m => m.id === messageId ? { ...m, ...updates } : m),
      // Also update last message in conversations if applicable
      conversations: state.conversations.map(conv => 
        conv.lastMessage?.id === messageId 
          ? { ...conv, lastMessage: { ...conv.lastMessage, ...updates } as Message }
          : conv
      )
    }));
  },

  updateReactions: (messageId, reactions) => {
    set((state) => ({
      messages: state.messages.map(m => m.id === messageId ? { ...m, reactions } : m)
    }));
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

  setReplyingTo: (message) => set({ replyingTo: message }),
  setForwardingMessage: (message) => set({ forwardingMessage: message }),

  clearMessages: () => set({ messages: [] }),
  removeMessage: (messageId) => {
    set((state) => ({
      messages: state.messages.filter(m => m.id !== messageId),
      conversations: state.conversations.map(conv => {
        if (conv.lastMessage?.id === messageId) {
          return { ...conv, lastMessage: null }; 
        }
        return conv;
      })
    }));
  },
}));
