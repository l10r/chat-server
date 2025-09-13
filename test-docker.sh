#!/bin/bash

# Test script to verify Docker setup (without actually running Docker)

echo "=== Docker Setup Verification ==="
echo

# Check if required files exist
echo "Checking required files..."

files=(
    "Dockerfile"
    "Dockerfile.dev"
    "docker-compose.yml"
    ".dockerignore"
    "docker-scripts.sh"
    "Makefile"
    "DOCKER.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file exists"
    else
        echo "✗ $file missing"
    fi
done

echo

# Check if frontend is built
echo "Checking frontend build..."
if [ -d "frontend/dist" ]; then
    echo "✓ Frontend dist directory exists"
    if [ -f "frontend/dist/index.html" ]; then
        echo "✓ Frontend index.html exists"
    else
        echo "✗ Frontend index.html missing"
    fi
else
    echo "✗ Frontend dist directory missing - run 'cd frontend && npm run build'"
fi

echo

# Check Dockerfile syntax (basic check)
echo "Checking Dockerfile syntax..."
if grep -q "FROM golang" Dockerfile; then
    echo "✓ Dockerfile uses Go base image"
else
    echo "✗ Dockerfile doesn't use Go base image"
fi

if grep -q "EXPOSE" Dockerfile; then
    echo "✓ Dockerfile exposes ports"
else
    echo "✗ Dockerfile doesn't expose ports"
fi

echo

# Check docker-compose.yml syntax
echo "Checking docker-compose.yml..."
if grep -q "version:" docker-compose.yml; then
    echo "✓ docker-compose.yml has version"
else
    echo "✗ docker-compose.yml missing version"
fi

if grep -q "chat-server:" docker-compose.yml; then
    echo "✓ docker-compose.yml has chat-server service"
else
    echo "✗ docker-compose.yml missing chat-server service"
fi

echo

# Check helper scripts
echo "Checking helper scripts..."
if [ -x "docker-scripts.sh" ]; then
    echo "✓ docker-scripts.sh is executable"
else
    echo "✗ docker-scripts.sh is not executable"
fi

if [ -f "Makefile" ]; then
    echo "✓ Makefile exists"
    if grep -q "build:" Makefile; then
        echo "✓ Makefile has build target"
    else
        echo "✗ Makefile missing build target"
    fi
else
    echo "✗ Makefile missing"
fi

echo
echo "=== Docker Setup Verification Complete ==="
echo
echo "To test the Docker setup:"
echo "1. Make sure Docker is running"
echo "2. Run: make build"
echo "3. Run: make run-http"
echo "4. Visit: http://localhost:8090"
