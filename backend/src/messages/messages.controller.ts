import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get(':id')
  async getMessage(@Param('id') id: string) {
    return this.messagesService.findById(id);
  }

  @Get('search/:query')
  async searchMessages(@Param('query') query: string, @Query('limit') limit?: number) {
    return this.messagesService.search(query, limit || 20);
  }
}
