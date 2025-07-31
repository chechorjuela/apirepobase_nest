import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SecurityModule } from './common/security/security.module';
import {
  ResponseInterceptor,
  LoggingInterceptor,
  TimeoutInterceptor,
  CacheInterceptor,
} from './common/interceptors';
import { HttpExceptionFilter, ValidationFilter } from './common/filters';
import { AuthGuard } from './common/guards';
import { CustomValidationPipe } from './common/pipes';
import { RequestLoggingMiddleware } from './common/middlewares';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExampleEntity } from './modules/example/entities/example.entity';
import { ExampleModule } from './modules/example/example.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get<string>('DATABASE_PATH', 'database.sqlite'),
        entities: [ExampleEntity],
        synchronize: configService.get<boolean>('DATABASE_SYNC', true),
        logging: configService.get<boolean>('DATABASE_LOGGING', false),
        retryAttempts: configService.get<number>('database.retryAttempts', 3),
        retryDelay: configService.get<number>('database.retryDelay', 3000),
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(
          'security.jwt.secret',
          'your-secret-key',
        ),
        signOptions: {
          expiresIn: configService.get<string>('security.jwt.expiresIn', '1h'),
        },
      }),
      inject: [ConfigService],
      global: true,
    }),
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
