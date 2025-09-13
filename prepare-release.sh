#!/bin/bash

# Prepare release files for manual upload

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

print_header "Preparing Release Files for Manual Upload"

VERSION=${1:-"v1.0.0"}

print_status "Version: $VERSION"
print_status "Building binaries..."

# Build the binaries
./build.sh "$VERSION"

# Create release directory
RELEASE_DIR="release-$VERSION"
mkdir -p "$RELEASE_DIR"

# Copy all binaries to release directory
cp dist/*.tar.gz "$RELEASE_DIR/"
cp dist/*.zip "$RELEASE_DIR/"

print_status "Created release directory: $RELEASE_DIR"

# Create release notes
cat > "$RELEASE_DIR/RELEASE_NOTES.md" << EOF
# Release $VERSION

First stable release with cross-compilation support

## Features
- Real-time messaging with WebSocket
- Voice memo recording and playback  
- File upload with drag-and-drop
- Markdown rendering with syntax highlighting
- Mobile-responsive design
- Docker support
- HTTPS with self-signed certificates
- Cross-platform standalone binaries
- Automated GitHub releases

## Binaries Included
- **Linux (amd64, arm64, arm)**: \`chatserver-$VERSION-linux-*.tar.gz\`
- **Windows (amd64, arm64)**: \`chatserver-$VERSION-windows-*.zip\`
- **macOS (amd64, arm64)**: \`chatserver-$VERSION-darwin-*.tar.gz\`
- **FreeBSD (amd64)**: \`chatserver-$VERSION-freebsd-amd64.tar.gz\`
- **OpenBSD (amd64)**: \`chatserver-$VERSION-openbsd-amd64.tar.gz\`

## Usage
Each binary is standalone with embedded frontend (no dependencies required).

### Linux/macOS/BSD:
\`\`\`bash
tar -xzf chatserver-$VERSION-linux-amd64.tar.gz
./chatserver -port 8090
\`\`\`

### Windows:
\`\`\`cmd
# Extract the zip file
# Run: chatserver.exe -port 8090
\`\`\`

### HTTPS Mode:
\`\`\`bash
./chatserver -port 8443 -secure
\`\`\`

## Docker
\`\`\`bash
docker run -p 8090:8090 l10r/chat-server:latest
\`\`\`
EOF

# Create upload instructions
cat > "$RELEASE_DIR/UPLOAD_INSTRUCTIONS.md" << EOF
# Manual Upload Instructions

## Step 1: Go to GitHub Releases
1. Open: https://github.com/l10r/chat-server/releases
2. Click "Create a new release"

## Step 2: Create Release
1. **Tag version**: $VERSION
2. **Release title**: Release $VERSION
3. **Description**: Copy from RELEASE_NOTES.md

## Step 3: Upload Files
Upload all files from this directory:
$(ls -la "$RELEASE_DIR"/*.tar.gz "$RELEASE_DIR"/*.zip 2>/dev/null | awk '{print "- " $9}' | sed 's|.*/||')

## Step 4: Publish
1. Check "Set as the latest release"
2. Click "Publish release"

## Files in this directory:
$(ls -la "$RELEASE_DIR"/)
EOF

print_header "Release Files Prepared"
echo "Release directory: $RELEASE_DIR"
echo
print_status "Files created:"
ls -la "$RELEASE_DIR"/

echo
print_header "Next Steps"
echo "1. Go to: https://github.com/l10r/chat-server/releases"
echo "2. Click 'Create a new release'"
echo "3. Use tag: $VERSION"
echo "4. Upload all files from: $RELEASE_DIR/"
echo "5. Copy release notes from: $RELEASE_DIR/RELEASE_NOTES.md"
echo
print_status "Release directory contents:"
echo "$(ls -la "$RELEASE_DIR"/)"
