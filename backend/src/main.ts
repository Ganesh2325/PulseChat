import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { RedisIoAdapter } from './chat/redis-io.adapter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || configService.get<number>('BACKEND_PORT', 4000);
  const corsOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:3000');
  const origins = corsOrigin.split(',').map(o => o.trim());

  const jwtSecret = configService.get<string>('JWT_SECRET');
  if (!jwtSecret) {
    logger.error('CRITICAL: JWT_SECRET environment variable is missing!');
  } else {
    // Log a partial value to confirm it's loaded without exposing the full secret
    logger.log(`JWT_SECRET is visible (first 4 chars: ${jwtSecret.substring(0, 4)}...)`);
  }

  app.enableCors({
    origin: origins.length > 1 ? origins : origins[0],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

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

  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`PulseChat backend running on http://localhost:${port}`);
}

bootstrap();
