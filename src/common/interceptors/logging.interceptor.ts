import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body, query } = request;
    const now = Date.now();

    // Log request
    this.logger.log(
      JSON.stringify({
        type: 'request',
        method,
        url,
        query,
        body: this.sanitizeBody(body),
        timestamp: new Date().toISOString(),
      }),
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - now;
          this.logger.log(
            JSON.stringify({
              type: 'response',
              method,
              url,
              duration: `${duration}ms`,
              timestamp: new Date().toISOString(),
            }),
          );
        },
        error: (error) => {
          const duration = Date.now() - now;
          this.logger.error(
            JSON.stringify({
              type: 'error',
              method,
              url,
              duration: `${duration}ms`,
              error: error.message,
              timestamp: new Date().toISOString(),
            }),
          );
        },
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'passwordHash', 'token'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
}