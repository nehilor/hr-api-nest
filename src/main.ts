import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Security
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: [
      configService.get('CORS_ORIGIN'),
      'http://localhost:3000',
      'http://localhost:3001',
      null, // Allow file:// protocol for test-client.html
    ],
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation (dev only)
  if (configService.get('NODE_ENV') === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Monitoring API')
      .setDescription('Application Monitoring API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    logger.log('Swagger documentation available at /docs');
  }

  const port = configService.get('PORT') || 4000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();