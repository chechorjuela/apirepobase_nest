import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SecurityService } from './services/security.service';
import { SecurityMiddleware } from './middleware/security.middleware';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          name: 'short',
          ttl: configService.get<number>('security.rateLimit.short.ttl', 1000),
          limit: configService.get<number>('security.rateLimit.short.limit', 3),
        },
        {
          name: 'medium',
          ttl: configService.get<number>(
            'security.rateLimit.medium.ttl',
            10000,
          ),
          limit: configService.get<number>(
            'security.rateLimit.medium.limit',
            20,
          ),
        },
        {
          name: 'long',
          ttl: configService.get<number>('security.rateLimit.long.ttl', 60000),
          limit: configService.get<number>(
            'security.rateLimit.long.limit',
            100,
          ),
        },
      ],
      inject: [ConfigService],
    }),
  ],
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(SecurityMiddleware).forRoutes('*');
  }
}
