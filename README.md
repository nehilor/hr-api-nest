# HR API - NestJS Backend

A production-ready HR management API built with NestJS, Prisma, PostgreSQL, and JWT authentication.

## Features

- **Authentication**: JWT-based auth with register/login endpoints
- **User Management**: Secure user registration with bcrypt password hashing
- **People Management**: Full CRUD operations with search and pagination
- **Database**: PostgreSQL with Prisma ORM
- **Security**: Rate limiting, CORS, input validation, and request logging
- **Documentation**: OpenAPI/Swagger documentation (dev only)
- **Type Safety**: Full TypeScript implementation

## Tech Stack

- **Runtime**: Node.js LTS
- **Framework**: NestJS with modular architecture
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport
- **Validation**: class-validator/class-transformer
- **Documentation**: OpenAPI (Swagger)
- **Package Manager**: pnpm

## Prerequisites

- Node.js 18+ LTS
- pnpm 8+
- PostgreSQL 13+ (or Docker)

## Quick Start

### 1. Setup Database

Using Docker (recommended):
```bash
docker run --name hr-postgres \\
  -e POSTGRES_DB=hr_db \\
  -e POSTGRES_USER=postgres \\
  -e POSTGRES_PASSWORD=postgres \\
  -p 5432:5432 \\
  -d postgres:15-alpine
```

Or use the provided docker-compose:
```bash
pnpm run db:up
```

### 2. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Update `.env` with your configuration:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hr_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-minimum-32-characters"
JWT_EXPIRES_IN="1h"
PORT=4000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Setup Database

Generate Prisma client:
```bash
pnpm run prisma:generate
```

Run migrations:
```bash
pnpm run prisma:migrate
```

Seed the database:
```bash
pnpm run prisma:seed
```

### 5. Start Development Server

```bash
pnpm run dev
```

The API will be available at `http://localhost:4000`

## Default Users

After seeding, you can use these credentials:

**Admin User:**
- Email: `admin@hrapp.com`
- Password: `admin123`

**HR Manager:**
- Email: `hr@hrapp.com`
- Password: `hr123`

## API Documentation

In development mode, Swagger documentation is available at:
- **Swagger UI**: `http://localhost:4000/docs`
- **OpenAPI JSON**: `http://localhost:4000/docs-json`

## API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@hrapp.com",
  "password": "admin123"
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Profile
```http
GET /api/auth/me
Authorization: Bearer <your-access-token>
```

Response:
```json
{
  "id": "clp123...",
  "email": "admin@hrapp.com",
  "role": "ADMIN",
  "firstName": "Admin",
  "lastName": "User"
}
```

### People Management

All people endpoints require authentication via `Authorization: Bearer <token>` header.

#### List People
```http
GET /api/people?q=john&page=1&pageSize=10
Authorization: Bearer <your-access-token>
```

Response:
```json
{
  "page": 1,
  "pageSize": 10,
  "total": 25,
  "items": [
    {
      "id": "clp456...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com",
      "position": "Software Engineer",
      "department": "Engineering",
      "startDate": "2023-01-15T00:00:00.000Z",
      "managerId": null,
      "createdAt": "2023-10-10T10:00:00.000Z",
      "updatedAt": "2023-10-10T10:00:00.000Z"
    }
  ]
}
```

#### Get Person by ID
```http
GET /api/people/clp456...
Authorization: Bearer <your-access-token>
```

#### Create Person
```http
POST /api/people
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "firstName": "Alice",
  "lastName": "Johnson",
  "email": "alice.johnson@company.com",
  "position": "Senior Developer",
  "department": "Engineering",
  "startDate": "2023-10-10T00:00:00.000Z",
  "managerId": "clp789..."
}
```

#### Update Person
```http
PATCH /api/people/clp456...
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "position": "Lead Developer",
  "department": "Engineering"
}
```

#### Delete Person
```http
DELETE /api/people/clp456...
Authorization: Bearer <your-access-token>
```

## Available Scripts

### Development
- `pnpm run dev` - Start development server with hot reload
- `pnpm run start:debug` - Start with debugging enabled

### Production
- `pnpm run build` - Build the application
- `pnpm run start` - Start production server
- `pnpm run start:prod` - Build and start production server

### Database
- `pnpm run prisma:generate` - Generate Prisma client
- `pnpm run prisma:migrate` - Run database migrations
- `pnpm run prisma:seed` - Seed database with sample data
- `pnpm run prisma:studio` - Open Prisma Studio
- `pnpm run prisma:reset` - Reset database (dev only)

### Docker
- `pnpm run db:up` - Start PostgreSQL with docker-compose
- `pnpm run db:down` - Stop PostgreSQL container

### Code Quality
- `pnpm run lint` - Run ESLint
- `pnpm run format` - Format code with Prettier
- `pnpm run test` - Run unit tests
- `pnpm run test:e2e` - Run end-to-end tests

## Data Models

### User
```typescript
{
  id: string          // cuid
  email: string       // unique
  passwordHash: string
  firstName: string
  lastName: string
  role: UserRole      // ADMIN | HR | EMPLOYEE
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Person
```typescript
{
  id: string          // cuid
  firstName: string
  lastName: string
  email: string       // unique
  position?: string
  department?: string
  startDate?: DateTime
  managerId?: string  // self-reference
  createdAt: DateTime
  updatedAt: DateTime
}
```

## Security Features

- **Password Hashing**: bcrypt with cost factor 10
- **JWT Authentication**: Short-lived access tokens
- **Rate Limiting**: 100 requests per minute
- **CORS**: Configurable origin whitelist
- **Input Validation**: Global validation pipes
- **Request Logging**: Structured JSON logs (sensitive data redacted)
- **Error Handling**: Consistent error response format

## Error Response Format

All errors follow this consistent format:
```json
{
  "statusCode": 400,
  "timestamp": "2023-10-10T10:00:00.000Z",
  "path": "/api/people",
  "method": "POST",
  "message": "Validation failed"
}
```

## Production Deployment

### Environment Variables
Ensure these are set in production:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="long-random-production-secret-minimum-32-characters"
JWT_EXPIRES_IN="15m"  # Consider shorter expiry for production
PORT=4000
NODE_ENV="production"
CORS_ORIGIN="https://yourdomain.com"
```

### Database Migration
```bash
pnpm run prisma:migrate
```

### Build and Start
```bash
pnpm run build
pnpm run start:prod
```

## Health Check

The application provides a health check endpoint:
```http
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2023-10-10T10:00:00.000Z",
  "service": "hr-api"
}
```

## Security Notes

- **JWT Tokens**: Currently using access tokens only. For production, consider implementing refresh tokens and HttpOnly cookies
- **Rate Limiting**: Basic implementation included. Consider more sophisticated rate limiting for production
- **Database**: Ensure PostgreSQL is properly secured and not exposed publicly
- **Secrets**: Never commit secrets to version control. Use environment variables or secret management systems

## Development Tips

1. **Database Changes**: After modifying `schema.prisma`, run `pnpm run prisma:migrate` to create and apply migrations
2. **Type Generation**: Prisma automatically generates TypeScript types for your models
3. **Swagger**: The API documentation is automatically generated from your DTOs and decorators
4. **Logging**: Check console output for structured request/response logs during development

## Support

For issues and questions:
1. Check the application logs for detailed error information
2. Verify database connectivity and migrations
3. Ensure all environment variables are properly set
4. Review the Swagger documentation for API contracts