import { Injectable, NotFoundException, ConflictException, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const DEFAULT_ROOMS = [
  { name: 'global', description: 'General discussion for everyone', isDefault: true },
  { name: 'coding', description: 'Future of technology and coding help', isDefault: true },
  { name: 'gaming', description: 'Gaming discussions and LFG', isDefault: true },
  { name: 'random', description: 'Off-topic and fun', isDefault: true },
  { name: 'students', description: 'Student community hub', isDefault: true },
];

@Injectable()
export class RoomsService implements OnModuleInit {
  private readonly logger = new Logger(RoomsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async onModuleInit() {
    await this.seedDefaultRooms();
  }

  private async seedDefaultRooms() {
    for (const room of DEFAULT_ROOMS) {
      await this.prisma.room.upsert({
        where: { name: room.name },
        update: {},
        create: room,
      });
    }
    this.logger.log('Default rooms seeded');
  }

  private async invalidateUserRoomsCache(userId: string) {
    try {
      await this.redis.deleteCache(`user:${userId}:rooms`);
    } catch (err) {
      this.logger.error(`Redis user rooms cache invalidation error: ${err.message}`);
    }
  }

  private async invalidateRoomDetailsCache(roomId: string) {
    try {
      await this.redis.deleteCache(`room:details:${roomId}`);
    } catch (err) {
      this.logger.error(`Redis room details cache invalidation error: ${err.message}`);
    }
  }

  async listRooms(userId: string) {
    const cacheKey = `user:${userId}:rooms`;
    try {
      const cached = await this.redis.getCache(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      this.logger.error(`Redis read error: ${err.message}`);
    }

    const rooms = await this.prisma.room.findMany({
      include: { 
        members: { where: { userId } },
        _count: { select: { members: true, messages: true } } 
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
    const result = rooms.map((room) => ({
      ...room,
      memberCount: room._count.members,
      messageCount: room._count.messages,
      lastReadAt: room.members[0]?.lastReadAt || null,
      members: undefined,
      _count: undefined,
    }));

    try {
      await this.redis.setCache(cacheKey, JSON.stringify(result), 300); // 5 minutes cache
    } catch (err) {
      this.logger.error(`Redis write error: ${err.message}`);
    }

    return result;
  }

  async getRoom(id: string) {
    const cacheKey = `room:details:${id}`;
    try {
      const cached = await this.redis.getCache(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      this.logger.error(`Redis read error: ${err.message}`);
    }

    const room = await this.prisma.room.findUnique({
      where: { id },
      include: { _count: { select: { members: true } } },
    });
    if (!room) throw new NotFoundException('Room not found');
    const result = { ...room, memberCount: room._count.members, _count: undefined };

    try {
      await this.redis.setCache(cacheKey, JSON.stringify(result), 1800); // 30 minutes cache
    } catch (err) {
      this.logger.error(`Redis write error: ${err.message}`);
    }

    return result;
  }

  async createRoom(userId: string, data: { name: string; description?: string }) {
    const existing = await this.prisma.room.findUnique({ where: { name: data.name } });
    if (existing) throw new ConflictException('Room name already taken');

    const room = await this.prisma.room.create({
      data: { ...data, createdById: userId },
    });

    await this.prisma.roomMember.create({
      data: { userId, roomId: room.id },
    });

    await this.invalidateUserRoomsCache(userId);

    return room;
  }

  async joinRoom(userId: string, roomId: string) {
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');

    await this.prisma.roomMember.upsert({
      where: { userId_roomId: { userId, roomId } },
      update: {},
      create: { userId, roomId },
    });

    await this.invalidateUserRoomsCache(userId);
    await this.invalidateRoomDetailsCache(roomId);

    return { message: 'Joined room', roomId };
  }

  async leaveRoom(userId: string, roomId: string) {
    await this.prisma.roomMember.deleteMany({
      where: { userId, roomId },
    });

    await this.invalidateUserRoomsCache(userId);
    await this.invalidateRoomDetailsCache(roomId);

    return { message: 'Left room', roomId };
  }

  async getMembers(roomId: string) {
    return this.prisma.roomMember.findMany({
      where: { roomId },
      include: {
        user: {
          select: { id: true, username: true, avatar: true, isGuest: true },
        },
      },
    });
  }

  async getMessages(userId: string, roomId: string, cursor?: string, limit: number = 50) {
    const messages = await this.prisma.message.findMany({
      where: { 
        roomId,
        deletions: {
          none: { userId }
        }
      },
      include: {
        sender: { select: { id: true, username: true, avatar: true } },
        mediaFiles: true,
        parentMessage: {
          include: { sender: { select: { id: true, username: true } } }
        },
        reactions: {
          include: { user: { select: { id: true, username: true } } }
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    return messages.reverse();
  }

  async isMember(userId: string, roomId: string): Promise<boolean> {
    const member = await this.prisma.roomMember.findUnique({
      where: { userId_roomId: { userId, roomId } },
    });
    return !!member;
  }

  async getUserRooms(userId: string) {
    return this.prisma.room.findMany({
      where: {
        members: { some: { userId } },
      },
      select: { id: true },
    });
  }

  async markAsRead(userId: string, roomId: string) {
    await this.prisma.roomMember.update({
      where: { userId_roomId: { userId, roomId } },
      data: { lastReadAt: new Date() },
    });
    await this.invalidateUserRoomsCache(userId);
    return { success: true };
  }
}
