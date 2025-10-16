import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto, EventResponseDto } from './events.dto';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Ingest error event',
    description: 'Capture and store error events from client applications. Uses API key authentication via X-API-Key header.'
  })
  @ApiHeader({
    name: 'X-API-Key',
    description: 'Project API key for authentication',
    required: true,
  })
  @ApiResponse({
    status: 202,
    description: 'Event accepted and processed',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid API key'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid event data'
  })
  async createEvent(
    @Headers('x-api-key') apiKey: string,
    @Body() createEventDto: CreateEventDto,
  ) {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    return this.eventsService.createEvent(apiKey, createEventDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all events',
    description: 'Retrieve all events from all projects'
  })
  @ApiResponse({
    status: 200,
    description: 'Events retrieved successfully',
    type: [EventResponseDto],
  })
  async getEvents(
    @Query('projectId') projectId?: string,
    @Query('environment') environment?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('search') search?: string,
  ) {
    const filters: any = {};
    if (projectId) filters.projectId = projectId;
    if (environment) filters.environment = environment;
    if (from) filters.from = new Date(from);
    if (to) filters.to = new Date(to);
    if (search) filters.search = search;

    return this.eventsService.findAllEvents(filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get event by ID',
    description: 'Retrieve a specific event by its ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Event retrieved successfully',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found'
  })
  async getEventById(@Param('id') eventId: string) {
    return this.eventsService.findEventById(eventId);
  }
}
