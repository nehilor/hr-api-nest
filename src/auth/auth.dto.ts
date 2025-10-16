import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'admin@monitoring.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'admin123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'User information',
    example: { id: 'user123', email: 'admin@monitoring.com' },
  })
  user: {
    id: string;
    email: string;
  };
}
