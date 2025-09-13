#!/bin/bash

# Cross-compilation build script for Chat Server
# Builds standalone binaries for multiple platforms with embedded frontend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Build configuration
VERSION=${1:-"dev"}
BUILD_DIR="build"
DIST_DIR="dist"
LDFLAGS="-s -w -X main.version=${VERSION}"

# Target platforms
PLATFORMS=(
    "linux/amd64"
    "linux/arm64"
    "linux/arm"
    "windows/amd64"
    "windows/arm64"
    "darwin/amd64"
    "darwin/arm64"
    "freebsd/amd64"
    "openbsd/amd64"
)

print_header "Chat Server Cross-Compilation Build"
echo "Version: ${VERSION}"
echo "Build Directory: ${BUILD_DIR}"
echo "Dist Directory: ${DIST_DIR}"
echo

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf ${BUILD_DIR} ${DIST_DIR}
mkdir -p ${BUILD_DIR} ${DIST_DIR}

# Build frontend first
print_header "Building Frontend"
if [ -d "frontend" ]; then
    cd frontend
    print_status "Installing frontend dependencies..."
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    print_status "Building frontend for production..."
    npm run build
    
    if [ ! -d "dist" ]; then
        print_error "Frontend build failed - dist directory not found"
        exit 1
    fi
    
    print_status "Frontend build completed"
    cd ..
else
    print_warning "No frontend directory found, skipping frontend build"
fi

# Verify frontend build exists
if [ ! -d "frontend/dist" ]; then
    print_error "Frontend dist directory not found. Please build frontend first."
    exit 1
fi

print_header "Cross-Compiling Go Server"

# Build for each platform
for platform in "${PLATFORMS[@]}"; do
    IFS='/' read -r os arch <<< "$platform"
    
    print_status "Building for ${os}/${arch}..."
    
    # Set output filename
    output_name="chatserver"
    if [ "$os" = "windows" ]; then
        output_name="${output_name}.exe"
    fi
    
    # Set build tags and environment
    export CGO_ENABLED=0
    export GOOS=${os}
    export GOARCH=${arch}
    
    # Build the binary
    output_path="${BUILD_DIR}/${os}-${arch}/${output_name}"
    mkdir -p "$(dirname "$output_path")"
    
    go build \
        -ldflags="${LDFLAGS}" \
        -tags="netgo" \
        -o "${output_path}" \
        server.go
    
    if [ $? -eq 0 ]; then
        print_status "✓ Built ${os}/${arch} -> ${output_path}"
        
        # Create archive
        archive_name="chatserver-${VERSION}-${os}-${arch}"
        if [ "$os" = "windows" ]; then
            archive_name="${archive_name}.zip"
            cd "${BUILD_DIR}/${os}-${arch}"
            zip -r "../../${DIST_DIR}/${archive_name}" .
            cd ../..
        else
            archive_name="${archive_name}.tar.gz"
            cd "${BUILD_DIR}/${os}-${arch}"
            tar -czf "../../${DIST_DIR}/${archive_name}" .
            cd ../..
        fi
        
        print_status "✓ Created archive: ${archive_name}"
    else
        print_error "✗ Failed to build ${os}/${arch}"
    fi
done

# Reset environment
unset CGO_ENABLED
unset GOOS
unset GOARCH

print_header "Build Summary"
echo "Binaries created in: ${DIST_DIR}/"
echo "Total archives: $(ls -1 ${DIST_DIR} | wc -l)"
echo

# List all created files
print_status "Created files:"
ls -la ${DIST_DIR}/

print_header "Build Complete!"
echo "All binaries are standalone and include the embedded frontend."
echo "No additional dependencies required for deployment."
echo
echo "To test a binary:"
echo "  ./dist/chatserver-${VERSION}-linux-amd64.tar.gz"
echo "  tar -xzf chatserver-${VERSION}-linux-amd64.tar.gz"
echo "  ./chatserver -port 8090"
