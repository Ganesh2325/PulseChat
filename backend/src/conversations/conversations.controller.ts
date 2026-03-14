import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  async listConversations(@CurrentUser('sub') userId: string) {
    return this.conversationsService.listConversations(userId);
  }

  @Post()
  async createConversation(
    @CurrentUser('sub') userId: string,
    @Body() data: { participantId: string },
  ) {
    return this.conversationsService.findOrCreate(userId, data.participantId);
  }

  @Get(':id')
  async getConversation(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.conversationsService.getConversation(userId, id);
  }

  @Get(':id/messages')
  async getMessages(
    @Param('id') conversationId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    return this.conversationsService.getMessages(conversationId, cursor, limit || 50);
  }

  @Post(':id/read')
  async markAsRead(@CurrentUser('sub') userId: string, @Param('id') conversationId: string) {
    return this.conversationsService.markAsRead(userId, conversationId);
  }
}
