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
  }) {
    const message = await this.prisma.message.create({
      data: {
        content: data.content,
        senderId: data.senderId,
        roomId: data.roomId,
        conversationId: data.conversationId,
        type: data.type || 'TEXT',
        metadata: data.metadata,
        mediaFiles: data.mediaIds ? {
          connect: data.mediaIds.map(id => ({ id }))
        } : undefined,
      },
      include: {
        sender: { select: { id: true, username: true, avatar: true } },
        mediaFiles: true,
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
      },
    });
    if (!message) throw new NotFoundException('Message not found');
    return message;
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
