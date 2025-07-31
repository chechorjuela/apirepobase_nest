import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs(
  'jwt',
  (): JwtModuleOptions => ({
    // Secret key (should be strong in production)
    secret:
      process.env.JWT_SECRET ||
      process.env.JWT_ACCESS_SECRET ||
      'your-super-secret-jwt-key-change-in-production',

    // Default sign options
    signOptions: {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      issuer: process.env.JWT_ISSUER || 'api-base-project',
      audience: process.env.JWT_AUDIENCE || 'api-base-project-users',
      algorithm: 'HS256',
    },

    // Verification options
    verifyOptions: {
      issuer: process.env.JWT_ISSUER || 'api-base-project',
      audience: process.env.JWT_AUDIENCE || 'api-base-project-users',
      algorithms: ['HS256'],
      clockTolerance: parseInt(process.env.JWT_CLOCK_TOLERANCE || '0') || 0,
      maxAge: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    },
  }),
);

// Refresh Token Configuration
export const refreshTokenConfig = registerAs('refreshToken', () => ({
  secret:
    process.env.JWT_REFRESH_SECRET ||
    process.env.JWT_SECRET ||
    'your-super-secret-refresh-key-change-in-production',
  expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  issuer: process.env.JWT_ISSUER || 'api-base-project',
  audience: process.env.JWT_AUDIENCE || 'api-base-project-users',
}));

// JWT Security Configuration
export const jwtSecurityConfig = registerAs('jwtSecurity', () => ({
  // Token blacklisting
  enableBlacklist: process.env.JWT_ENABLE_BLACKLIST === 'true',
  blacklistRedisUrl: process.env.REDIS_URL,

  // Rate limiting for auth endpoints
  authRateLimit: {
    windowMs:
      parseInt(process.env.AUTH_RATE_LIMIT_WINDOW || '900000') ||
      15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5') || 5, // 5 attempts per window
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
  },

  // Password requirements
  passwordPolicy: {
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8') || 8,
    requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
    requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
    requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS !== 'false',
    requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL !== 'false',
    maxAge: parseInt(process.env.PASSWORD_MAX_AGE_DAYS || '90') || 90, // days
    preventReuse: parseInt(process.env.PASSWORD_PREVENT_REUSE || '5') || 5, // last N passwords
  },

  // Account lockout
  accountLockout: {
    enabled: process.env.ACCOUNT_LOCKOUT_ENABLED !== 'false',
    maxAttempts: parseInt(process.env.ACCOUNT_LOCKOUT_MAX_ATTEMPTS || '5') || 5,
    lockoutDuration:
      parseInt(process.env.ACCOUNT_LOCKOUT_DURATION || '1800000') ||
      30 * 60 * 1000, // 30 minutes
    resetAfterSuccess:
      process.env.ACCOUNT_LOCKOUT_RESET_AFTER_SUCCESS !== 'false',
  },

  // Session management
  session: {
    maxConcurrentSessions:
      parseInt(process.env.MAX_CONCURRENT_SESSIONS || '3') || 3,
    enableSessionKillSwitch: process.env.ENABLE_SESSION_KILL_SWITCH === 'true',
    sessionTimeout:
      parseInt(process.env.SESSION_TIMEOUT || '86400000') ||
      24 * 60 * 60 * 1000, // 24 hours
  },

  // Two-factor authentication
  twoFactor: {
    enabled: process.env.TWO_FACTOR_ENABLED === 'true',
    issuer: process.env.TWO_FACTOR_ISSUER || 'API Base Project',
    tokenWindow: parseInt(process.env.TWO_FACTOR_TOKEN_WINDOW || '1') || 1, // time steps
    tokenLength: parseInt(process.env.TWO_FACTOR_TOKEN_LENGTH || '6') || 6,
  },
}));
