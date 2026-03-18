import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { RedisIoAdapter } from './chat/redis-io.adapter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { execSync } from 'child_process';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  // Force DB migration during startup to bypass Render configuration issues
  try {
    logger.log('Starting Prisma migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    logger.log('Prisma migrations completed successfully.');
  } catch (error: any) {
    logger.error(`Migration failed: ${error.message}`);
    // Non-fatal if the DB is already up to date, continuing
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || configService.get<number>('BACKEND_PORT', 4000);

  const jwtSecret = configService.get<string>('JWT_SECRET');
  if (!jwtSecret) {
    logger.error('CRITICAL: JWT_SECRET environment variable is missing!');
  } else {
    logger.log(`JWT_SECRET loaded (first 4 chars: ${jwtSecret.substring(0, 4)}...)`);
  }

  // CORS: allow explicitly configured origins, or reflect any origin if not configured
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  if (corsOrigin) {
    const origins = corsOrigin.split(',').map((o: string) => o.trim());
    app.enableCors({
      origin: origins.length > 1 ? origins : origins[0],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
    logger.log(`CORS restricted to: ${origins.join(', ')}`);
  } else {
    // No CORS_ORIGIN set — reflect any origin (works for all deployment URLs)
    app.enableCors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
    logger.warn('CORS_ORIGIN not set — allowing any origin. Set CORS_ORIGIN in production for security.');
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Redis Adapter for Socket.IO Scaling
  const redisUrl = configService.get<string>('REDIS_URL');
  if (redisUrl) {
    try {
      const redisIoAdapter = new RedisIoAdapter(app, redisUrl);
      await redisIoAdapter.connectToRedis();
      app.useWebSocketAdapter(redisIoAdapter);
      logger.log('✅ Redis Socket.IO adapter initialized successfully');
    } catch (error) {
      logger.error(`❌ Failed to initialize Redis adapter: ${error.message}. Falling back to default adapter.`);
    }
  }

  // Serve static files from the uploads directory
  const uploadDir = configService.get<string>('UPLOAD_DIR', './uploads');
  app.useStaticAssets(join(process.cwd(), uploadDir), {
    prefix: '/uploads/',
  });

  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`PulseChat backend running on port ${port}`);
}

bootstrap();
