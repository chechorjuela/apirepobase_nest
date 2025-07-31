import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ExampleEntity } from '../../modules/example/entities/example.entity';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: (process.env.DATABASE_TYPE as any) || 'sqlite',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432') || 5432,
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
    database:
      process.env.DATABASE_NAME ||
      process.env.DATABASE_PATH ||
      'database.sqlite',

    // Entities
    entities: [ExampleEntity],

    // Synchronization (disable in production)
    synchronize:
      process.env.NODE_ENV !== 'production' &&
      process.env.DATABASE_SYNC !== 'false',

    // Logging
    logging:
      process.env.DATABASE_LOGGING === 'true' ||
      process.env.NODE_ENV === 'development',
    logger: 'advanced-console',

    // Connection pool settings
    extra: {
      connectionLimit:
        parseInt(process.env.DATABASE_CONNECTION_LIMIT || '10') || 10,
      acquireTimeout:
        parseInt(process.env.DATABASE_ACQUIRE_TIMEOUT || '60000') || 60000,
      timeout: parseInt(process.env.DATABASE_TIMEOUT || '60000') || 60000,
    },

    // Retry settings
    retryAttempts: parseInt(process.env.DATABASE_RETRY_ATTEMPTS || '3') || 3,
    retryDelay: parseInt(process.env.DATABASE_RETRY_DELAY || '3000') || 3000,

    // Auto load entities
    autoLoadEntities: true,

    // Migrations
    migrations: ['dist/migrations/*.js'],
    migrationsTableName: 'migrations',
    migrationsRun: process.env.DATABASE_MIGRATIONS_RUN === 'true',

    // SSL settings for production
    ssl:
      process.env.NODE_ENV === 'production'
        ? {
            rejectUnauthorized: false,
          }
        : false,

    connectTimeoutMS:
      parseInt(process.env.DATABASE_CONNECT_TIMEOUT || '10000') || 10000,

    ...(process.env.DATABASE_TYPE === 'postgres' && {
      schema: process.env.DATABASE_SCHEMA || 'public',
      searchPath: process.env.DATABASE_SEARCH_PATH || 'public',
    }),

    ...(process.env.DATABASE_TYPE === 'mysql' && {
      charset: 'utf8mb4',
      timezone: 'Z',
    }),

    ...(process.env.DATABASE_TYPE === 'sqlite' && {
      database: process.env.DATABASE_PATH || 'database.sqlite',
      synchronize: true, // Safe for SQLite in development
    }),
  }),
);

export const AppDataSource = new DataSource({
  type: (process.env.DATABASE_TYPE as any) || 'sqlite',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432') || 5432,
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'password',
  database:
    process.env.DATABASE_NAME || process.env.DATABASE_PATH || 'database.sqlite',
  entities: [ExampleEntity],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: false, // Always false for CLI operations
} as DataSourceOptions);
