import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SecurityModule } from './common/security/security.module';
import { ResponseInterceptor } from './common/interceptors';
import { HttpExceptionFilter } from './common/filters';
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
    SecurityModule,
    ExampleModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
