# 📋 Scripts Documentation

## Available NPM Scripts

This document provides a comprehensive overview of all available scripts in the project.

## 🏗️ Build & Development Scripts

### Basic Commands

- `npm run build` - Build the NestJS application for production
- `npm run start` - Start the application in production mode
- `npm run start:dev` - Start with file watching (development mode, security disabled)
- `npm run start:dev:secure` - Start with file watching (development mode, security enabled)
- `npm run start:debug` - Start with debugging enabled (security disabled)
- `npm run start:debug:secure` - Start with debugging enabled (security enabled)
- `npm run start:prod` - Start the production build

## 🔒 Security Scripts

- `npm run security:enable` - Display message about enabling security
- `npm run security:disable` - Display message about disabling security
- `npm run security:status` - Check current security status

## 🧹 Code Quality Scripts

### Linting

- `npm run lint` - Run ESLint with auto-fix
- `npm run lint:check` - Run ESLint without auto-fix (check only)

### Formatting

- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting without fixing

### Type Checking

- `npm run type-check` - Run TypeScript compiler check without emitting files

### Quality Suites

- `npm run quality:check` - Run lint check + format check + tests
- `npm run quality:fix` - Run format + lint + tests

## 🧪 Testing Scripts

### Unit Tests

- `npm run test` - Run Jest unit tests
- `npm run test:watch` - Run Jest in watch mode
- `npm run test:debug` - Run Jest with Node.js debugging

### E2E Tests

- `npm run test:e2e` - Run end-to-end tests
- `npm run test:e2e:cov` - Run E2E tests with coverage

### Coverage

- `npm run test:cov` - Run tests with coverage
- `npm run test:cov:html` - Generate HTML coverage report
- `npm run test:cov:json` - Generate JSON coverage report
- `npm run test:cov:lcov` - Generate LCOV coverage report
- `npm run test:cov:text` - Generate text coverage report
- `npm run test:cov:all` - Generate all coverage formats
- `npm run test:cov:open` - Generate HTML coverage and open in browser
- `npm run test:cov:ci` - Run coverage for CI (no watch mode)

### Advanced Coverage

- `npm run coverage:unit` - Generate unit test coverage report
- `npm run coverage:e2e` - Generate E2E test coverage report
- `npm run coverage:combined` - Generate combined coverage report
- `npm run coverage:html` - Generate HTML coverage report
- `npm run coverage:ci` - Generate CI-friendly coverage report
- `npm run coverage:clean` - Clean coverage artifacts
- `npm run coverage:threshold` - Check coverage thresholds
- `npm run coverage:badge` - Generate coverage badge

## 🐳 Docker Scripts

- `npm run docker:build` - Build Docker containers
- `npm run docker:start` - Start Docker containers
- `npm run docker:stop` - Stop Docker containers
- `npm run docker:restart` - Restart Docker containers
- `npm run docker:logs` - View Docker container logs
- `npm run docker:shell` - Open shell in Docker container
- `npm run docker:clean` - Clean Docker artifacts
- `npm run docker:status` - Check Docker container status
- `npm run docker:db` - Access database in Docker
- `npm run docker:test` - Run tests in Docker
- `npm run docker:lint` - Run linting in Docker

## 🗄️ Database Scripts

### TypeORM Commands

- `npm run typeorm` - Run TypeORM CLI
- `npm run typeorm:migration:generate` - Generate new migration
- `npm run typeorm:migration:create` - Create empty migration
- `npm run typeorm:migration:run` - Run pending migrations
- `npm run typeorm:migration:revert` - Revert last migration
- `npm run typeorm:schema:drop` - Drop database schema
- `npm run typeorm:schema:sync` - Sync database schema

### Database Management

- `npm run db:reset` - Reset database (delete SQLite file)
- `npm run db:seed` - Seed database with sample data
- `npm run db:migrate` - Run database migrations

### Migration Helpers

- `npm run migration:generate [name]` - Generate migration with name

## 🛠️ Project Management Scripts

### Environment & Setup

- `npm run env:setup` - Setup environment configuration
- `npm run project:setup` - Complete project setup (install, env, build)
- `npm run project:clean` - Clean all build artifacts and dependencies
- `npm run project:health` - Run comprehensive health checks

### Development Helpers

- `npm run dev:reset` - Clean project and reinstall dependencies
- `npm run dev:fresh` - Reset database and reseed

## 🚀 CI/CD Scripts

- `npm run ci:test` - Run all tests for CI (lint + type-check + unit + e2e)
- `npm run ci:build` - Build project and Docker image for CI

## 📦 Release Scripts

- `npm run release:patch` - Bump patch version and create git tag
- `npm run release:minor` - Bump minor version and create git tag
- `npm run release:major` - Bump major version and create git tag

## 🔧 System Scripts

- `npm run prepare` - Setup Husky git hooks (runs automatically on install)

## 📁 Script Files

### Shell Scripts

- `scripts/coverage-report.sh` - Advanced coverage reporting
- `scripts/docker-dev.sh` - Docker development utilities
- `scripts/dev-utils.sh` - Development utilities and database management

### JavaScript Scripts

- `scripts/pre-commit-animated.js` - Animated pre-commit hook
- `scripts/post-commit-animated.js` - Animated post-commit hook
- `scripts/commit-msg-animated.js` - Animated commit message hook

## 🚀 Quick Start Examples

### Development Workflow

```bash
# Initial setup
npm run project:setup

# Start development
npm run start:dev

# Run tests
npm run test:watch

# Check code quality
npm run quality:check
```

### Database Workflow

```bash
# Reset and migrate database
npm run dev:fresh

# Create new migration
npm run migration:generate AddUserTable

# Run migrations
npm run db:migrate
```

### Production Deployment

```bash
# Run CI checks
npm run ci:test

# Build for production
npm run ci:build

# Release new version
npm run release:patch
```

### Docker Development

```bash
# Start services
npm run docker:start

# View logs
npm run docker:logs

# Run tests in container
npm run docker:test
```

## 💡 Tips

1. **Use `npm run project:health`** to quickly check your development environment
2. **Use `npm run dev:fresh`** when switching branches to ensure clean database state
3. **Use `npm run quality:check`** before committing to catch issues early
4. **Use `npm run ci:test`** to run the same checks as CI locally
5. **All Docker scripts handle both development and production environments**

## 📋 Script Dependencies

All scripts have been verified and their dependencies are properly configured:

- ✅ **Jest** - Testing framework
- ✅ **ESLint** - Code linting
- ✅ **Prettier** - Code formatting
- ✅ **TypeScript** - Type checking
- ✅ **Docker** - Containerization
- ✅ **TypeORM** - Database ORM
- ✅ **Husky** - Git hooks
- ✅ **NestJS CLI** - Framework CLI

All scripts are ready to use! 🎉
