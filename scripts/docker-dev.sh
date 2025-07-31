#!/bin/bash
#
# Docker development helper script
# Usage: ./scripts/docker-dev.sh [command]
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to show help
show_help() {
    echo "Docker Development Helper Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  build         Build the development Docker image"
    echo "  start         Start development containers"
    echo "  stop          Stop all containers"
    echo "  restart       Restart development containers"
    echo "  logs          Show container logs"
    echo "  shell         Open shell in development container"
    echo "  clean         Remove all containers and images"
    echo "  status        Show container status"
    echo "  db            Connect to database"
    echo "  test          Run tests in container"
    echo "  lint          Run linting in container"
    echo "  help          Show this help message"
    echo ""
}

# Build development image
build_image() {
    print_status "Building development Docker image..."
    docker-compose --profile dev build api-dev
    print_success "Development image built successfully!"
}

# Start development containers
start_containers() {
    print_status "Starting development containers..."
    docker-compose --profile dev up -d
    print_success "Development containers started!"
    print_status "API will be available at: http://localhost:3000"
    print_status "Database will be available at: localhost:5432"
    print_status "Redis will be available at: localhost:6379"
}

# Stop containers
stop_containers() {
    print_status "Stopping containers..."
    docker-compose down
    print_success "Containers stopped!"
}

# Restart containers
restart_containers() {
    print_status "Restarting development containers..."
    docker-compose --profile dev restart
    print_success "Containers restarted!"
}

# Show logs
show_logs() {
    print_status "Showing container logs..."
    docker-compose --profile dev logs -f api-dev
}

# Open shell in development container
open_shell() {
    print_status "Opening shell in development container..."
    docker-compose --profile dev exec api-dev sh
}

# Clean up containers and images
clean_up() {
    print_warning "This will remove all containers, networks, and images created by this project."
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up..."
        docker-compose down --rmi all --volumes --remove-orphans
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Show container status
show_status() {
    print_status "Container status:"
    docker-compose ps
}

# Connect to database
connect_db() {
    print_status "Connecting to database..."
    docker-compose --profile dev exec postgres psql -U api_user -d api_base_db
}

# Run tests in container
run_tests() {
    print_status "Running tests in container..."
    docker-compose --profile dev exec api-dev npm run test
}

# Run linting in container
run_lint() {
    print_status "Running linting in container..."
    docker-compose --profile dev exec api-dev npm run lint
}

# Main script logic
check_docker

case "${1:-help}" in
    "build")
        build_image
        ;;
    "start")
        start_containers
        ;;
    "stop")
        stop_containers
        ;;
    "restart")
        restart_containers
        ;;
    "logs")
        show_logs
        ;;
    "shell")
        open_shell
        ;;
    "clean")
        clean_up
        ;;
    "status")
        show_status
        ;;
    "db")
        connect_db
        ;;
    "test")
        run_tests
        ;;
    "lint")
        run_lint
        ;;
    "help"|*)
        show_help
        ;;
esac
