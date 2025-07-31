#!/bin/bash

# Development utilities script
# Usage: ./scripts/dev-utils.sh [command]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Database operations
db_reset() {
    log_info "Resetting database..."
    rm -f database.sqlite
    log_success "Database reset complete"
}

db_seed() {
    log_info "Seeding database..."
    npx ts-node src/modukes/example/seeders/example.seeder.ts
    log_success "Database seeded"
}

db_migrate() {
    log_info "Running database migrations..."
    npm run typeorm:migration:run
    log_success "Migrations complete"
}

# Environment setup
env_setup() {
    log_info "Setting up environment..."
    
    if [ ! -f .env ]; then
        cp .env.example .env 2>/dev/null || {
            log_warning ".env.example not found, creating basic .env"
            cat > .env << EOF
NODE_ENV=development
PORT=3000
DATABASE_TYPE=sqlite
DATABASE_PATH=database.sqlite
JWT_SECRET=your-super-secret-jwt-key-change-in-production
SECURITY_ENABLED=false
EOF
        }
        log_success "Environment file created"
    else
        log_info "Environment file already exists"
    fi
}

# Project setup
project_setup() {
    log_info "Setting up project..."
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm install
    
    # Setup environment
    env_setup
    
    # Setup husky
    log_info "Setting up git hooks..."
    npx husky
    
    # Build project
    log_info "Building project..."
    npm run build
    
    log_success "Project setup complete!"
}

# Clean project
clean() {
    log_info "Cleaning project..."
    
    # Remove build artifacts
    rm -rf dist/
    rm -rf coverage/
    rm -rf coverage-e2e/
    rm -rf node_modules/
    
    # Remove logs
    rm -f *.log
    
    log_success "Project cleaned"
}

# Health check
health() {
    log_info "Running health checks..."
    
    # Check Node.js version
    node_version=$(node -v)
    log_info "Node.js version: $node_version"
    
    # Check npm version
    npm_version=$(npm -v)
    log_info "npm version: $npm_version"
    
    # Check if Docker is available
    if command -v docker >/dev/null 2>&1; then
        docker_version=$(docker -v)
        log_info "Docker: $docker_version"
    else
        log_warning "Docker not available"
    fi
    
    # Check if database file exists
    if [ -f "database.sqlite" ]; then
        db_size=$(ls -lh database.sqlite | awk '{print $5}')
        log_info "Database size: $db_size"
    else
        log_warning "Database file not found"
    fi
    
    log_success "Health check complete"
}

# Generate migration
generate_migration() {
    if [ -z "$1" ]; then
        log_error "Migration name required"
        echo "Usage: $0 generate:migration <migration-name>"
        exit 1
    fi
    
    log_info "Generating migration: $1"
    npm run typeorm:migration:generate -- "src/migrations/$1"
    log_success "Migration generated"
}

# Main command handler
case "$1" in
    "db:reset")
        db_reset
        ;;
    "db:seed")
        db_seed
        ;;
    "db:migrate")
        db_migrate
        ;;
    "env:setup")
        env_setup
        ;;
    "project:setup")
        project_setup
        ;;
    "clean")
        clean
        ;;
    "health")
        health
        ;;
    "generate:migration")
        generate_migration "$2"
        ;;
    *)
        echo "Available commands:"
        echo "  db:reset          - Reset database"
        echo "  db:seed           - Seed database"
        echo "  db:migrate        - Run migrations"
        echo "  env:setup         - Setup environment"
        echo "  project:setup     - Complete project setup"
        echo "  clean             - Clean project"
        echo "  health            - Run health checks"
        echo "  generate:migration <name> - Generate new migration"
        echo ""
        echo "Usage: $0 [command]"
        exit 1
        ;;
esac
