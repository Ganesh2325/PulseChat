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

    socket.on('message:new', handleNewMessage);
    socket.on('presence:update', handlePresence);
    socket.on('typing:update', handleTyping);
    socket.on('notification:new', handleNotification);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('presence:update', handlePresence);
      socket.off('typing:update', handleTyping);
      socket.off('notification:new', handleNotification);
    };
  }, [addMessage, setUserOnline, setUserOffline, setTyping, clearTyping, addNotification]);
}
