import { Injectable, NotFoundException, ConflictException, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_ROOMS = [
  { name: 'Global', description: 'General discussion for everyone', isDefault: true },
  { name: 'Gaming', description: 'Gaming discussions and LFG', isDefault: true },
  { name: 'Coding', description: 'Programming help and discussions', isDefault: true },
  { name: 'Students', description: 'Student community hub', isDefault: true },
  { name: 'Random', description: 'Off-topic and fun', isDefault: true },
];

@Injectable()
export class RoomsService implements OnModuleInit {
  private readonly logger = new Logger(RoomsService.name);

  constructor(private readonly prisma: PrismaService) {}

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

  async listRooms(userId: string) {
    const rooms = await this.prisma.room.findMany({
      include: { 
        members: { where: { userId } },
        _count: { select: { members: true, messages: true } } 
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
    return rooms.map((room) => ({
      ...room,
      memberCount: room._count.members,
      messageCount: room._count.messages,
      lastReadAt: room.members[0]?.lastReadAt || null,
      members: undefined,
      _count: undefined,
    }));
  }

  async getRoom(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: { _count: { select: { members: true } } },
    });
    if (!room) throw new NotFoundException('Room not found');
    return { ...room, memberCount: room._count.members, _count: undefined };
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

    return { message: 'Joined room', roomId };
  }

  async leaveRoom(userId: string, roomId: string) {
    await this.prisma.roomMember.deleteMany({
      where: { userId, roomId },
    });
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

  async getMessages(roomId: string, cursor?: string, limit: number = 50) {
    const messages = await this.prisma.message.findMany({
      where: { roomId },
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
    return { success: true };
  }
}
