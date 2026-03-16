'use client';

import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useChatStore } from '@/stores/chatStore';
import { usePresenceStore } from '@/stores/presenceStore';
import { useNotificationStore } from '@/stores/notificationStore';

export function useSocketEvents() {
  const addMessage = useChatStore((s) => s.addMessage);
  const { setUserOnline, setUserOffline, setTyping, clearTyping } = usePresenceStore();
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (message: any) => {
      addMessage(message);
    };

    const handlePresence = (data: { userId: string; status: string }) => {
      if (data.status === 'online') {
        setUserOnline(data.userId);
      } else {
        setUserOffline(data.userId);
      }
    };

    const handleTyping = (data: { userId: string; username: string; isTyping: boolean }) => {
      if (data.isTyping) {
        setTyping(data.userId, data.username);
      } else {
        clearTyping(data.userId);
      }
    };

    const handleNotification = (notification: any) => {
      addNotification(notification);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('PulseChat', { body: notification.content });
      }
    };

    const handleConversationNew = (conversation: any) => {
      // Force join the new conversation room
      socket.emit('conversation:join', { conversationId: conversation.id });
      // Add to store if not exists
      useChatStore.getState().fetchConversations();
    };

    const handleMessageUpdate = (updatedMessage: any) => {
      useChatStore.getState().updateMessage(updatedMessage.id, updatedMessage);
    };

    const handleMessageDelete = (data: { messageId: string; content: string; isDeleted: boolean }) => {
      useChatStore.getState().updateMessage(data.messageId, { content: data.content, isDeleted: data.isDeleted });
    };

    const handleReactionUpdate = (data: { messageId: string; reactions: any[] }) => {
      useChatStore.getState().updateReactions(data.messageId, data.reactions);
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:updated', handleMessageUpdate);
    socket.on('message:deleted', handleMessageDelete);
    socket.on('message:reaction:update', handleReactionUpdate);
    socket.on('presence:update', handlePresence);
    socket.on('typing:update', handleTyping);
    socket.on('notification:new', handleNotification);
    socket.on('conversation:new', handleConversationNew);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:updated', handleMessageUpdate);
      socket.off('message:deleted', handleMessageDelete);
      socket.off('message:reaction:update', handleReactionUpdate);
      socket.off('presence:update', handlePresence);
      socket.off('typing:update', handleTyping);
      socket.off('notification:new', handleNotification);
      socket.off('conversation:new', handleConversationNew);
    };
  }, [addMessage, setUserOnline, setUserOffline, setTyping, clearTyping, addNotification]);
}
