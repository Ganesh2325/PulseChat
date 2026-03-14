import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listNotifications(userId: string, limit: number = 20) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, read: false },
    });
    return { count };
  }

  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { success: true };
  }

  async createNotification(data: {
    userId: string;
    type: 'MENTION' | 'MESSAGE' | 'ROOM_INVITE' | 'SYSTEM';
    content: string;
    referenceId?: string;
  }) {
    return this.prisma.notification.create({ data });
  }

  async createMentionNotifications(usernames: string[], messageId: string, senderId: string) {
    const users = await this.prisma.user.findMany({
      where: {
        username: { in: usernames },
        id: { not: senderId },
      },
    });

    const notifications = users.map((user) => ({
      userId: user.id,
      type: 'MENTION' as const,
      content: `You were mentioned in a message`,
      referenceId: messageId,
    }));

    if (notifications.length > 0) {
      await this.prisma.notification.createMany({ data: notifications });
      this.logger.log(`Created ${notifications.length} mention notifications`);
    }
  }
}
