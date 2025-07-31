import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub?: string;
  id?: string;
  [key: string]: unknown;
}

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// Decorator to mark routes as public (skip authentication)
export const Public = () => Reflect.metadata('isPublic', true);

// Decorator to mark routes as requiring authentication
export const Protected = () => Reflect.metadata('isProtected', true);

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.logger.warn(
        `Authentication failed: No token provided for ${request.url}`,
      );
      throw new UnauthorizedException('Access token is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('security.jwt.secret'),
      });

      // Add user info to request object
      (request as AuthenticatedRequest).user = payload;

      this.logger.debug(
        `Authentication successful for user: ${payload.sub || payload.id}`,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorName = error instanceof Error ? error.name : 'Unknown';

      this.logger.warn(
        `Authentication failed: Invalid token - ${errorMessage}`,
      );

      if (errorName === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid access token');
      } else if (errorName === 'TokenExpiredError') {
        throw new UnauthorizedException('Access token has expired');
      } else if (errorName === 'NotBeforeError') {
        throw new UnauthorizedException('Access token not active yet');
      } else {
        throw new UnauthorizedException('Authentication failed');
      }
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return undefined;
    }

    // Support both "Bearer token" and "token" formats
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // If it doesn't start with Bearer, treat the whole header as token
    return authHeader;
  }
}
