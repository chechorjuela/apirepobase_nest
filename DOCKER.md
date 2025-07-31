# Docker Setup and Usage Guide

This project includes a complete Docker setup for both development and production environments.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Quick Start

### Development

1. **Build and start development containers:**
   ```bash
   npm run docker:start
   # or
   ./scripts/docker-dev.sh start
   ```

2. **Check container status:**
   ```bash
   npm run docker:status
   ```

3. **View logs:**
   ```bash
   npm run docker:logs
   ```

4. **Access the application:**
   - API: http://localhost:3000
   - Database: localhost:5432
   - Redis: localhost:6379

### Production

```bash
docker-compose --profile prod up -d
```

## Available Commands

### NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run docker:build` | Build development Docker image |
| `npm run docker:start` | Start development containers |
| `npm run docker:stop` | Stop all containers |
| `npm run docker:restart` | Restart development containers |
| `npm run docker:logs` | Show container logs |
| `npm run docker:shell` | Open shell in development container |
| `npm run docker:clean` | Remove all containers and images |
| `npm run docker:status` | Show container status |
| `npm run docker:db` | Connect to database |
| `npm run docker:test` | Run tests in container |
| `npm run docker:lint` | Run linting in container |

### Direct Script Usage

```bash
# Build development image
./scripts/docker-dev.sh build

# Start development containers
./scripts/docker-dev.sh start

# Stop containers
./scripts/docker-dev.sh stop

# View logs
./scripts/docker-dev.sh logs

# Open shell in container
./scripts/docker-dev.sh shell

# Connect to database
./scripts/docker-dev.sh db

# Clean up everything
./scripts/docker-dev.sh clean
```

## Docker Configuration

### Multi-stage Dockerfile

The Dockerfile uses multi-stage builds:

- **base**: Base Node.js image with production dependencies
- **development**: Development environment with all dependencies
- **build**: Build stage for compiling TypeScript
- **production**: Optimized production image

### Docker Compose Profiles

- **dev**: Development environment with hot reload
- **prod**: Production environment

### Services

#### API Service
- **Development**: Hot reload enabled, source code mounted
- **Production**: Optimized build, non-root user

#### PostgreSQL Database
- **Image**: postgres:15-alpine
- **Database**: api_base_db
- **User**: api_user
- **Password**: api_password
- **Port**: 5432

#### Redis Cache
- **Image**: redis:7-alpine
- **Port**: 6379

## Environment Variables

### Development
- `NODE_ENV=development`
- `SECURITY_ENABLED=false`

### Production
- `NODE_ENV=production`

## Database Connection

### From Host Machine
```bash
psql -h localhost -p 5432 -U api_user -d api_base_db
```

### From Container
```bash
npm run docker:db
# or
./scripts/docker-dev.sh db
```

## Troubleshooting

### Container Won't Start
1. Check if Docker is running
2. Check if ports are available (3000, 5432, 6379)
3. Run `docker-compose down` and try again

### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

### Database Connection Issues
1. Ensure PostgreSQL container is running
2. Check connection parameters
3. Verify database exists

### Clean Slate
```bash
# Remove everything and start fresh
npm run docker:clean
npm run docker:build
npm run docker:start
```

## Development Workflow

1. **Start development environment:**
   ```bash
   npm run docker:start
   ```

2. **Make code changes** (hot reload will pick them up automatically)

3. **Run tests in container:**
   ```bash
   npm run docker:test
   ```

4. **Run linting in container:**
   ```bash
   npm run docker:lint
   ```

5. **Access database:**
   ```bash
   npm run docker:db
   ```

6. **View logs:**
   ```bash
   npm run docker:logs
   ```

## Production Deployment

1. **Build production image:**
   ```bash
   docker-compose build --target production api-prod
   ```

2. **Start production containers:**
   ```bash
   docker-compose --profile prod up -d
   ```

3. **Check status:**
   ```bash
   docker-compose ps
   ```

## Security Features

- Non-root user in production container
- Minimal production image (Alpine Linux)
- Environment-specific configurations
- Separate development and production profiles

## Volume Management

- **Development**: Source code mounted for hot reload
- **Production**: No volumes mounted for security
- **Database**: Persistent volume for data
- **Redis**: Persistent volume for cache data

## Network Configuration

All services communicate through a custom Docker network (`api-network`) for isolation and security.
