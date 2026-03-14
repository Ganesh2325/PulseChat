import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  public readonly client: Redis;
  public readonly subscriber: Redis;
  public readonly publisher: Redis;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    
    const redisConfig = redisUrl ? redisUrl : {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD', ''),
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
    };

    this.client = new Redis(redisConfig as any);
    this.subscriber = new Redis(redisConfig as any);
    this.publisher = new Redis(redisConfig as any);

    this.client.on('connect', () => this.logger.log('Redis client connected'));
    this.client.on('error', (err) => this.logger.error('Redis client error', err.message));
  }

  async onModuleDestroy() {
    await Promise.all([
      this.client.quit(),
      this.subscriber.quit(),
      this.publisher.quit(),
    ]);
    this.logger.log('Redis connections closed');
  }

  // ─── Presence ───
  async setUserOnline(userId: string): Promise<void> {
    await this.client.hset('presence', userId, JSON.stringify({
      status: 'online',
      lastSeen: new Date().toISOString(),
    }));
  }

  async setUserOffline(userId: string): Promise<void> {
    await this.client.hset('presence', userId, JSON.stringify({
      status: 'offline',
      lastSeen: new Date().toISOString(),
    }));
  }

  async getUserPresence(userId: string): Promise<{ status: string; lastSeen: string } | null> {
    const data = await this.client.hget('presence', userId);
    return data ? JSON.parse(data) : null;
  }

  async getOnlineUsers(): Promise<string[]> {
    const all = await this.client.hgetall('presence');
    return Object.entries(all)
      .filter(([, val]) => JSON.parse(val).status === 'online')
      .map(([key]) => key);
  }

  // ─── Rate Limiting ───
  async checkRateLimit(key: string, limit: number, windowSec: number): Promise<boolean> {
    const current = await this.client.incr(`rate:${key}`);
    if (current === 1) {
      await this.client.expire(`rate:${key}`, windowSec);
    }
    return current <= limit;
  }

  // ─── Caching ───
  async setCache(key: string, value: string, ttlSec: number): Promise<void> {
    await this.client.setex(`cache:${key}`, ttlSec, value);
  }

  async getCache(key: string): Promise<string | null> {
    return this.client.get(`cache:${key}`);
  }

  async deleteCache(key: string): Promise<void> {
    await this.client.del(`cache:${key}`);
  }

  // ─── Socket Mapping ───
  async mapSocketToUser(socketId: string, userId: string): Promise<void> {
    await this.client.hset('socket:user', socketId, userId);
    await this.client.sadd(`user:sockets:${userId}`, socketId);
  }

  async unmapSocket(socketId: string): Promise<string | null> {
    const userId = await this.client.hget('socket:user', socketId);
    if (userId) {
      await this.client.hdel('socket:user', socketId);
      await this.client.srem(`user:sockets:${userId}`, socketId);
      const remaining = await this.client.scard(`user:sockets:${userId}`);
      if (remaining === 0) {
        await this.client.del(`user:sockets:${userId}`);
      }
    }
    return userId;
  }

  async getUserSockets(userId: string): Promise<string[]> {
    return this.client.smembers(`user:sockets:${userId}`);
  }

  // ─── Typing ───
  async setTyping(userId: string, targetId: string, targetType: 'room' | 'conversation'): Promise<void> {
    const key = `typing:${targetType}:${targetId}`;
    await this.client.hset(key, userId, Date.now().toString());
    await this.client.expire(key, 10);
  }

  async clearTyping(userId: string, targetId: string, targetType: 'room' | 'conversation'): Promise<void> {
    await this.client.hdel(`typing:${targetType}:${targetId}`, userId);
  }

  async getTypingUsers(targetId: string, targetType: 'room' | 'conversation'): Promise<string[]> {
    const key = `typing:${targetType}:${targetId}`;
    const all = await this.client.hgetall(key);
    const now = Date.now();
    return Object.entries(all)
      .filter(([, timestamp]) => now - parseInt(timestamp) < 10000)
      .map(([userId]) => userId);
  }
}
