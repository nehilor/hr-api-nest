import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Initialize Sentry after ConfigService is available
  const sentryDsn = configService.get('SENTRY_DSN');
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment: configService.get('NODE_ENV') || 'development',
      integrations: [
        nodeProfilingIntegration(),
        // Add HTTP integration for error capture
        Sentry.httpIntegration(),
        // Add Express integration for HTTP error capture
        Sentry.expressIntegration(),
        Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
      ],
      // Performance Monitoring
      tracesSampleRate: 1.0,
      // Set sampling rate for profiling
      profilesSampleRate: 1.0,
      enabled: true,
    });

    console.log('✅ Sentry initialized with DSN:', sentryDsn.substring(0, 50) + '...');
  } else {
    console.log('⚠️  Sentry DSN not found, monitoring disabled');
  }
  const logger = new Logger('Bootstrap');

  // Add Sentry middleware for request tracking
  if (sentryDsn) {
    app.use((req, res, next) => {
      Sentry.withScope((scope) => {
        scope.setTag('method', req.method);
        scope.setTag('url', req.url);
        scope.setContext('request', {
          method: req.method,
          url: req.url,
          headers: req.headers,
        });
        next();
      });
    });
  }

  // Security
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN'),
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

  // Global filters and interceptors
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger documentation (dev only)
  if (configService.get('NODE_ENV') === 'development') {
    const config = new DocumentBuilder()
      .setTitle('HR API')
      .setDescription('HR Management API documentation')
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