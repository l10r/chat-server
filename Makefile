# Chat Server Makefile

.PHONY: help build run-http run-https run-dev stop logs status clean

# Default target
help:
	@echo "Chat Server Docker Commands"
	@echo
	@echo "Available targets:"
	@echo "  build       Build frontend and Docker image"
	@echo "  run-http    Run HTTP server (port 8090)"
	@echo "  run-https   Run HTTPS server (port 8443)"
	@echo "  run-dev     Run development server"
	@echo "  stop        Stop all services"
	@echo "  logs        Show logs"
	@echo "  status      Show container status"
	@echo "  clean       Remove all containers and images"
	@echo "  help        Show this help message"

# Build frontend and Docker image
build:
	@echo "Building frontend..."
	cd frontend && npm run build && cd ..
	@echo "Building Docker image..."
	docker build -t chat-server:latest .

# Run HTTP server
run-http:
	@echo "Starting HTTP server..."
	docker-compose up chat-server

# Run HTTPS server
run-https:
	@echo "Starting HTTPS server..."
	docker-compose --profile https up chat-server-https

# Run development server
run-dev:
	@echo "Starting development server..."
	docker-compose --profile dev up chat-server-dev

# Stop all services
stop:
	@echo "Stopping all services..."
	docker-compose down

# Show logs
logs:
	docker-compose logs -f

# Show status
status:
	docker-compose ps

# Clean up
clean:
	@echo "Cleaning up..."
	docker-compose down --rmi all --volumes --remove-orphans

# Quick start (build and run HTTP)
quick: build run-http
