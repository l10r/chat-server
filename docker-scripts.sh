#!/bin/bash

# Docker helper scripts for Chat Server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Function to build frontend
build_frontend() {
    print_header "Building Frontend"
    if [ -d "frontend" ]; then
        cd frontend
        if [ -f "package.json" ]; then
            print_status "Installing frontend dependencies..."
            npm install
            print_status "Building frontend for production..."
            npm run build
            cd ..
            print_status "Frontend build completed"
        else
            print_error "No package.json found in frontend directory"
            exit 1
        fi
    else
        print_warning "No frontend directory found, skipping frontend build"
    fi
}

# Function to build Docker image
build_image() {
    print_header "Building Docker Image"
    print_status "Building chat-server image..."
    docker build -t chat-server:latest .
    print_status "Docker image built successfully"
}

# Function to run HTTP server
run_http() {
    print_header "Starting HTTP Server"
    print_status "Starting chat server on HTTP (port 8090)..."
    docker-compose up chat-server
}

# Function to run HTTPS server
run_https() {
    print_header "Starting HTTPS Server"
    print_status "Starting chat server on HTTPS (port 8443)..."
    docker-compose --profile https up chat-server-https
}

# Function to run development server
run_dev() {
    print_header "Starting Development Server"
    print_status "Starting development chat server..."
    docker-compose --profile dev up chat-server-dev
}

# Function to stop all services
stop_all() {
    print_header "Stopping All Services"
    print_status "Stopping all chat server containers..."
    docker-compose down
    print_status "All services stopped"
}

# Function to clean up
cleanup() {
    print_header "Cleaning Up"
    print_status "Removing containers and images..."
    docker-compose down --rmi all --volumes --remove-orphans
    print_status "Cleanup completed"
}

# Function to show logs
show_logs() {
    print_header "Showing Logs"
    docker-compose logs -f
}

# Function to show status
show_status() {
    print_header "Container Status"
    docker-compose ps
}

# Function to show help
show_help() {
    echo "Chat Server Docker Helper Scripts"
    echo
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  build       Build frontend and Docker image"
    echo "  http        Run HTTP server (port 8090)"
    echo "  https       Run HTTPS server (port 8443)"
    echo "  dev         Run development server"
    echo "  stop        Stop all services"
    echo "  logs        Show logs"
    echo "  status      Show container status"
    echo "  cleanup     Remove all containers and images"
    echo "  help        Show this help message"
    echo
    echo "Examples:"
    echo "  $0 build    # Build everything"
    echo "  $0 http     # Start HTTP server"
    echo "  $0 https    # Start HTTPS server"
    echo "  $0 dev      # Start development server"
}

# Main script logic
case "${1:-help}" in
    build)
        build_frontend
        build_image
        ;;
    http)
        run_http
        ;;
    https)
        run_https
        ;;
    dev)
        run_dev
        ;;
    stop)
        stop_all
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    cleanup)
        cleanup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
