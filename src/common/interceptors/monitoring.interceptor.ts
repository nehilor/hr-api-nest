import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import * as Sentry from '@sentry/node';

@Injectable()
export class MonitoringInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MonitoringInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, body, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    return Sentry.startSpan({
      name: `${method} ${url}`,
      op: 'http.server',
      attributes: {
        'http.method': method,
        'http.url': url,
        'user_agent.original': userAgent,
      },
    }, (span) => {
      return next.handle().pipe(
        tap((data) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          // Log successful requests
          this.logger.log(
            `${method} ${url} ${statusCode} - ${duration}ms`,
          );

          // Add performance data to span
          span?.setAttributes({
            'http.status_code': statusCode,
            'http.response.duration': duration,
            'http.response.size': JSON.stringify(data).length,
          });

          // Set status based on response
          if (statusCode >= 400) {
            span?.setStatus({ code: 2, message: 'internal_error' });
          } else {
            span?.setStatus({ code: 1, message: 'ok' });
          }

          // Send performance metrics to Sentry
          Sentry.addBreadcrumb({
            message: 'Request completed',
            category: 'http',
            level: 'info',
            data: {
              method,
              url,
              statusCode,
              duration,
            },
          });
        }),
        catchError((error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          // Log errors
          this.logger.error(
            `${method} ${url} ${statusCode} - ${duration}ms - ${error.message}`,
            error.stack,
          );

          // Capture error in Sentry with context
          Sentry.withScope((scope) => {
            scope.setTag('method', method);
            scope.setTag('url', url);
            scope.setTag('statusCode', statusCode);
            scope.setContext('request', {
              method,
              url,
              body: this.sanitizeBody(body),
              headers: this.sanitizeHeaders(headers),
              userAgent,
            });
            scope.setContext('performance', {
              duration,
            });
            scope.setLevel('error');

            Sentry.captureException(error);
          });

          // Set span status to error
          span?.setStatus({ code: 2, message: 'internal_error' });
          span?.recordException(error);

          return throwError(() => error);
        }),
      );
    });
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    // Remove sensitive data
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'key'];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private sanitizeHeaders(headers: any): any {
    if (!headers) return headers;

    // Remove sensitive headers
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];

    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
