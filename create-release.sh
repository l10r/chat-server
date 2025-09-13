#!/bin/bash

# Create GitHub release manually

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

print_header "Manual GitHub Release Creator"

VERSION=${1:-"v1.0.0"}
REPO="l10r/chat-server"

print_status "Creating release: $VERSION"
print_status "Repository: $REPO"

# Check if GitHub CLI is available
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is required for this script."
    print_status "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &>/dev/null; then
    print_error "Not authenticated with GitHub CLI."
    print_status "Run: gh auth login"
    exit 1
fi

# Check if release already exists
if gh release view "$VERSION" --repo "$REPO" &>/dev/null; then
    print_warning "Release $VERSION already exists!"
    print_status "Current release assets:"
    gh release view "$VERSION" --repo "$REPO" --json assets --jq '.assets[] | "\(.name) (\(.size | . / 1024 / 1024 | floor) MB)"'
    exit 0
fi

# Build the binaries first
print_status "Building binaries..."
./build.sh

# Create the release
print_status "Creating GitHub release..."

# Create release with description
gh release create "$VERSION" \
    --repo "$REPO" \
    --title "Release $VERSION" \
    --notes "Release $VERSION - First stable release with cross-compilation support

Features:
- Real-time messaging with WebSocket
- Voice memo recording and playback  
- File upload with drag-and-drop
- Markdown rendering with syntax highlighting
- Mobile-responsive design
- Docker support
- HTTPS with self-signed certificates
- Cross-platform standalone binaries
- Automated GitHub releases

Binaries included:
- Linux (amd64, arm64, arm)
- Windows (amd64, arm64) 
- macOS (amd64, arm64)
- FreeBSD (amd64)
- OpenBSD (amd64)

Each binary is standalone with embedded frontend (no dependencies required)." \
    dist/*.tar.gz dist/*.zip

print_status "✓ Release $VERSION created successfully!"
print_status "View at: https://github.com/$REPO/releases/tag/$VERSION"

# Show release details
print_header "Release Details"
gh release view "$VERSION" --repo "$REPO" --json name,tagName,publishedAt,assets --jq '.name, .tagName, .publishedAt, (.assets | length) as $count | "Assets: \($count)"'

print_header "Release Assets"
gh release view "$VERSION" --repo "$REPO" --json assets --jq '.assets[] | "\(.name) (\(.size | . / 1024 / 1024 | floor) MB)"'
