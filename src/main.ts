import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { RateLimitFilter } from './common/rate-limit.filter';
import { getConfig } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = getConfig();

  // Browsers may call this API only from the portfolio site (and localhost in development).
  app.enableCors({
    origin: config.allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-admin-token', 'x-chat-key'],
    maxAge: 86_400,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new RateLimitFilter());
  app.setGlobalPrefix('api');
  // Behind Vercel's proxy the client address arrives in x-forwarded-for.
  app.getHttpAdapter().getInstance().set('trust proxy', true);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Personal RAG API running on port ${port}`);
}
bootstrap();
