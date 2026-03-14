import { Controller, Get, Put, Body, Param, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUser('sub') userId: string) {
    return this.usersService.findById(userId);
  }

  @Put('profile')
  async updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() data: { username?: string; bio?: string; avatar?: string; language?: string },
  ) {
    return this.usersService.updateProfile(userId, data);
  }

  @Get('search')
  async searchUsers(@Query('q') query: string) {
    return this.usersService.searchUsers(query);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get(':id/presence')
  async getPresence(@Param('id') id: string) {
    return this.usersService.getPresence(id);
  }
}
