import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private readonly configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const method = request.method;
    const url = request.url;
    const body = request.body;
    const query = request.query;
    const params = request.params;
    const userAgent = request.get('User-Agent') || '';
    const ip = this.getClientIp(request);

    const now = Date.now();
    const isDevelopment = this.configService.get('NODE_ENV') === 'development';

    // Safely serialize request parts
    const safeStringify = (obj: unknown): string => {
      try {
        return JSON.stringify(obj);
      } catch {
        return '[Unable to serialize]';
      }
    };

    // Request logging
    this.logger.log(
      `📥 ${method} ${url} - ${ip} - ${userAgent}${
        isDevelopment &&
        Object.keys((body as Record<string, unknown>) || {}).length > 0
          ? ` - Body: ${safeStringify(body)}`
          : ''
      }${
        isDevelopment &&
        Object.keys((query as Record<string, unknown>) || {}).length > 0
          ? ` - Query: ${safeStringify(query)}`
          : ''
      }${
        isDevelopment &&
        Object.keys((params as Record<string, unknown>) || {}).length > 0
          ? ` - Params: ${safeStringify(params)}`
          : ''
      }`,
    );

    return next.handle().pipe(
      tap((data: unknown) => {
        const duration = Date.now() - now;
        const statusCode = response.statusCode;

        // Response logging
        const serializedData = safeStringify(data);
        this.logger.log(
          `📤 ${method} ${url} - ${statusCode} - ${duration}ms${
            isDevelopment && data
              ? ` - Response: ${serializedData.substring(0, 200)}${
                  serializedData.length > 200 ? '...' : ''
                }`
              : ''
          }`,
        );

        // Performance warning
        if (duration > 1000) {
          this.logger.warn(
            `⚠️ Slow request detected: ${method} ${url} took ${duration}ms`,
          );
        }
      }),
      catchError((error: unknown) => {
        const duration = Date.now() - now;
        const errorStatus = (error as { status?: number }).status || 500;
        const errorMessage =
          (error as { message?: string }).message || 'Unknown error';
        const errorStack = isDevelopment
          ? (error as { stack?: string }).stack
          : undefined;

        // Error logging
        this.logger.error(
          `❌ ${method} ${url} - ${errorStatus} - ${duration}ms - ${errorMessage}`,
          errorStack,
        );

        throw error;
      }),
    );
  }

  private getClientIp(request: Request): string {
    return (
      request.ip ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      'unknown'
    );
  }
}
