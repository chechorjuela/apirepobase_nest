import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponseDto } from '../dto/response/api-response.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isDevelopment = process.env.NODE_ENV === 'development';

    let status: number;
    let message: string;
    let error: string;
    let details: any = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || responseObj.error || exception.message;
        error = responseObj.error || exception.name;

        // Include validation errors if present
        if (responseObj.message && Array.isArray(responseObj.message)) {
          details.validationErrors = responseObj.message;
        }
      } else {
        message = exception.message;
        error = exception.name;
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message || 'Internal server error';
      error = exception.name;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Unknown error occurred';
      error = 'UnknownError';
    }

    // Add development-specific details
    if (isDevelopment && exception instanceof Error) {
      details = {
        ...details,
        stack: exception.stack,
        cause: exception.cause,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        userAgent: request.get('User-Agent'),
        ip: request.ip,
        body: request.body,
        params: request.params,
        query: request.query,
        headers: this.sanitizeHeaders(request.headers),
      };

      // If it's an automapper error, provide more specific guidance
      if (exception.message?.includes('Mapping is not found')) {
        details.suggestion =
          'The automapper mapping is not configured. Make sure to call setupExampleMappers() during application initialization.';
        details.mapperError = true;
      }

      // If it's a database error, provide more context
      if (
        exception.name?.includes('Query') ||
        exception.message?.includes('database')
      ) {
        details.databaseError = true;
        details.suggestion =
          'This appears to be a database-related error. Check your database connection and query syntax.';
      }

      // If it's a validation error, provide more context
      if (status === HttpStatus.BAD_REQUEST && details.validationErrors) {
        details.suggestion =
          'Request validation failed. Please check the required fields and their formats.';
        details.validationError = true;
      }
    }

    // Log the error
    this.logger.error(
      `HTTP ${status} Error: ${message}`,
      isDevelopment ? exception : undefined,
    );

    // Create standardized error response
    const errorResponse = ApiResponseDto.error(
      message,
      status,
      isDevelopment ? details : undefined,
    );

    // Add error type for better client handling
    (errorResponse as any).error = error;

    response.status(status).json(errorResponse);
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };

    // Remove sensitive headers
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token',
      'x-access-token',
    ];

    sensitiveHeaders.forEach((header) => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
