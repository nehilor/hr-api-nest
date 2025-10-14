import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';
import * as Sentry from '@sentry/node';

@ApiTags('Monitoring')
@Controller('monitoring')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class MonitoringController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  @ApiOperation({ summary: 'Get application health status' })
  @ApiResponse({ status: 200, description: 'Health status retrieved' })
  async getHealth() {
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
          api: 'running',
        },
      };
    } catch (error) {
      Sentry.captureException(error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'disconnected',
          api: 'running',
        },
        error: error.message,
      };
    }
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get application metrics' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved' })
  async getMetrics() {
    try {
      // Get basic metrics from database
      const [userCount, peopleCount] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.person.count(),
      ]);

      return {
        timestamp: new Date().toISOString(),
        metrics: {
          users: userCount,
          people: peopleCount,
          uptime: process.uptime(),
          memory: process.memoryUsage(),
        },
      };
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }

  @Get('errors')
  @ApiOperation({ summary: 'Get recent errors (mock data)' })
  @ApiResponse({ status: 200, description: 'Recent errors retrieved' })
  async getRecentErrors() {
    // In a real implementation, this would query from your error storage
    // For now, we'll return mock data
    return {
      timestamp: new Date().toISOString(),
      errors: [
        {
          id: '1',
          message: 'Database connection timeout',
          level: 'error',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
          count: 3,
        },
        {
          id: '2',
          message: 'Invalid JWT token',
          level: 'warning',
          timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
          count: 1,
        },
      ],
    };
  }

  @Get('performance')
  @ApiOperation({ summary: 'Get performance metrics (mock data)' })
  @ApiResponse({ status: 200, description: 'Performance metrics retrieved' })
  async getPerformanceMetrics() {
    // In a real implementation, this would query from your metrics storage
    return {
      timestamp: new Date().toISOString(),
      performance: {
        averageResponseTime: 150, // ms
        requestsPerMinute: 45,
        errorRate: 0.02, // 2%
        endpoints: [
          {
            path: '/api/people',
            method: 'GET',
            averageResponseTime: 120,
            requestCount: 25,
            errorCount: 0,
          },
          {
            path: '/api/auth/login',
            method: 'POST',
            averageResponseTime: 200,
            requestCount: 15,
            errorCount: 1,
          },
        ],
      },
    };
  }
}
