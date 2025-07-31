import { HttpStatus } from '@nestjs/common';
import { BaseSecurityException } from './base-security.exception';

export class CommandInjectionException extends BaseSecurityException {
  constructor(
    message: string = 'Command injection attempt detected',
    context?: string,
  ) {
    const fullMessage = context ? `${message} in ${context}` : message;

    super(
      fullMessage,
      HttpStatus.BAD_REQUEST,
      'SEC_003_COMMAND_INJECTION',
      'CRITICAL',
    );
  }

  static create(
    context: string,
    suspiciousContent?: string,
  ): CommandInjectionException {
    const message = suspiciousContent
      ? `OS command injection detected: "${suspiciousContent.substring(0, 50)}..."`
      : 'Command injection attempt detected';

    return new CommandInjectionException(message, context);
  }
}
