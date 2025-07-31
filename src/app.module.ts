import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import jwtConfig, {
  refreshTokenConfig,
  jwtSecurityConfig,
} from './config/auth/jwt.config';
import databaseConfig from './config/database/database.config';
import { SecurityModule } from './common/security/security.module';
import {
  ResponseInterceptor,
  LoggingInterceptor,
  TimeoutInterceptor,
  CacheInterceptor,
} from './common/interceptors';
import { HttpExceptionFilter, ValidationFilter } from './common/filters';
import { AuthGuard } from './common/security/guards';
import { CustomValidationPipe } from './common/pipes';
import { RequestLoggingMiddleware } from './common/security/middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExampleModule } from './modules/example/example.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [databaseConfig, jwtConfig, refreshTokenConfig, jwtSecurityConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const config = configService.get('database');
        if (!config) {
          throw new Error('Database configuration not found');
        }
        return config;
      },
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const config = configService.get('jwt');
        if (!config) {
          throw new Error('JWT configuration not found');
        }
        return config;
      },
      inject: [ConfigService],
      global: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 3, // 3 requests per second
      },
      {
        name: 'medium',
        ttl: 60000, // 1 minute
        limit: 20, // 20 requests per minute
      },
      {
        name: 'long',
        ttl: 900000, // 15 minutes
        limit: 100, // 100 requests per 15 minutes
      },
    ]),
    SecurityModule,
    ExampleModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global Interceptors (order matters - first to last)
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    // Global Filters (order matters - most specific to least specific)
    {
      provide: APP_FILTER,
      useClass: ValidationFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // Global Guards
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // Global Pipes
    {
      provide: APP_PIPE,
      useClass: CustomValidationPipe,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware).forRoutes('*'); // Apply to all routes
  }
}
