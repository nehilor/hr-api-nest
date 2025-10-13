import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ThrottlerGuard } from '@nestjs/throttler';
import { PeopleService } from './people.service';
import {
  CreatePersonDto,
  UpdatePersonDto,
  PeopleQueryDto,
  PersonResponseDto,
  PaginatedPeopleResponseDto,
} from './people.dto';

@ApiTags('People')
@Controller('people')
@UseGuards(AuthGuard('jwt'), ThrottlerGuard)
@ApiBearerAuth()
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of people' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'People retrieved successfully',
    type: PaginatedPeopleResponseDto,
  })
  async findAll(@Query() query: PeopleQueryDto): Promise<PaginatedPeopleResponseDto> {
    return this.peopleService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get person by ID' })
  @ApiResponse({
    status: 200,
    description: 'Person retrieved successfully',
    type: PersonResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Person not found' })
  async findById(@Param('id') id: string): Promise<PersonResponseDto> {
    const person = await this.peopleService.findById(id);
    return {
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      position: person.position,
      department: person.department,
      startDate: person.startDate?.toISOString(),
      managerId: person.managerId,
      createdAt: person.createdAt.toISOString(),
      updatedAt: person.updatedAt.toISOString(),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new person' })
  @ApiResponse({
    status: 201,
    description: 'Person created successfully',
    type: PersonResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Person with email already exists' })
  async create(@Body() createPersonDto: CreatePersonDto): Promise<PersonResponseDto> {
    const person = await this.peopleService.create(createPersonDto);
    return {
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      position: person.position,
      department: person.department,
      startDate: person.startDate?.toISOString(),
      managerId: person.managerId,
      createdAt: person.createdAt.toISOString(),
      updatedAt: person.updatedAt.toISOString(),
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update person by ID' })
  @ApiResponse({
    status: 200,
    description: 'Person updated successfully',
    type: PersonResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Person not found' })
  @ApiResponse({ status: 409, description: 'Person with email already exists' })
  async update(
    @Param('id') id: string,
    @Body() updatePersonDto: UpdatePersonDto,
  ): Promise<PersonResponseDto> {
    const person = await this.peopleService.update(id, updatePersonDto);
    return {
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      position: person.position,
      department: person.department,
      startDate: person.startDate?.toISOString(),
      managerId: person.managerId,
      createdAt: person.createdAt.toISOString(),
      updatedAt: person.updatedAt.toISOString(),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete person by ID' })
  @ApiResponse({ status: 204, description: 'Person deleted successfully' })
  @ApiResponse({ status: 404, description: 'Person not found' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.peopleService.delete(id);
  }
}