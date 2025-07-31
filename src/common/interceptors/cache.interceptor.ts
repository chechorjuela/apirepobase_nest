import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';

// Cache decorator
export const CacheResponse = (ttl: number = 60) =>
  Reflect.metadata('cacheResponse', { ttl });

// Skip cache decorator
export const SkipCache = () => Reflect.metadata('skipCache', true);

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly cache = new Map<
    string,
    { data: unknown; expires: number }
  >();

  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    // Check if caching is disabled for this route
    const skipCache = this.reflector.getAllAndOverride<boolean>('skipCache', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipCache) {
      return next.handle();
    }

    // Get cache configuration
    const cacheConfig = this.reflector.getAllAndOverride<{ ttl: number }>(
      'cacheResponse',
      [context.getHandler(), context.getClass()],
    );

    if (!cacheConfig) {
      return next.handle();
    }

    const cacheKey = this.generateCacheKey(request);
    const cachedData = this.cache.get(cacheKey);

    // Return cached data if valid
    if (cachedData && cachedData.expires > Date.now()) {
      // Set cache headers
      response.setHeader('X-Cache', 'HIT');
      response.setHeader(
        'X-Cache-TTL',
        Math.ceil((cachedData.expires - Date.now()) / 1000),
      );

      return of(cachedData.data);
    }

    // Execute request and cache result
    return next.handle().pipe(
      tap((data) => {
        if (response.statusCode === 200) {
          const ttlMs = cacheConfig.ttl * 1000;
          this.cache.set(cacheKey, {
            data,
            expires: Date.now() + ttlMs,
          });

          // Set cache headers
          response.setHeader('X-Cache', 'MISS');
          response.setHeader('X-Cache-TTL', cacheConfig.ttl);

          // Clean expired entries periodically
          this.cleanExpiredEntries();
        }
      }),
    );
  }

  private generateCacheKey(request: Request): string {
    const { url, query } = request;
    return `${url}:${JSON.stringify(query)}`;
  }

  private cleanExpiredEntries(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.expires <= now) {
        this.cache.delete(key);
      }
    }
  }

  // Method to clear cache (can be used by services)
  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}
