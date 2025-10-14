import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';

@ApiTags('Debug')
@Controller('debug')
export class SentryTestController {

  @Get('sentry-test')
  @ApiOperation({ summary: 'Test Sentry error capture' })
  async testSentryError() {
    try {
      // Force an error
      throw new Error('Test error for Sentry - ' + new Date().toISOString());
    } catch (error) {
      // Capture the error manually with more context
      Sentry.withScope((scope) => {
        scope.setTag('test', 'sentry-debug');
        scope.setLevel('error');
        scope.setContext('debug', {
          timestamp: new Date().toISOString(),
          endpoint: '/debug/sentry-test',
          method: 'GET'
        });
        Sentry.captureException(error);
      });
      throw error;
    }
  }

  @Get('sentry-test-2')
  @ApiOperation({ summary: 'Test Sentry error capture 2' })
  async testSentryError2() {
    // Force a different type of error
    const obj: any = null;
    return obj.someProperty; // This will throw a TypeError
  }

  @Post('sentry-test-3')
  @ApiOperation({ summary: 'Test Sentry error capture 3' })
  async testSentryError3() {
    // Force a validation error
    throw new Error('Validation error for Sentry - ' + new Date().toISOString());
  }

  @Get('sentry-force')
  @ApiOperation({ summary: 'Force Sentry error capture' })
  async forceSentryError() {
    // Force an error and capture it immediately
    const error = new Error('FORCED ERROR FOR SENTRY - ' + new Date().toISOString());

    // Capture with maximum context
    Sentry.withScope((scope) => {
      scope.setTag('forced', 'true');
      scope.setTag('test', 'sentry-force');
      scope.setLevel('error');
      scope.setContext('force_test', {
        timestamp: new Date().toISOString(),
        endpoint: '/debug/sentry-force',
        method: 'GET',
        forced: true
      });
      scope.setUser({ id: 'test-user', email: 'test@example.com' });
      Sentry.captureException(error);
    });

    // Also try to flush Sentry immediately
    await Sentry.flush(2000);

    throw error;
  }

  @Get('sentry-status')
  @ApiOperation({ summary: 'Check Sentry status' })
  async checkSentryStatus() {
    return {
      sentryInitialized: !!process.env.SENTRY_DSN,
      dsn: process.env.SENTRY_DSN ? 'configured' : 'not configured',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };
  }
}
