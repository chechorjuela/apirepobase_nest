import { HttpException, HttpStatus } from '@nestjs/common';

export abstract class BaseSecurityException extends HttpException {
  public readonly timestamp: string;
  public readonly securityCode: string;
  public readonly severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  constructor(
    message: string,
    status: HttpStatus,
    securityCode: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM',
    cause?: Error,
  ) {
    super(
      {
        message,
        securityCode,
        severity,
        timestamp: new Date().toISOString(),
        type: 'SECURITY_VIOLATION',
      },
      status,
      { cause },
    );

    this.timestamp = new Date().toISOString();
    this.securityCode = securityCode;
    this.severity = severity;
    this.name = this.constructor.name;
  }

  getSecurityDetails() {
    return {
      securityCode: this.securityCode,
      severity: this.severity,
      timestamp: this.timestamp,
      type: 'SECURITY_VIOLATION',
    };
  }
}
