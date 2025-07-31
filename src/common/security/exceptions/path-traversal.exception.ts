import { HttpStatus } from '@nestjs/common';
import { BaseSecurityException } from './base-security.exception';

export class PathTraversalException extends BaseSecurityException {
  constructor(
    message: string = 'Path traversal attempt detected',
    context?: string,
  ) {
    const fullMessage = context ? `${message} in ${context}` : message;

    super(
      fullMessage,
      HttpStatus.BAD_REQUEST,
      'SEC_004_PATH_TRAVERSAL',
      'HIGH',
    );
  }

  static create(
    context: string,
    suspiciousPath?: string,
  ): PathTraversalException {
    const message = suspiciousPath
      ? `Directory traversal detected: "${suspiciousPath.substring(0, 50)}..."`
      : 'Path traversal attempt detected';

    return new PathTraversalException(message, context);
  }
}
