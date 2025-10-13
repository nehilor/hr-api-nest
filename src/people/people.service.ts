import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Person } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonDto, UpdatePersonDto, PeopleQueryDto, PaginatedPeopleResponseDto } from './people.dto';

@Injectable()
export class PeopleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PeopleQueryDto): Promise<PaginatedPeopleResponseDto> {
    const { q, page = 1, pageSize = 10 } = query;
    
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    
    const where = q ? {
      OR: [
        { firstName: { contains: q, mode: 'insensitive' as const } },
        { lastName: { contains: q, mode: 'insensitive' as const } },
        { email: { contains: q, mode: 'insensitive' as const } },
      ],
    } : {};

    const [people, total] = await Promise.all([
      this.prisma.person.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.person.count({ where }),
    ]);

    return {
      page,
      pageSize,
      total,
      items: people.map(this.mapPersonToDto),
    };
  }

  async findById(id: string): Promise<Person> {
    const person = await this.prisma.person.findUnique({
      where: { id },
    });

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    return person;
  }

  async create(data: CreatePersonDto): Promise<Person> {
    try {
      return await this.prisma.person.create({
        data: {
          ...data,
          startDate: data.startDate ? new Date(data.startDate) : null,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Person with this email already exists');
      }
      throw error;
    }
  }

  async update(id: string, data: UpdatePersonDto): Promise<Person> {
    const existingPerson = await this.findById(id);

    try {
      return await this.prisma.person.update({
        where: { id },
        data: {
          ...data,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Person with this email already exists');
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const existingPerson = await this.findById(id);
    
    await this.prisma.person.delete({
      where: { id },
    });
  }

  private mapPersonToDto(person: Person) {
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
}