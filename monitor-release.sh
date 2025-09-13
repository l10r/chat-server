#!/bin/bash

# Monitor GitHub release status

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

print_header "GitHub Release Monitor"

echo "Repository: https://github.com/l10r/chat-server"
echo "Releases: https://github.com/l10r/chat-server/releases"
echo "Actions: https://github.com/l10r/chat-server/actions"
echo

VERSION=${1:-"v1.0.0"}
print_status "Monitoring release $VERSION..."

# Check if GitHub CLI is available
if command -v gh &> /dev/null; then
    print_status "Using GitHub CLI to monitor release..."
    
    # Check if release exists
    if gh release view "$VERSION" --repo l10r/chat-server &>/dev/null; then
        print_status "✓ Release $VERSION found!"
        echo
        print_header "Release Details"
        gh release view "$VERSION" --repo l10r/chat-server --json name,tagName,publishedAt,assets --jq '.name, .tagName, .publishedAt, (.assets | length) as $count | "Assets: \($count)"'
        echo
        print_header "Release Assets"
        gh release view "$VERSION" --repo l10r/chat-server --json assets --jq '.assets[] | "\(.name) (\(.size | . / 1024 / 1024 | floor) MB)"'
    else
        print_warning "Release $VERSION not found yet."
        print_status "Checking GitHub Actions status..."
        
        # Check if workflow is running
        if gh run list --repo l10r/chat-server --limit 5 | grep -q "Release"; then
            print_status "Release workflow is running or recently completed."
            gh run list --repo l10r/chat-server --limit 5
        else
            print_warning "No recent Release workflow found."
            print_status "This might indicate the workflow didn't trigger properly."
        fi
    fi
else
    print_warning "GitHub CLI not found. Please check manually:"
    echo "1. Go to: https://github.com/l10r/chat-server/actions"
    echo "2. Look for 'Release' workflow runs"
    echo "3. Check: https://github.com/l10r/chat-server/releases"
fi

echo
print_header "Expected Release Contents"
echo "The release should include these binaries:"
echo "- chatserver-${VERSION}-linux-amd64.tar.gz"
echo "- chatserver-${VERSION}-linux-arm64.tar.gz" 
echo "- chatserver-${VERSION}-linux-arm.tar.gz"
echo "- chatserver-${VERSION}-windows-amd64.zip"
echo "- chatserver-${VERSION}-windows-arm64.zip"
echo "- chatserver-${VERSION}-darwin-amd64.tar.gz"
echo "- chatserver-${VERSION}-darwin-arm64.tar.gz"
echo "- chatserver-${VERSION}-freebsd-amd64.tar.gz"
echo "- chatserver-${VERSION}-openbsd-amd64.tar.gz"
echo
echo "Each binary is standalone with embedded frontend (no dependencies required)."
