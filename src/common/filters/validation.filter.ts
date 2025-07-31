import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponseDto } from '../dto/response/api-response.dto';

interface FormattedErrors {
  [field: string]: string[];
}

interface ValidationExceptionResponse {
  message: string | string[];
}

@Catch(BadRequestException)
export class ValidationFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const exceptionResponse =
      exception.getResponse() as ValidationExceptionResponse;

    let validationErrors: string[] = [];
    let message = 'Validation failed';

    // Handle class-validator errors
    if (Array.isArray(exceptionResponse.message)) {
      validationErrors = exceptionResponse.message;
      message = 'Request validation failed';
    } else if (typeof exceptionResponse.message === 'string') {
      message = exceptionResponse.message;
    }

    // Transform validation errors to a more user-friendly format
    const formattedErrors = this.formatValidationErrors(validationErrors);

    this.logger.warn(
      `Validation error: ${message}`,
      JSON.stringify(formattedErrors),
    );

    const errorResponse = ApiResponseDto.error(message, status, {
      validationErrors: formattedErrors,
      timestamp: new Date().toISOString(),
      suggestion: 'Please check the required fields and their formats.',
    });

    response.status(status).json(errorResponse);
  }

  private formatValidationErrors(errors: unknown[]): FormattedErrors {
    if (!Array.isArray(errors)) {
      return {};
    }

    const formatted: FormattedErrors = {};

    errors.forEach((error) => {
      if (typeof error === 'string') {
        // Simple string error
        if (!formatted.general) {
          formatted.general = [];
        }
        formatted.general.push(error);
      } else if (
        error &&
        typeof error === 'object' &&
        'property' in error &&
        'constraints' in error
      ) {
        // class-validator error format
        const err = error as {
          property: string;
          constraints: Record<string, string>;
        };
        const field = err.property;
        const messages = Object.values(err.constraints);

        if (!formatted[field]) {
          formatted[field] = [];
        }
        formatted[field].push(...messages);
      } else if (
        error &&
        typeof error === 'object' &&
        'field' in error &&
        'message' in error
      ) {
        // Custom error format
        const err = error as { field: string; message: string };
        const field = err.field;
        const message = err.message;

        if (!formatted[field]) {
          formatted[field] = [];
        }
        formatted[field].push(message);
      }
    });

    return formatted;
  }
}
