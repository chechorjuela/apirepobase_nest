import { HttpStatus } from '@nestjs/common';
import { BaseSecurityException } from './base-security.exception';

export class SuspiciousActivityException extends BaseSecurityException {
  constructor(
    message: string = 'Suspicious activity detected',
    context?: string,
  ) {
    const fullMessage = context ? `${message}: ${context}` : message;

    super(
      fullMessage,
      HttpStatus.FORBIDDEN,
      'SEC_006_SUSPICIOUS_ACTIVITY',
      'HIGH',
    );
  }

  static createForUserAgent(userAgent: string): SuspiciousActivityException {
    return new SuspiciousActivityException(
      'Suspicious user agent detected',
      `User-Agent: ${userAgent.substring(0, 100)}`,
    );
  }

  static createForBlacklistedIP(ip: string): SuspiciousActivityException {
    return new SuspiciousActivityException(
      'Access denied from blacklisted IP',
      `IP: ${ip}`,
    );
  }

  static createForInvalidHost(host: string): SuspiciousActivityException {
    return new SuspiciousActivityException(
      'Invalid host header',
      `Host: ${host}`,
    );
  }

  static createForHeaderInjection(header: string): SuspiciousActivityException {
    return new SuspiciousActivityException(
      'Header injection attempt detected',
      `Header contains invalid characters: ${header.substring(0, 50)}`,
    );
  }
}
