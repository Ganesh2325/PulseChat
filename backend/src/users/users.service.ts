import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, username: true, role: true, status: true,
        avatar: true, bio: true, isGuest: true, lastSeen: true, language: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, data: { username?: string; bio?: string; avatar?: string; language?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true, email: true, username: true, role: true, status: true,
        avatar: true, bio: true, isGuest: true, language: true,
      },
    });
  }

  async searchUsers(query: string) {
    if (!query || query.length < 2) return [];
    return this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
        status: 'ACTIVE',
      },
      select: { id: true, username: true, avatar: true, bio: true, isGuest: true },
      take: 20,
    });
  }

  async getPresence(userId: string) {
    const presence = await this.redis.getUserPresence(userId);
    return presence || { status: 'offline', lastSeen: null };
  }

  async updateLastSeen(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastSeen: new Date() },
    });
  }
}
