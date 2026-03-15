import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    // Connect in the background to avoid blocking bootstrap
    this.$connect()
      .then(() => this.logger.log('✅ Connected to PostgreSQL'))
      .catch((err) => this.logger.error('❌ Failed to connect to PostgreSQL', err.message));
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from PostgreSQL');
  }
}
