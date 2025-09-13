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

# Build all binaries for release
build-all:
	@echo "Building all binaries..."
	./build.sh $(VERSION)

# Create a new release tag
release:
	@echo "Creating release tag $(VERSION)..."
	git tag -a $(VERSION) -m "Release $(VERSION)"
	git push origin $(VERSION)

# Build and release
build-release: build-all release

# Test a specific binary
test-binary:
	@echo "Testing binary..."
	cd dist && tar -xzf chatserver-$(VERSION)-linux-amd64.tar.gz
	cd dist && ./chatserver -port 8090 &
	@sleep 3
	@curl -f http://localhost:8090/health || (echo "Health check failed" && exit 1)
	@pkill -f chatserver || true
	@echo "Binary test passed!"

# Clean build artifacts
clean-build:
	rm -rf build/ dist/

# Show version
version:
	@echo "Version: $(VERSION)"

# Set version (usage: make set-version VERSION=v1.0.0)
set-version:
	@echo "Setting version to $(VERSION)..."
	@echo "Run 'make build-release' to build and tag the release"
