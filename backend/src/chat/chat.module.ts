import { Module, forwardRef } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MessagesModule } from '../messages/messages.module';
import { ModerationModule } from '../moderation/moderation.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthModule } '../auth/auth.module';
import { RoomsModule } from '../rooms/rooms.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { RedisModule } from '../redis/redis.module';


@Module({
  imports: [
    MessagesModule,
    ModerationModule,
    NotificationsModule,
    AuthModule,
    RoomsModule,
    forwardRef(() => ConversationsModule),
    RedisModule,
  ],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}
