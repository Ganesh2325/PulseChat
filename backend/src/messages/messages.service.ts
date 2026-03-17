import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessageType } from '@prisma/client';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createMessage(data: {
    content: string;
    senderId: string;
    roomId?: string;
    conversationId?: string;
    type?: MessageType;
    mediaIds?: string[];
    metadata?: any;
    parentMessageId?: string;
    forwarded?: boolean;
  }) {
    const message = await this.prisma.message.create({
      data: {
        content: data.content,
        senderId: data.senderId,
        roomId: data.roomId,
        conversationId: data.conversationId,
        type: data.type || 'TEXT',
        metadata: data.metadata,
        parentMessageId: data.parentMessageId,
        forwarded: data.forwarded || false,
        mediaFiles: data.mediaIds ? {
          connect: data.mediaIds.map(id => ({ id }))
        } : undefined,
      },
      include: {
        sender: { select: { id: true, username: true, avatar: true } },
        mediaFiles: true,
        parentMessage: {
          include: { sender: { select: { id: true, username: true } } }
        },
      },
    });

    if (data.conversationId) {
      await this.prisma.conversation.update({
        where: { id: data.conversationId },
        data: { updatedAt: new Date() },
      });
    }

    return message;
  }

  async findById(id: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
      include: {
        sender: { select: { id: true, username: true, avatar: true } },
        mediaFiles: true,
        reactions: {
          include: { user: { select: { id: true, username: true } } }
        },
        replies: {
          include: { sender: { select: { id: true, username: true } } }
        },
        parentMessage: true,
      },
    });
    if (!message) throw new NotFoundException('Message not found');
    return message;
  }

  async editMessage(id: string, userId: string, newContent: string) {
    const message = await this.findById(id);
    if (message.senderId !== userId) {
      throw new Error('Not authorized to edit this message');
    }
    if (message.isDeleted) {
      throw new Error('Cannot edit a deleted message');
    }

    const history = (message.editHistory as any[]) || [];
    history.push({
      content: message.content,
      editedAt: new Date().toISOString(),
    });

    return this.prisma.message.update({
      where: { id },
      data: {
        content: newContent,
        isEdited: true,
        editHistory: history,
      },
      include: {
        sender: { select: { id: true, username: true, avatar: true } },
        mediaFiles: true,
        reactions: true,
      },
    });
  }

  async deleteMessageForEveryone(id: string, userId: string) {
    const message = await this.findById(id);
    if (message.senderId !== userId) {
      // Check for moderator/admin role if needed
      throw new Error('Not authorized to delete this message');
    }

    return this.prisma.message.update({
      where: { id },
      data: {
        content: 'This message was deleted.',
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async togglePin(id: string, userId: string) {
    const message = await this.findById(id);
    const newPinnedState = !message.isPinned;

    return this.prisma.message.update({
      where: { id },
      data: {
        isPinned: newPinnedState,
        pinnedAt: newPinnedState ? new Date() : null,
        pinnedById: newPinnedState ? userId : null,
      },
    });
  }

  async addReaction(messageId: string, userId: string, emoji: string) {
    return this.prisma.reaction.upsert({
      where: {
        userId_messageId_emoji: {
          userId,
          messageId,
          emoji,
        },
      },
      create: {
        userId,
        messageId,
        emoji,
      },
      update: {}, // No update needed for now if already exists
    });
  }

  async removeReaction(messageId: string, userId: string, emoji: string) {
    return this.prisma.reaction.delete({
      where: {
        userId_messageId_emoji: {
          userId,
          messageId,
          emoji,
        },
      },
    });
  }

  async updateStatus(messageId: string, status: 'DELIVERED' | 'READ') {
    return this.prisma.message.update({
      where: { id: messageId },
      data: { status },
    });
  }

  async search(query: string, limit: number = 20) {
    return this.prisma.message.findMany({
      where: {
        content: { contains: query, mode: 'insensitive' },
      },
      include: {
        sender: { select: { id: true, username: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async detectMentions(content: string): Promise<string[]> {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  }
}
