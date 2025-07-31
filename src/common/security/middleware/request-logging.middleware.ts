import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggingMiddleware.name);

  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('User-Agent') || '';
    const startTime = Date.now();

    // Log request start
    this.logger.log(`🚀 ${method} ${originalUrl} - ${ip} - ${userAgent}`);

    // Capture logger instance in closure
    const logger = this.logger;

    // Override res.end to log response
    const originalEnd = res.end.bind(res) as (
      chunk?: unknown,
      encoding?: BufferEncoding,
    ) => Response;
    res.end = function (chunk?: unknown, encoding?: BufferEncoding): Response {
      const responseTime = Date.now() - startTime;
      const { statusCode } = res;

      // Get content length if available
      const contentLength = res.get('Content-Length') || '0';

      // Color coding for status codes
      let statusIcon = '✅';
      if (statusCode >= 400 && statusCode < 500) {
        statusIcon = '⚠️';
      } else if (statusCode >= 500) {
        statusIcon = '❌';
      }

      const message = `${statusIcon} ${method} ${originalUrl} - ${statusCode} - ${responseTime}ms - ${contentLength} bytes`;

      if (statusCode >= 400) {
        logger.error(message);
      } else {
        logger.log(message);
      }

      // Performance warning
      if (responseTime > 2000) {
        logger.warn(
          `🐌 Slow response: ${method} ${originalUrl} took ${responseTime}ms`,
        );
      }

      return originalEnd(chunk, encoding);
    } as typeof res.end;

    next();
  }
}
