import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import * as Sentry from '@sentry/node';

@ApiTags('Monitoring')
@Controller('monitoring')
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
      const [projectCount, eventCount] = await Promise.all([
        this.prisma.project.count(),
        this.prisma.event.count(),
      ]);

      return {
        timestamp: new Date().toISOString(),
        metrics: {
          projects: projectCount,
          events: eventCount,
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
  @ApiOperation({ summary: 'Get recent errors from events table' })
  @ApiResponse({ status: 200, description: 'Recent errors retrieved' })
  async getRecentErrors() {
    try {
      // Get recent events from all projects
      const recentEvents = await this.prisma.event.findMany({
        orderBy: { lastSeen: 'desc' },
        take: 10,
        include: {
          project: {
            select: {
              name: true,
            },
          },
        },
      });

      const errors = recentEvents.map(event => ({
        id: event.id,
        message: event.title,
        level: 'error',
        timestamp: event.lastSeen.toISOString(),
        count: event.count,
        project: event.project.name,
        environment: event.environment,
        url: event.url,
      }));

      return {
        timestamp: new Date().toISOString(),
        errors,
      };
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
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

  @Get('projects')
  @ApiOperation({ summary: 'Get all monitoring projects' })
  @ApiResponse({ status: 200, description: 'Projects retrieved' })
  async getProjects() {
    try {
      const projects = await this.prisma.project.findMany({
        include: {
          _count: {
            select: {
              events: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        timestamp: new Date().toISOString(),
        projects: projects.map(project => ({
          id: project.id,
          name: project.name,
          apiKey: project.apiKey.substring(0, 8) + '...', // Mask API key
          eventCount: project._count.events,
          createdAt: project.createdAt,
        })),
      };
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }
}
