import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { RoomsService } from '../rooms/rooms.service';
import { ConversationsService } from '../conversations/conversations.service';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { MessagesService } from '../messages/messages.service';
import { ModerationService } from '../moderation/moderation.service';
import { NotificationsService } from '../notifications/notifications.service';

interface AuthenticatedSocket extends Socket {
  data: { user: { sub: string; username: string; role: string } };
}

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/',
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
    private readonly messagesService: MessagesService,
    private readonly moderationService: ModerationService,
    private readonly notificationsService: NotificationsService,
    private readonly roomsService: RoomsService,
    private readonly conversationsService: ConversationsService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET,
      });

      client.data.user = payload;
      const userId = payload.sub;

      await this.redis.mapSocketToUser(client.id, userId);
      await this.redis.setUserOnline(userId);

      // Join personal room
      client.join(`user:${userId}`);

      // Auto-join all rooms user is a member of
      const userRooms = await this.roomsService.getUserRooms(userId);
      userRooms.forEach((room: { id: string }) => {
        client.join(`room:${room.id}`);
      });

      // Auto-join all existing conversations
      const userConversations = await this.conversationsService.getUserConversations(userId);
      userConversations.forEach((conv: { id: string }) => {
        client.join(`conversation:${conv.id}`);
      });

      this.server.emit('presence:update', { userId, status: 'online' });
      this.logger.log(`Client connected: ${payload.username} (${client.id}) and joined ${userRooms.length} rooms and ${userConversations.length} conversations`);
    } catch (error) {
      this.logger.warn(`Connection rejected: ${error instanceof Error ? error.message : 'Invalid token'}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    const userId = await this.redis.unmapSocket(client.id);
    if (userId) {
      const remaining = await this.redis.getUserSockets(userId);
      if (remaining.length === 0) {
        await this.redis.setUserOffline(userId);
        this.server.emit('presence:update', { userId, status: 'offline', lastSeen: new Date().toISOString() });
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('room:join')
  async handleRoomJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    client.join(`room:${data.roomId}`);
    this.logger.debug(`${client.data.user.username} joined room:${data.roomId}`);
    return { event: 'room:joined', data: { roomId: data.roomId } };
  }

  @SubscribeMessage('room:leave')
  async handleRoomLeave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    client.leave(`room:${data.roomId}`);
    return { event: 'room:left', data: { roomId: data.roomId } };
  }

  @SubscribeMessage('message:send')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: {
      content: string;
      roomId?: string;
      conversationId?: string;
      type?: string;
      mediaIds?: string[];
      parentMessageId?: string;
      forwarded?: boolean;
    },
  ) {
    const userId = client.data.user.sub;
    this.logger.debug(`Message from ${client.data.user.username}: content len=${data.content?.length}, media=${data.mediaIds?.length}, room=${data.roomId}, conv=${data.conversationId}`);


    const allowed = await this.redis.checkRateLimit(`msg:${userId}`, 30, 60);
    if (!allowed) {
      client.emit('error', { message: 'Rate limit exceeded. Please slow down.' });
      return;
    }

    const moderation = this.moderationService.validateMessage(data.content);
    if (!moderation.valid) {
      client.emit('error', { message: moderation.reason });
      return;
    }

    const cleanContent = moderation.filtered || data.content;

    const message = await this.messagesService.createMessage({
      content: cleanContent,
      senderId: userId,
      roomId: data.roomId,
      conversationId: data.conversationId,
      type: (data.type as any) || 'TEXT',
      mediaIds: data.mediaIds,
      parentMessageId: data.parentMessageId,
      forwarded: !!data.forwarded,
    });

    if (data.roomId) {
      this.server.to(`room:${data.roomId}`).emit('message:new', message);
    } else if (data.conversationId) {
      this.server.to(`conversation:${data.conversationId}`).emit('message:new', message);
    }

    client.emit('message:ack', { messageId: message.id, status: 'SENT' });

    const mentions = await this.messagesService.detectMentions(cleanContent);
    if (mentions.length > 0) {
      await this.notificationsService.createMentionNotifications(mentions, message.id, userId);
    }
  }

  @SubscribeMessage('message:delivered')
  async handleDelivered(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string },
  ) {
    await this.messagesService.updateStatus(data.messageId, 'DELIVERED');
  }

  @SubscribeMessage('message:read')
  async handleRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string; conversationId?: string; roomId?: string },
  ) {
    await this.messagesService.updateStatus(data.messageId, 'READ');
    const target = data.conversationId ? `conversation:${data.conversationId}` : `room:${data.roomId}`;
    this.server.to(target).emit('message:read', {
      messageId: data.messageId,
      userId: client.data.user.sub,
    });
  }

  @SubscribeMessage('typing:start')
  async handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { targetId: string; targetType: 'room' | 'conversation' },
  ) {
    const userId = client.data.user.sub;
    await this.redis.setTyping(userId, data.targetId, data.targetType);
    const target = `${data.targetType}:${data.targetId}`;
    client.to(target).emit('typing:update', {
      userId,
      username: client.data.user.username,
      isTyping: true,
    });
  }

  @SubscribeMessage('typing:stop')
  async handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { targetId: string; targetType: 'room' | 'conversation' },
  ) {
    const userId = client.data.user.sub;
    await this.redis.clearTyping(userId, data.targetId, data.targetType);
    const target = `${data.targetType}:${data.targetId}`;
    client.to(target).emit('typing:update', {
      userId,
      username: client.data.user.username,
      isTyping: false,
    });
  }

  @SubscribeMessage('message:edit')
  async handleMessageEdit(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string; content: string },
  ) {
    const userId = client.data.user.sub;
    const updatedMessage = await this.messagesService.editMessage(data.messageId, userId, data.content);

    const target = updatedMessage.roomId ? `room:${updatedMessage.roomId}` : `conversation:${updatedMessage.conversationId}`;
    this.server.to(target).emit('message:updated', updatedMessage);
  }

  @SubscribeMessage('message:delete')
  async handleMessageDelete(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string },
  ) {
    const userId = client.data.user.sub;
    const deletedMessage = await this.messagesService.deleteMessageForEveryone(data.messageId, userId);

    const target = deletedMessage.roomId ? `room:${deletedMessage.roomId}` : `conversation:${deletedMessage.conversationId}`;
    this.server.to(target).emit('message:updated', deletedMessage);
  }

  @SubscribeMessage('message:delete:me')
  async handleMessageDeleteMe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string },
  ) {
    const userId = client.data.user.sub;
    await this.messagesService.deleteMessageForMe(data.messageId, userId);
    // Broadcast to all user's sessions for multi-device sync
    this.server.to(`user:${userId}`).emit('message:deleted:me', { messageId: data.messageId });
  }

  @SubscribeMessage('message:react')
  async handleMessageReact(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string; emoji: string },
  ) {
    const userId = client.data.user.sub;
    await this.messagesService.addReaction(data.messageId, userId, data.emoji);

    const message = await this.messagesService.findById(data.messageId);
    const target = message.roomId ? `room:${message.roomId}` : `conversation:${message.conversationId}`;
    
    this.server.to(target).emit('message:reaction:update', {
      messageId: data.messageId,
      reactions: message.reactions,
    });
  }

  @SubscribeMessage('message:unreact')
  async handleMessageUnreact(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string; emoji: string },
  ) {
    const userId = client.data.user.sub;
    await this.messagesService.removeReaction(data.messageId, userId, data.emoji);

    const message = await this.messagesService.findById(data.messageId);
    const target = message.roomId ? `room:${message.roomId}` : `conversation:${message.conversationId}`;
    
    this.server.to(target).emit('message:reaction:update', {
      messageId: data.messageId,
      reactions: message.reactions,
    });
  }

  @SubscribeMessage('message:pin:toggle')
  async handleMessagePin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string },
  ) {
    const userId = client.data.user.sub;
    const message = await this.messagesService.togglePin(data.messageId, userId);
    
    if (message.roomId) {
      this.server.to(`room:${message.roomId}`).emit('message:updated', message);
    } else if (message.conversationId) {
      this.server.to(`conversation:${message.conversationId}`).emit('message:updated', message);
    }
  }

  @SubscribeMessage('mark:read')
  async handleMarkRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId?: string; conversationId?: string },
  ) {
    const userId = client.data.user.sub;
    
    if (data.roomId) {
      await this.roomsService.markAsRead(userId, data.roomId);
      // Optionally notify others in the room or just acknowledge
    } else if (data.conversationId) {
      await this.conversationsService.markAsRead(userId, data.conversationId);
      // For DMs, notify the other participant that messages were read
      this.server.to(`conversation:${data.conversationId}`).emit('conversation:read', { 
        conversationId: data.conversationId, 
        userId, 
        readAt: new Date() 
      });
    }
  }

  @SubscribeMessage('conversation:join')
  async handleConversationJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.join(`conversation:${data.conversationId}`);
    return { event: 'conversation:joined', data: { conversationId: data.conversationId } };
  }

  @SubscribeMessage('conversation:leave')
  async handleConversationLeave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.leave(`conversation:${data.conversationId}`);
  }
}
