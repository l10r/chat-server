#!/bin/bash

# Check GitHub release status

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

print_header "GitHub Release Status Check"

echo "Repository: https://github.com/l10r/chat-server"
echo "Releases: https://github.com/l10r/chat-server/releases"
echo "Actions: https://github.com/l10r/chat-server/actions"
echo

print_status "Checking if release v1.0.0 exists..."

# Check if we can access the release (requires GitHub CLI or curl)
if command -v gh &> /dev/null; then
    print_status "Using GitHub CLI to check release status..."
    gh release view v1.0.0 --repo l10r/chat-server 2>/dev/null && {
        print_status "✓ Release v1.0.0 found!"
        gh release list --repo l10r/chat-server
    } || {
        print_warning "Release v1.0.0 not found yet. GitHub Actions might still be running."
        print_status "Check the Actions tab: https://github.com/l10r/chat-server/actions"
    }
else
    print_warning "GitHub CLI not found. Please check manually:"
    echo "1. Go to: https://github.com/l10r/chat-server/releases"
    echo "2. Check if v1.0.0 release exists with binaries"
    echo "3. If not, check Actions: https://github.com/l10r/chat-server/actions"
fi

echo
print_header "Expected Release Contents"
echo "The release should include these binaries:"
echo "- chatserver-v1.0.0-linux-amd64.tar.gz"
echo "- chatserver-v1.0.0-linux-arm64.tar.gz" 
echo "- chatserver-v1.0.0-linux-arm.tar.gz"
echo "- chatserver-v1.0.0-windows-amd64.zip"
echo "- chatserver-v1.0.0-windows-arm64.zip"
echo "- chatserver-v1.0.0-darwin-amd64.tar.gz"
echo "- chatserver-v1.0.0-darwin-arm64.tar.gz"
echo "- chatserver-v1.0.0-freebsd-amd64.tar.gz"
echo "- chatserver-v1.0.0-openbsd-amd64.tar.gz"
echo
echo "Each binary is standalone with embedded frontend (no dependencies required)."
