import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  async listConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: { some: { userId } },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, username: true, avatar: true, isGuest: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { id: true, username: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return conversations.map((conv) => ({
      id: conv.id,
      type: conv.type,
      participants: conv.participants.map((p) => ({
        ...p.user,
        lastReadAt: p.lastReadAt,
      })),
      lastMessage: conv.messages[0] || null,
      updatedAt: conv.updatedAt,
    }));
  }

  async findOrCreate(userId: string, participantId: string) {
    const existing = await this.prisma.conversation.findFirst({
      where: {
        type: 'DIRECT',
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: participantId } } },
        ],
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, username: true, avatar: true } },
          },
        },
      },
    });

    if (existing) return existing;

    return this.prisma.conversation.create({
      data: {
        type: 'DIRECT',
        participants: {
          create: [
            { userId },
            { userId: participantId },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, username: true, avatar: true } },
          },
        },
      },
    });
  }

  async getConversation(userId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: { select: { id: true, username: true, avatar: true, isGuest: true } },
          },
        },
      },
    });

    if (!conversation) throw new NotFoundException('Conversation not found');

    const isParticipant = conversation.participants.some((p) => p.userId === userId);
    if (!isParticipant) throw new ForbiddenException('Not a participant');

    return conversation;
  }

  async getMessages(conversationId: string, cursor?: string, limit: number = 50) {
    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, username: true, avatar: true } },
        mediaFiles: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    return messages.reverse();
  }

  async markAsRead(userId: string, conversationId: string) {
    await this.prisma.conversationParticipant.updateMany({
      where: { userId, conversationId },
      data: { lastReadAt: new Date() },
    });
    return { success: true };
  }

  async isParticipant(userId: string, conversationId: string): Promise<boolean> {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: { userId_conversationId: { userId, conversationId } },
    });
    return !!participant;
  }

  async getUserConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        participants: { some: { userId } },
      },
      select: { id: true },
    });
  }
}
