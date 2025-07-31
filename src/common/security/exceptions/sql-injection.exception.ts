import { HttpStatus } from '@nestjs/common';
import { BaseSecurityException } from './base-security.exception';

export class SqlInjectionException extends BaseSecurityException {
  constructor(
    message: string = 'SQL injection attempt detected',
    context?: string,
  ) {
    const fullMessage = context ? `${message} in ${context}` : message;

    super(fullMessage, HttpStatus.BAD_REQUEST, 'SEC_001_SQL_INJECTION', 'HIGH');
  }

  static create(
    context: string,
    suspiciousContent?: string,
  ): SqlInjectionException {
    const message = suspiciousContent
      ? `SQL injection pattern detected: "${suspiciousContent.substring(0, 50)}..."`
      : 'SQL injection attempt detected';

    return new SqlInjectionException(message, context);
  }
}
