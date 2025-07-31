import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { SecurityService } from '../services/security.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);
  private readonly requestCounts = new Map<
    string,
    { count: number; resetTime: number }
  >();
  private readonly suspiciousPatterns = [
    /('|(\\x27)|(\\x2D\\x2D)|(\u0027))/gi,
    /(union|select|insert|delete|update|drop|create|alter|exec|execute)/gi,
    // XSS patterns
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /[;&|`$<>(){}[\]\\'"]/g,
    /\.\.\//g,
  ];

  constructor(
    private readonly securityService: SecurityService,
    private readonly configService: ConfigService,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const environment = this.configService.get<string>(
      'app.env',
      process.env.NODE_ENV ?? 'development',
    );
    const isDevelopment = environment === 'development';

    const envSecurityEnabled = process.env.SECURITY_ENABLED;
    let isSecurityEnabled;

    if (envSecurityEnabled !== undefined) {
      isSecurityEnabled = envSecurityEnabled === 'true';
    } else {
      isSecurityEnabled = this.configService.get<boolean>(
        'security.enabled',
        !isDevelopment,
      );
    }

    const clientIp = this.getClientIp(req);
    const userAgent = req.get('User-Agent') ?? '';
    const host = req.get('Host') ?? '';

    this.setSecurityHeaders(res);

    if (isDevelopment && !isSecurityEnabled) {
      this.logger.debug(
        `🔓 [DEV MODE] Security validations DISABLED - Request: ${req.method} ${req.url}`,
      );
      next();
      return;
    }

    this.logger.debug(
      `🔒 [SECURITY ACTIVE] Validating request: ${req.method} ${req.url}`,
    );

    if (!this.isValidHost(host)) {
      throw new HttpException('Invalid host header', HttpStatus.BAD_REQUEST);
    }

    if (!this.checkRateLimit(clientIp)) {
      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (this.isSuspiciousUserAgent(userAgent)) {
      throw new HttpException(
        'Suspicious user agent detected',
        HttpStatus.FORBIDDEN,
      );
    }

    if (this.isBlacklistedIp(clientIp)) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }

    this.validateSecurityHeaders(req);

    this.validateRequestSize(req);

    if (req.body) {
      this.validateRequestBody(req.body);
    }

    if (req.query) {
      this.validateQueryParams(req.query);
    }

    this.validateUrlPath(req.url);

    next();
  }

  private getClientIp(req: Request): string {
    return (
      req.ip ??
      req.connection.remoteAddress ??
      req.socket.remoteAddress ??
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ??
      'unknown'
    );
  }

  private checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 100; // Max 100 requests per 15 minutes

    const requestData = this.requestCounts.get(ip);

    if (!requestData || now > requestData.resetTime) {
      this.requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (requestData.count >= maxRequests) {
      return false;
    }

    requestData.count++;
    return true;
  }

  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousAgents = [
      'sqlmap',
      'nikto',
      'burp',
      'w3af',
      'acunetix',
      'netsparker',
      'havij',
      'pangolin',
      'nmap',
      'hydra',
      'medusa',
      'brutus',
      'gobuster',
      'dirb',
      'dirbuster',
      'wfuzz',
      'ffuf',
    ];

    const lowerAgent = userAgent.toLowerCase();
    return suspiciousAgents.some((agent) => lowerAgent.includes(agent));
  }

  private validateRequestBody(body: unknown): void {
    this.recursiveValidation(body, 'request body');
  }

  private validateQueryParams(query: unknown): void {
    this.recursiveValidation(query, 'query parameters');
  }

  private recursiveValidation(obj: unknown, context: string): void {
    if (typeof obj === 'string') {
      this.validateString(obj, context);
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        this.recursiveValidation(item, `${context}[${index}]`);
      });
    } else if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach((key) => {
        this.recursiveValidation(
          (obj as Record<string, unknown>)[key],
          `${context}.${key}`,
        );
      });
    }
  }

  private validateString(value: string, context: string): void {
    // Check string length
    if (value.length > 10000) {
      throw new HttpException(
        `Input too long in ${context}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (this.suspiciousPatterns.some((pattern) => pattern.test(value))) {
      throw new HttpException(
        `Suspicious content detected in ${context}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (this.securityService.containsOSCommands(value)) {
      throw new HttpException(
        `OS command detected in ${context}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!this.securityService.isValidPath(value)) {
      throw new HttpException(
        `Directory traversal attempt detected in ${context}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private isValidHost(host: string): boolean {
    if (!host) {
      return false;
    }

    const allowedHosts = this.configService.get<string[]>(
      'security.allowedHosts',
      ['localhost:3000', 'localhost', '127.0.0.1:3000', '127.0.0.1'],
    );

    return allowedHosts.some(
      (allowedHost) =>
        host === allowedHost ||
        host.startsWith(`${allowedHost.split(':')[0]}:`),
    );
  }

  private isBlacklistedIp(ip: string): boolean {
    const blacklistedIps = this.configService.get<string[]>(
      'security.blacklistedIps',
      [],
    );
    const blacklistedRanges = this.configService.get<string[]>(
      'security.blacklistedRanges',
      [],
    );

    if (blacklistedIps.includes(ip)) {
      return true;
    }

    return blacklistedRanges.some((range) => {
      if (range.includes('/')) {
        const [network, mask] = range.split('/');
        if (!network || !mask) {
          return false;
        }
        const maskNum = parseInt(mask);
        if (Number.isNaN(maskNum)) {
          return false;
        }
        return ip.startsWith(
          network
            .split('.')
            .slice(0, maskNum / 8)
            .join('.'),
        );
      }
      return ip.startsWith(range);
    });
  }

  private validateSecurityHeaders(req: Request): void {
    // Check for suspicious headers (commented for future use)
    // const suspiciousHeaders = [
    //   'x-cluster-client-ip',
    //   'x-real-ip',
    //   'x-originating-ip',
    //   'x-forwarded-server',
    //   'x-forwarded-host',
    // ];

    const origin = req.get('Origin');
    // const referer = req.get('Referer'); // For future use

    // Validate Origin header
    if (origin && !this.isValidOrigin(origin)) {
      throw new HttpException('Invalid origin header', HttpStatus.FORBIDDEN);
    }

    const allHeaders = Object.entries(req.headers);
    for (const [, value] of allHeaders) {
      if (
        typeof value === 'string' &&
        (value.includes('\n') || value.includes('\r'))
      ) {
        throw new HttpException(
          'Header injection detected',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  private validateRequestSize(req: Request): void {
    const maxBodySize = this.configService.get<number>(
      'security.maxBodySize',
      1048576,
    ); // 1MB default
    const contentLength = parseInt(req.get('Content-Length') ?? '0');

    if (contentLength > maxBodySize) {
      throw new HttpException(
        'Request entity too large',
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    }
  }

  private validateUrlPath(url: string): void {
    const decodedUrl = decodeURIComponent(url);
    const suspiciousUrlPatterns = [
      /\.\.[/\\]/g,
      /%2e%2e[/\\]/gi,
      /%252e%252e[/\\]/gi,
      /\0/g, // Null bytes
      /%00/gi, // Encoded null bytes
      // eslint-disable-next-line no-control-regex
      /[\x00-\x1f\x7f-\x9f]/g, // Control characters
    ];

    if (suspiciousUrlPatterns.some((pattern) => pattern.test(decodedUrl))) {
      throw new HttpException(
        'Suspicious URL pattern detected',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (url.length > 2048) {
      throw new HttpException('URL too long', HttpStatus.BAD_REQUEST);
    }
  }

  private isValidOrigin(origin: string): boolean {
    const allowedOrigins = this.configService.get<string[]>(
      'security.allowedOrigins',
      ['http://localhost:3000', 'https://localhost:3000'],
    );

    if (Array.isArray(allowedOrigins)) {
      return allowedOrigins.includes(origin);
    }

    return allowedOrigins === '*' || allowedOrigins === origin;
  }

  private setSecurityHeaders(res: Response): void {
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security':
        'max-age=31536000; includeSubDomains; preload',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-DNS-Prefetch-Control': 'off',
      'X-Download-Options': 'noopen',
      'X-Permitted-Cross-Domain-Policies': 'none',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Origin-Agent-Cluster': '?1',
      'Permissions-Policy':
        'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
      'Content-Security-Policy': this.buildCSP(),
      'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex',
    };

    Object.entries(securityHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');
  }

  private buildCSP(): string {
    const isProduction = this.configService.get('app.env') === 'production';

    if (isProduction) {
      return "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; media-src 'none'; object-src 'none'; child-src 'none'; worker-src 'none'; frame-ancestors 'none'; form-action 'self'; base-uri 'self'; manifest-src 'self'";
    } else {
      return "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; media-src 'none'; object-src 'none'; child-src 'none'; worker-src 'none'; frame-ancestors 'none'; form-action 'self'; base-uri 'self'; manifest-src 'self'";
    }
  }
}
