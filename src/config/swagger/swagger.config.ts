import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(
  app: INestApplication,
  configService: ConfigService,
): void {
  const config = new DocumentBuilder()
    .setTitle('Enterprise NestJS API')
    .setDescription(
      'Complete enterprise-grade API with CQRS, Security, and advanced features',
    )
    .setVersion('1.0')
    .addTag('Examples', 'ExampleEntity CQRS operations')
    .addTag('Security', 'Security-related endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3000', 'Development server')
    .addServer('https://localhost:3000', 'Development server (HTTPS)')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const swaggerPath = configService.get<string>('SWAGGER_PATH', 'api');

  SwaggerModule.setup(swaggerPath, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      sortTagsAlphabetically: true,
    },
    customSiteTitle: 'Enterprise NestJS API Documentation',
    customfavIcon: '/favicon.ico',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
  });
}
