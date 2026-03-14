import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  async listRooms() {
    return this.roomsService.listRooms();
  }

  @Get(':id')
  async getRoom(@Param('id') id: string) {
    return this.roomsService.getRoom(id);
  }

  @Post()
  async createRoom(
    @CurrentUser('sub') userId: string,
    @Body() data: { name: string; description?: string },
  ) {
    return this.roomsService.createRoom(userId, data);
  }

  @Post(':id/join')
  async joinRoom(@CurrentUser('sub') userId: string, @Param('id') roomId: string) {
    return this.roomsService.joinRoom(userId, roomId);
  }

  @Post(':id/leave')
  async leaveRoom(@CurrentUser('sub') userId: string, @Param('id') roomId: string) {
    return this.roomsService.leaveRoom(userId, roomId);
  }

  @Get(':id/members')
  async getMembers(@Param('id') roomId: string) {
    return this.roomsService.getMembers(roomId);
  }

  @Get(':id/messages')
  async getMessages(
    @Param('id') roomId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    return this.roomsService.getMessages(roomId, cursor, limit || 50);
  }
}
