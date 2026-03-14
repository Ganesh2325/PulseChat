import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = this.extractToken(client);

      if (!token) {
        throw new WsException('Authentication token not provided');
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      client.data.user = payload;
      return true;
    } catch (error) {
      this.logger.warn(`WebSocket auth failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new WsException('Unauthorized');
    }
  }

  private extractToken(client: Socket): string | null {
    const auth = client.handshake?.auth?.token
      || client.handshake?.headers?.authorization?.replace('Bearer ', '');
    return auth || null;
  }
}
