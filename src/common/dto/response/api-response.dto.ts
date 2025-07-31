import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiResponseDto<T = unknown> {
  @ApiProperty({
    description: 'Response data',
    example: {},
  })
  data: T;

  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  status: number;

  @ApiPropertyOptional({
    description: 'Additional details (only in development)',
    example: {},
  })
  details?: Record<string, unknown>;

  constructor(
    data: T,
    message: string,
    status: number,
    details?: Record<string, unknown>,
  ) {
    this.data = data;
    this.message = message;
    this.status = status;
    if (details && process.env.NODE_ENV === 'development') {
      this.details = details;
    }
  }

  static success<T>(
    data: T,
    message: string = 'Operation completed successfully',
    status: number = 200,
  ): ApiResponseDto<T> {
    return new ApiResponseDto(data, message, status);
  }

  static error<T = null>(
    message: string,
    status: number = 500,
    details?: Record<string, unknown>,
  ): ApiResponseDto<T> {
    return new ApiResponseDto(null as T, message, status, details);
  }
}
