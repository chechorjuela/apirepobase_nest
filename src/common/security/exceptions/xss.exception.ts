import { HttpStatus } from '@nestjs/common';
import { BaseSecurityException } from './base-security.exception';

export class XssException extends BaseSecurityException {
  constructor(
    message: string = 'Cross-Site Scripting attempt detected',
    context?: string,
  ) {
    const fullMessage = context ? `${message} in ${context}` : message;

    super(fullMessage, HttpStatus.BAD_REQUEST, 'SEC_002_XSS_ATTEMPT', 'HIGH');
  }

  static create(context: string, suspiciousContent?: string): XssException {
    const message = suspiciousContent
      ? `XSS pattern detected: "${suspiciousContent.substring(0, 50)}..."`
      : 'Cross-Site Scripting attempt detected';

    return new XssException(message, context);
  }
}
