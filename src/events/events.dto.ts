import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsNotEmpty } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    description: 'Error title/summary',
    example: 'TypeError: x is not a function',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Error message',
    example: 'x is not a function',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Error stack trace',
    example: 'Error: x is not a function\n    at app.js:123:45',
    required: false,
  })
  @IsString()
  @IsOptional()
  stack?: string;

  @ApiProperty({
    description: 'Application release version',
    example: '1.0.3',
    required: false,
  })
  @IsString()
  @IsOptional()
  release?: string;

  @ApiProperty({
    description: 'Environment (production, staging, development)',
    example: 'production',
    required: false,
  })
  @IsString()
  @IsOptional()
  env?: string;

  @ApiProperty({
    description: 'URL where error occurred',
    example: 'https://app.com/page',
    required: false,
  })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({
    description: 'User agent string',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    required: false,
  })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiProperty({
    description: 'Additional metadata',
    example: { userId: 'user123', component: 'UserProfile' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class EventResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  stack?: string;

  @ApiProperty()
  fingerprint: string;

  @ApiProperty()
  environment?: string;

  @ApiProperty()
  url?: string;

  @ApiProperty()
  userAgent?: string;

  @ApiProperty()
  metadata?: Record<string, any>;

  @ApiProperty()
  count: number;

  @ApiProperty()
  firstSeen: Date;

  @ApiProperty()
  lastSeen: Date;

  @ApiProperty()
  createdAt: Date;
}
