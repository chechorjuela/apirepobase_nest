import { HttpStatus } from '@nestjs/common';
import { BaseSecurityException } from './base-security.exception';

export class RateLimitException extends BaseSecurityException {
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    const fullMessage = retryAfter
      ? `${message}. Try again in ${retryAfter} seconds`
      : message;

    super(
      fullMessage,
      HttpStatus.TOO_MANY_REQUESTS,
      'SEC_005_RATE_LIMIT',
      'MEDIUM',
    );

    if (retryAfter) {
      const response = this.getResponse() as Record<string, unknown>;
      response.retryAfter = retryAfter;
    }
  }

  static create(
    ip: string,
    limit: number,
    window: number,
    retryAfter?: number,
  ): RateLimitException {
    const message = `Rate limit exceeded for IP ${ip}. Maximum ${limit} requests per ${window}ms allowed`;
    return new RateLimitException(message, retryAfter);
  }
}
