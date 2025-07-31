import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to mark routes as public (skip authentication)
 * Use this decorator on controllers or individual route handlers
 * that should be accessible without authentication tokens
 */
export const Public = () => SetMetadata('isPublic', true);

/**
 * Decorator to mark routes as requiring authentication
 * This is mainly for explicit documentation as authentication
 * is required by default when AuthGuard is applied globally
 */
export const Protected = () => SetMetadata('isProtected', true);
