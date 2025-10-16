import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './events.dto';
import * as crypto from 'crypto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(apiKey: string, createEventDto: CreateEventDto) {
    // Find project by API key
    const project = await this.prisma.project.findUnique({
      where: { apiKey },
    });

    if (!project) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Generate fingerprint for deduplication
    const fingerprint = this.generateFingerprint(
      createEventDto.stack || '',
      createEventDto.message,
      createEventDto.title,
    );

    // Check if event with same fingerprint already exists
    const existingEvent = await this.prisma.event.findFirst({
      where: {
        projectId: project.id,
        fingerprint,
      },
    });

    if (existingEvent) {
      // Update existing event (increment count, update lastSeen)
      const updatedEvent = await this.prisma.event.update({
        where: { id: existingEvent.id },
        data: {
          count: existingEvent.count + 1,
          lastSeen: new Date(),
        },
      });

      return updatedEvent;
    } else {
      // Create new event
      const newEvent = await this.prisma.event.create({
        data: {
          projectId: project.id,
          title: createEventDto.title,
          message: createEventDto.message,
          stack: createEventDto.stack,
          fingerprint,
          environment: createEventDto.env,
          url: createEventDto.url,
          userAgent: createEventDto.userAgent,
          metadata: createEventDto.metadata,
        },
      });

      return newEvent;
    }
  }

  async findAllEvents(filters?: {
    projectId?: string;
    environment?: string;
    from?: Date;
    to?: Date;
    search?: string;
  }) {
    const where: any = {};

    if (filters?.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters?.environment) {
      where.environment = filters.environment;
    }

    if (filters?.from || filters?.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = filters.from;
      if (filters.to) where.createdAt.lte = filters.to;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { message: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.event.findMany({
      where,
      orderBy: { lastSeen: 'desc' },
      take: 100, // Limit to 100 most recent events
      include: {
        project: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async findEventById(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
      include: {
        project: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async getProjectByApiKey(apiKey: string) {
    return this.prisma.project.findUnique({
      where: { apiKey },
    });
  }

  private generateFingerprint(stack: string, message: string, title: string): string {
    // Extract filename and line number from stack trace
    const stackLines = stack.split('\n');
    const firstStackLine = stackLines[1] || ''; // Skip the error message line

    // Extract filename and line:column from stack trace
    const fileMatch = firstStackLine.match(/at\s+.*?\(([^:]+):(\d+):(\d+)\)/);
    const filename = fileMatch ? fileMatch[1].split('/').pop() : '';
    const line = fileMatch ? fileMatch[2] : '';
    const column = fileMatch ? fileMatch[3] : '';

    // Create fingerprint from stack + message + filename + line:column
    const fingerprintData = `${stack}|${message}|${filename}|${line}:${column}`;

    // Generate hash
    return crypto
      .createHash('md5')
      .update(fingerprintData)
      .digest('hex')
      .substring(0, 16); // Use first 16 characters for shorter fingerprints
  }
}
