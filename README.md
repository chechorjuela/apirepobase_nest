# Base API REST Project

🚀 A production-ready RESTful API built with [NestJS](https://nestjs.com/) featuring comprehensive security, Docker
support, and configurable environments.

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

---

## 📋 Table of Contents

- [Description](#description)
- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Docker Deployment](#docker-deployment)
- [Available Commands](#available-commands)
- [Security Configuration](#security-configuration)
- [API Documentation](#api-documentation)
- [Database Setup](#database-setup)
- [Authentication & Authorization](#authentication--authorization)
- [Error Handling](#error-handling)
- [Logging](#logging)
- [Testing](#testing)
- [CI/CD Pipeline](#cicd-pipeline)
- [Troubleshooting](#troubleshooting)
- [Performance Optimization](#performance-optimization)
- [Migration Guide](#migration-guide)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [License](#license)

---

## 📖 Description

This is a comprehensive starter repository for building secure, scalable server-side applications using NestJS. It
includes:

- **Enterprise-grade security** with configurable protection levels
- **Docker containerization** for easy deployment
- **Database integration** with TypeORM and PostgreSQL
- **API documentation** with Swagger/OpenAPI
- **Comprehensive testing** setup
- **Development-friendly** security toggles
- **Production-ready** configurations

---

## ✨ Features

### 🛡️ Security Features

- SQL Injection Protection
- XSS (Cross-Site Scripting) Protection
- Command Injection Protection
- CSRF Protection
- Rate Limiting (Multi-tier)
- Host Header Validation
- User Agent Validation
- Request Size Validation
- Directory Traversal Protection
- Security Headers (HSTS, CSP, etc.)

### 🔧 Development Features

- Hot reload in development
- Environment-based configuration
- Comprehensive logging
- Error handling with filters
- Input validation with class-validator
- Auto-generated API documentation
- Database migrations
- Docker support

### 🚀 Production Features

- Optimized builds
- Health checks
- Monitoring ready
- Scalable architecture
- Security hardening

---

## 📋 Prerequisites

- **Node.js** v18 or later
- **npm** v8 or later (or **yarn**)
- **Docker** and **Docker Compose** (for containerized deployment)
- **PostgreSQL** (if running without Docker)

---

## 🔧 Project Setup

### 📦 Available Commands

#### 🚀 Development Commands

| Command                    | Description                                     |
| -------------------------- | ----------------------------------------------- |
| `npm run start:dev`        | Start development server with security disabled |
| `npm run start:dev:secure` | Start development server with security enabled  |
| `npm run start:prod`       | Start production server                         |
| `npm run build`            | Build the application for production            |
| `npm run test`             | Run unit tests                                  |
| `npm run test:e2e`         | Run end-to-end tests                            |

#### 🛠️ Quality & Maintenance Commands

| Command                 | Description                                 |
| ----------------------- | ------------------------------------------- |
| `npm run lint`          | Fix lint issues using ESLint                |
| `npm run format`        | Format code with Prettier                   |
| `npm run quality:check` | Run full quality check (lint, format, test) |
| `npm run quality:fix`   | Auto-fix code quality issues                |

#### 🔒 Security Management Commands

| Command                    | Description                                 |
| -------------------------- | ------------------------------------------- |
| `npm run security:enable`  | Enable security validations in development  |
| `npm run security:disable` | Disable security validations in development |

### 📚 Documentation Overview

#### 📝 Code Quality & Standards

- **[Code Quality Guidelines](docs/CODE_QUALITY.md)** - ESLint, Prettier, and coding standards
- **Git hooks** - Pre-commit and pre-push validation
- **CI/CD** - GitHub Actions quality pipeline
- **Testing** - Unit, integration, and E2E test guidelines

#### 📓 API Documentation

- **Swagger UI**: Interactive API documentation at `/api`
- **OpenAPI Spec**: JSON specification at `/api-json`
- **Postman Collection**: Available in `/docs/postman/`

#### 🛠️ IDE Configuration

- **IntelliJ IDEA/WebStorm**: Pre-configured project settings
- **ESLint**: Auto-fix on save enabled
- **Prettier**: Code formatting on save
- **Run Configurations**: Ready-to-use npm scripts

#### 📖 Additional Resources

- **[NestJS Documentation](https://docs.nestjs.com)**
- **[TypeORM Documentation](https://typeorm.io)**
- **[Docker Documentation](https://docs.docker.com)**
- **[PostgreSQL Documentation](https://www.postgresql.org/docs)**

### 1. Clone the repository

```bash
git clone <repository-url>
cd base-api-rest-project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

See [Environment Configuration](#environment-configuration) section below for detailed setup.

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory with the following variables:

```bash
# Application Configuration
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Security Configuration
SECURITY_ENABLED=false  # Set to true to enable security in development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=base_api_db
DB_SYNCHRONIZE=true     # Set to false in production
DB_LOGGING=true         # Set to false in production

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=base-api-rest

# Rate Limiting
RATE_LIMIT_SHORT=3      # requests per second
RATE_LIMIT_MEDIUM=20    # requests per 10 seconds
RATE_LIMIT_LONG=100     # requests per minute
RATE_LIMIT_GLOBAL=100   # requests per 15 minutes
RATE_LIMIT_LOGIN=5      # login attempts per 15 minutes

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
CORS_METHODS=GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS
CORS_CREDENTIALS=true

# Session Configuration
SESSION_SECRET=your-session-secret-change-this-in-production
SESSION_MAX_AGE=86400000  # 24 hours in milliseconds

# Bcrypt Configuration
BCRYPT_SALT_ROUNDS=12

# Swagger Configuration
SWAGGER_PATH=api
SWAGGER_TITLE=Base API REST
SWAGGER_DESCRIPTION=A comprehensive RESTful API built with NestJS
SWAGGER_VERSION=1.0.0
```

### Environment Files

You can create different environment files:

- `.env.development` - Development configuration
- `.env.production` - Production configuration
- `.env.test` - Test configuration

### Environment Variables Priority

1. **System Environment Variables** (highest priority)
2. **`.env.{NODE_ENV}` files**
3. **`.env` file**
4. **Default values** (lowest priority)

---

## 🐳 Docker Deployment

### Prerequisites for Docker

- Docker v20.10 or later
- Docker Compose v2.0 or later

### Quick Start with Docker

1. **Clone and setup**:

```bash
git clone <repository-url>
cd base-api-rest-project
cp .env.example .env  # Copy and configure environment variables
```

2. **Start with Docker Compose**:

```bash
docker-compose up -d
```

3. **Access the application**:

- API: http://localhost:3000
- API Documentation: http://localhost:3000/api

### Docker Compose Services

The `docker-compose.yml` includes:

- **app**: NestJS application
- **postgres**: PostgreSQL database
- **redis**: Redis for caching (optional)

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build -d

# Run database migrations
docker-compose exec app npm run migration:run

# Access application shell
docker-compose exec app sh

# Access database
docker-compose exec postgres psql -U postgres -d base_api_db
```

### Production Docker Deployment

1. **Create production environment file**:

```bash
cp .env.example .env.production
# Edit .env.production with production values
```

2. **Build production image**:

```bash
docker build -f Dockerfile.prod -t base-api-rest:latest .
```

3. **Run with production configuration**:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Docker Environment Variables

For Docker deployment, you can override environment variables:

```bash
# Using environment file
docker-compose --env-file .env.production up -d

# Using inline variables
NODE_ENV=production SECURITY_ENABLED=true docker-compose up -d
```

### Health Checks

The Docker container includes health checks:

```bash
# Check container health
docker-compose ps

# View health check logs
docker inspect base-api-rest_app_1 | grep -A 10 Health
```

---

## 🚀 Running the Application

### Local Development

#### Development Mode (Security Disabled)

```bash
npm run start:dev
```

#### Development Mode (Security Enabled)

```bash
npm run start:dev:secure
```

#### Production Mode

```bash
npm run build
npm run start:prod
```

### With Docker

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

---

## Available Commands

### 🚀 Development Commands

| Command                      | Security Status  | Description                                                    |
| ---------------------------- | ---------------- | -------------------------------------------------------------- |
| `npm run start:dev`          | 🔓 **DISABLED**  | Start development server with security validations disabled    |
| `npm run start:dev:secure`   | 🔒 **ENABLED**   | Start development server with all security validations enabled |
| `npm run start:debug`        | 🔓 **DISABLED**  | Start debug mode with security disabled                        |
| `npm run start:debug:secure` | 🔒 **ENABLED**   | Start debug mode with security enabled                         |
| `npm run start:prod`         | 🔒 **ALWAYS ON** | Start production server (security always enabled)              |
| `npm run build`              | -                | Build the application for production                           |

### 🔒 Security Management Commands

| Command                    | Description                                   |
| -------------------------- | --------------------------------------------- |
| `npm run security:enable`  | Enable security validations for development   |
| `npm run security:disable` | Disable security validations for development  |
| `npm run security:status`  | Display current security configuration status |

### 🧪 Testing Commands

| Command              | Description                    |
| -------------------- | ------------------------------ |
| `npm run test`       | Run unit tests                 |
| `npm run test:watch` | Run unit tests in watch mode   |
| `npm run test:e2e`   | Run end-to-end tests           |
| `npm run test:cov`   | Run tests with coverage report |
| `npm run test:debug` | Run tests in debug mode        |

### 🛠️ Code Quality & Development Tools

#### 🔍 Quality Check Commands

| Command                 | Description                                 |
| ----------------------- | ------------------------------------------- |
| `npm run quality:check` | Run full quality suite (lint, format, test) |
| `npm run quality:fix`   | Auto-fix code quality issues                |
| `npm run lint:check`    | Check code with ESLint (no fixes)           |
| `npm run format:check`  | Check code formatting with Prettier         |
| `npm run type-check`    | TypeScript type checking                    |

#### 🔧 Code Formatting & Linting

| Command          | Description                    |
| ---------------- | ------------------------------ |
| `npm run format` | Format code using Prettier     |
| `npm run lint`   | Lint and fix code using ESLint |

#### 🔗 Git Hooks (Automatic)

| Hook           | When          | What it does                                           |
| -------------- | ------------- | ------------------------------------------------------ |
| **pre-commit** | Before commit | Runs lint-staged (ESLint + Prettier on staged files)   |
| **pre-push**   | Before push   | Runs tests and build verification                      |
| **commit-msg** | On commit     | Validates commit message format (Conventional Commits) |

#### 🔱 IntelliJ IDEA Integration

- **ESLint**: Auto-fix on save ✅
- **Prettier**: Format on save ✅
- **Run Configs**: Pre-configured npm scripts ✅
- **Code Style**: TypeScript formatting rules ✅
- **Inspections**: Optimized for Node.js/NestJS ✅

---

## 🔒 Security Configuration

### Security Modes

| Mode                   | Security Status       | Description                                   |
| ---------------------- | --------------------- | --------------------------------------------- |
| **Development**        | 🔓 Disabled (default) | Security validations off for easier debugging |
| **Development Secure** | 🔒 Enabled            | All security features active in development   |
| **Production**         | 🔒 Always Enabled     | Security cannot be disabled                   |

### Environment Variables

- **`SECURITY_ENABLED`**:
    - `true`: Enable all security validations
    - `false`: Disable security validations (dev only)
    - **Default**: `false` in development, `true` in production

### Security Features

#### 🔐 When Security is ENABLED:

- ✅ **SQL Injection Protection** - Blocks malicious SQL patterns
- ✅ **XSS Protection** - Prevents script injection attacks
- ✅ **Command Injection Protection** - Blocks OS command execution
- ✅ **Rate Limiting** - Multi-tier request throttling
- ✅ **Host Header Validation** - Prevents host header attacks
- ✅ **User Agent Validation** - Blocks suspicious crawlers/tools
- ✅ **Input Validation** - Comprehensive request sanitization
- ✅ **Header Injection Prevention** - Blocks malicious headers
- ✅ **Directory Traversal Protection** - Prevents path traversal
- ✅ **Request Size Validation** - Limits payload sizes

#### 🔓 When Security is DISABLED (Dev Mode):

- ❌ All security validations are bypassed
- ✅ Security headers are still applied for browser compatibility
- ✅ CORS configuration remains active
- ⚠️ **WARNING**: Only use this in development!

### Configuration Priority

1. **Environment Variables** (`SECURITY_ENABLED`) - Highest priority
2. **Configuration Files** (`security.enabled`)
3. **Default Behavior** - Lowest priority

### Security Headers

The following headers are always applied:

```http
Content-Security-Policy: default-src 'self'; ...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Permissions-Policy: camera=(), microphone=(), ...
```

---

## 📚 API Documentation

### Swagger/OpenAPI

This project includes auto-generated API documentation using Swagger.

**Access API Documentation:**

- **Local**: http://localhost:3000/api
- **Docker**: http://localhost:3000/api

### API Endpoints

#### Authentication

```http
POST /auth/login     # User login
POST /auth/register  # User registration
POST /auth/refresh   # Refresh JWT token
POST /auth/logout    # User logout
```

#### Health Check

```http
GET /health          # Application health status
```

#### Documentation

```http
GET /api             # Swagger UI
GET /api-json        # OpenAPI JSON specification
```

### API Response Format

#### Success Response

```json
{
  "statusCode": 200,
  "data": {
    // Response data
  },
  "message": "Success",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Error Response

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint"
}
```

### Rate Limiting Headers

```http
X-RateLimit-Limit-short: 3
X-RateLimit-Remaining-short: 2
X-RateLimit-Reset-short: 1
X-RateLimit-Limit-medium: 20
X-RateLimit-Remaining-medium: 18
X-RateLimit-Reset-medium: 10
```

---

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test

# Unit tests in watch mode
npm run test:watch

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov

# Debug tests
npm run test:debug
```

### Test Structure

```
src/
├── **/*.spec.ts     # Unit tests
└── **/*.e2e-spec.ts # Integration tests

test/
├── app.e2e-spec.ts  # End-to-end tests
└── jest-e2e.json    # E2E Jest configuration
```

### Test Coverage

The project aims for:

- **Unit Tests**: ≥ 80% coverage
- **Integration Tests**: Critical paths covered
- **E2E Tests**: Main user flows covered

### Testing with Docker

```bash
# Run tests in Docker container
docker-compose exec app npm run test

# Run with coverage
docker-compose exec app npm run test:cov
```

### Security Testing

```bash
# Test security endpoints
npm run test:security

# Test with security enabled
SECURITY_ENABLED=true npm run test:e2e

# Test rate limiting
npm run test:rate-limit
```

---

## 👥 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Write tests** for your changes
5. **Run tests**:
   ```bash
   npm run test
   npm run test:e2e
   npm run lint
   ```
6. **Commit your changes**:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
7. **Push to your branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Create a Pull Request**

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Extended from @nestjs/eslint-config
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples**:

```bash
feat(auth): add JWT refresh token functionality
fix(security): resolve SQL injection vulnerability
docs(readme): update installation instructions
```

### Development Guidelines

- Write unit tests for new features
- Follow existing code patterns
- Update documentation when needed
- Ensure security tests pass
- Test both secure and non-secure modes

---

## 📝 Project Structure

```
base-api-rest-project/
├── src/
│   ├── app.module.ts                    # Root module
│   ├── main.ts                          # Application entry point
│   ├── common/                          # Shared components
│   │   ├── filters/                     # Exception filters
│   │   ├── guards/                      # Authentication guards
│   │   ├── interceptors/                # Response interceptors
│   │   └── middleware/                  # Custom middleware
│   ├── config/                          # Configuration modules
│   │   ├── database/                    # Database configuration
│   │   ├── security/                    # Security configuration
│   │   └── swagger/                     # API documentation
│   └── modules/                         # Feature modules
├── test/                                # E2E tests
├── scripts/                             # Utility scripts
├── docker-compose.yml                   # Docker Compose configuration
├── Dockerfile                           # Docker configuration
├── .env.example                         # Environment variables template
└── README.md                            # Project documentation
```

---

## 📈 Performance

### Optimization Features

- **Compression**: Gzip compression enabled
- **Caching**: Redis integration ready
- **Database**: Connection pooling configured
- **Security**: Efficient validation algorithms
- **Logging**: Structured logging with levels

### Monitoring

- **Health Checks**: Built-in health monitoring
- **Metrics**: Performance metrics collection ready
- **Logging**: Comprehensive request/response logging
- **Error Tracking**: Structured error reporting

---

## 🌐 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure secure JWT secrets
- [ ] Set up SSL/TLS certificates
- [ ] Configure production database
- [ ] Set up monitoring and logging
- [ ] Configure reverse proxy (nginx)
- [ ] Set up CI/CD pipeline
- [ ] Configure backup strategy

### Cloud Deployment

#### AWS

```bash
# Deploy to AWS ECS
aws ecs create-service --cli-input-json file://aws-ecs-service.json
```

#### Google Cloud

```bash
# Deploy to Google Cloud Run
gcloud run deploy base-api-rest --image gcr.io/PROJECT-ID/base-api-rest
```

#### Azure

```bash
# Deploy to Azure Container Instances
az container create --resource-group myResourceGroup --name base-api-rest
```

---

## 🔗 Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Docker Documentation](https://docs.docker.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [JWT.io](https://jwt.io)
- [OWASP Security Guide](https://owasp.org)

---

## 📝 License

This project is [MIT licensed](LICENSE).

---

## 📧 Support

If you have questions or need help:

1. Check the [documentation](#api-documentation)
2. Search [existing issues](https://github.com/your-repo/issues)
3. Create a [new issue](https://github.com/your-repo/issues/new)
4. Contact the maintainers

---
