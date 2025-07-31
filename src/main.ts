import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { setupSwagger } from './config/swagger/swagger.config';
import { DataSource } from 'typeorm';
import figlet from 'figlet';
import chalk from 'chalk';
import ora from 'ora';

async function bootstrap(): Promise<void> {
  console.clear();
  try {
    // Safe approach - check if figlet has textSync method
    if (figlet && typeof figlet === 'object' && 'textSync' in figlet) {
      const titleText = String(
        (
          figlet as { textSync: (text: string, options?: any) => string }
        ).textSync('API Base Project', { horizontalLayout: 'full' }),
      );
      console.log(chalk.blue(titleText));
    } else {
      console.log(chalk.blue('API Base Project'));
    }
  } catch (error) {
    console.error(chalk.red('Error generating ASCII art:'), error);
    console.log(chalk.blue('API Base Project'));
  }
  console.log(chalk.yellow('🚀 Starting NestJS Application...\n'));

  const startSpinner = ora('Initializing application...').start();

  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    startSpinner.text = 'Configuring services...';
    const logger = new Logger('Bootstrap');

    const configService = app.get<ConfigService>(ConfigService);

    // Security middleware
    app.use(helmet(configService.get('security.helmet', {})));

    // Global validation pipe with security options
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: configService.get<boolean>(
          'security.validation.stripUnknownProperties',
          true,
        ),
        forbidNonWhitelisted: configService.get<boolean>(
          'security.validation.forbidNonWhitelisted',
          true,
        ),
        transform: configService.get<boolean>(
          'security.validation.transform',
          true,
        ),
        disableErrorMessages: configService.get<boolean>(
          'security.validation.disableErrorMessages',
          false,
        ),
      }),
    );

    // CORS configuration
    app.enableCors(configService.get('security.cors'));

    // Set up Swagger
    setupSwagger(app, configService);

    const port = configService.get<number>('app.port', 3000);
    await app.listen(port, configService.get<string>('app.host', '0.0.0.0'));

    const baseUrl = await app.getUrl();
    const swaggerPath = configService.get<string>('SWAGGER_PATH', 'api');

    // Display security configuration
    const environment = configService.get<string>(
      'app.env',
      process.env.NODE_ENV ?? 'development',
    );
    const isDevelopment = environment === 'development';

    // Check security enabled from multiple sources (priority: env var > config > default)
    const envSecurityEnabled = process.env.SECURITY_ENABLED;
    let isSecurityEnabled: boolean;

    if (envSecurityEnabled !== undefined) {
      isSecurityEnabled = envSecurityEnabled === 'true';
    } else {
      isSecurityEnabled = configService.get<boolean>(
        'security.enabled',
        !isDevelopment,
      );
    }

    startSpinner.succeed('Application started successfully');

    logger.log(`\n${chalk.bold.cyan('='.repeat(60))}`);
    if (isDevelopment && !isSecurityEnabled) {
      logger.warn('🔓 SECURITY CONFIGURATION DISABLED (DEV MODE)');
      logger.log('='.repeat(60));
      logger.warn(
        '\n⚠️  WARNING: Security validations are DISABLED for development!',
      );
      logger.warn('   - SQL Injection protection: OFF');
      logger.warn('   - XSS protection: OFF');
      logger.warn('   - Command injection protection: OFF');
      logger.warn('   - Rate limiting: OFF');
      logger.warn('   - Host validation: OFF');
      logger.warn('   - User agent validation: OFF');
      logger.log('\n💡 To enable security in dev, set: security.enabled=true');
      logger.log(
        '\n📝 Security headers are still applied for browser compatibility.',
      );
    } else {
      logger.log('🔒 SECURITY CONFIGURATION ENABLED');
      logger.log('='.repeat(60));
    }

    // Rate Limiting
    logger.log('\n📊 RATE LIMITING:');
    logger.log(
      `   Short: ${configService.get('security.rateLimit.short.limit')} requests per ${configService.get('security.rateLimit.short.ttl')}ms`,
    );
    logger.log(
      `   Medium: ${configService.get('security.rateLimit.medium.limit')} requests per ${configService.get('security.rateLimit.medium.ttl')}ms`,
    );
    logger.log(
      `   Long: ${configService.get('security.rateLimit.long.limit')} requests per ${configService.get('security.rateLimit.long.ttl')}ms`,
    );
    logger.log(
      `   Global: ${configService.get('security.rateLimit.global.max')} requests per ${configService.get('security.rateLimit.global.windowMs')}ms`,
    );
    logger.log(
      `   Login: ${configService.get('security.rateLimit.login.max')} attempts per ${configService.get('security.rateLimit.login.windowMs')}ms`,
    );

    // CORS
    logger.log('\n🌐 CORS PROTECTION:');
    const origins = configService.get<string | string[]>(
      'security.cors.origin',
      ['*'],
    );
    logger.log(
      `   Allowed Origins: ${Array.isArray(origins) ? origins.join(', ') : origins}`,
    );
    const methods = configService.get<string[]>('security.cors.methods', [
      'GET',
      'POST',
    ]);
    logger.log(`   Allowed Methods: ${methods.join(', ')}`);
    logger.log(
      `   Credentials: ${configService.get('security.cors.credentials')}`,
    );

    // Security Headers
    logger.log('\n🛡️  SECURITY HEADERS:');
    logger.log(
      `   CSP Enabled: ${configService.get('security.helmet.contentSecurityPolicy.enabled')}`,
    );
    logger.log(
      `   HSTS Enabled: ${configService.get('security.helmet.hsts.enabled')}`,
    );
    logger.log(
      `   HSTS Max-Age: ${configService.get('security.helmet.hsts.maxAge')} seconds`,
    );

    // JWT Configuration
    logger.log('\n🔑 JWT CONFIGURATION:');
    logger.log(
      `   Token Expiry: ${configService.get('security.jwt.expiresIn')}`,
    );
    logger.log(
      `   Refresh Token Expiry: ${configService.get('security.jwt.refreshExpiresIn')}`,
    );
    logger.log(`   Issuer: ${configService.get('security.jwt.issuer')}`);

    // Input Validation
    logger.log('\n✅ INPUT VALIDATION:');
    logger.log(
      `   Max Input Length: ${configService.get('security.validation.maxInputLength')} characters`,
    );
    logger.log(
      `   Strip Unknown Properties: ${configService.get('security.validation.stripUnknownProperties')}`,
    );
    logger.log(
      `   Forbid Non-Whitelisted: ${configService.get('security.validation.forbidNonWhitelisted')}`,
    );

    // Blocked Threats
    const suspiciousAgents = configService.get<string[]>(
      'security.suspiciousUserAgents',
      [],
    );
    const blockedCommands = configService.get<string[]>(
      'security.blockedCommands',
      [],
    );
    logger.log('\n🚫 BLOCKED THREATS:');
    logger.log(
      `   Suspicious User Agents: ${suspiciousAgents.length} patterns blocked`,
    );
    logger.log(`   OS Commands: ${blockedCommands.length} commands blocked`);

    // Session Security
    logger.log('\n🍪 SESSION SECURITY:');
    logger.log(
      `   HTTP Only: ${configService.get('security.session.cookie.httpOnly')}`,
    );
    logger.log(
      `   Secure: ${configService.get('security.session.cookie.secure')}`,
    );
    logger.log(
      `   Max Age: ${configService.get('security.session.cookie.maxAge')}ms`,
    );

    // Bcrypt
    logger.log('\n🔐 PASSWORD HASHING:');
    logger.log(
      `   Bcrypt Salt Rounds: ${configService.get('security.bcrypt.saltRounds')}`,
    );

    // Database Connection Info
    logger.log(`\n${chalk.bold.cyan('='.repeat(60))}`);
    logger.log('🗄️  DATABASE CONNECTION');
    logger.log('='.repeat(60));

    try {
      const dataSource = app.get(DataSource);
      if (dataSource?.isInitialized) {
        logger.log('✅ Database Status: CONNECTED');
        logger.log(
          `🏠 Host: ${configService.get('database.host')}:${configService.get('database.port')}`,
        );
        logger.log(`🗃️  Database: ${configService.get('database.name')}`);
        logger.log(`👤 Username: ${configService.get('database.username')}`);
        logger.log(
          `🔄 Synchronize: ${configService.get('database.synchronize')}`,
        );
        logger.log(`📝 Logging: ${configService.get('database.logging')}`);
        logger.log(
          `🔄 Retry Attempts: ${configService.get('database.retryAttempts')}`,
        );
        logger.log(
          `⏱️  Retry Delay: ${configService.get('database.retryDelay')}ms`,
        );
        logger.log(`🏊 Pool Max: ${configService.get('database.poolMax')}`);
        logger.log(`🏊 Pool Min: ${configService.get('database.poolMin')}`);
        logger.log(
          `⏰ Pool Acquire: ${configService.get('database.poolAcquire')}ms`,
        );
        logger.log(`💤 Pool Idle: ${configService.get('database.poolIdle')}ms`);

        // Show connection driver info
        logger.log(`🔧 Driver: ${dataSource.driver.constructor.name}`);
        logger.log(`📊 Connected: ${new Date().toISOString()}`);
      } else {
        logger.warn('❌ Database Status: NOT CONNECTED');
      }
    } catch (error: unknown) {
      logger.error('❌ Database Status: CONNECTION ERROR');
      if (error instanceof Error) {
        logger.error(`❗ Error: ${error.message}`);
      } else {
        logger.error(
          '❗ Unknown error occurred while connecting to the database.',
        );
      }
    }

    logger.log(`\n${chalk.bold.cyan('='.repeat(60))}`);
    logger.log('🚀 APPLICATION STATUS');
    logger.log('='.repeat(60));
    logger.log(`🚀 Application is running on: ${baseUrl}`);
    logger.log(
      `📋 Swagger documentation available at: ${baseUrl}/${swaggerPath}`,
    );
    logger.log(`🌍 Environment: ${configService.get('app.env')}`);
    logger.log('🔒 Security middleware: ACTIVE');
    logger.log(`${'='.repeat(60)}\n`);

    // Final startup message with colored text
    console.log(
      chalk.green.bold('\n🎉 Application is ready to accept connections!'),
    );
    console.log(
      chalk.blue(`\n📱 Access your API at: ${chalk.underline(baseUrl)}`),
    );
    console.log(
      chalk.blue(
        `📚 API Documentation: ${chalk.underline(`${baseUrl}/${swaggerPath}`)}`,
      ),
    );
    console.log(
      chalk.magenta(
        '\n🛠️  Development mode: File changes will restart the server\n',
      ),
    );
  } catch (error) {
    startSpinner.fail('Failed to start application');
    console.error(chalk.red('\n❌ Application startup failed:'));
    console.error(
      chalk.red(error instanceof Error ? error.message : 'Unknown error'),
    );
    if (error instanceof Error && error.stack) {
      console.error(chalk.gray(error.stack));
    }
    process.exit(1);
  }
}

void bootstrap().catch((error) => {
  console.error(chalk.red('\n🚨 Fatal error during bootstrap:'));
  console.error(error);
  process.exit(1);
});
