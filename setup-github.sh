#!/bin/bash

# GitHub Setup Script for Chat Server

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

print_header "GitHub Repository Setup"

echo "This script will help you publish your chat server to GitHub."
echo

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not in a git repository. Please run 'git init' first."
    exit 1
fi

# Check git status
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Please commit them first:"
    echo "  git add ."
    echo "  git commit -m 'Your commit message'"
    exit 1
fi

echo "Current git configuration:"
echo "  Name: $(git config --global user.name)"
echo "  Email: $(git config --global user.email)"
echo

print_header "Step 1: Create Repository on GitHub"
echo "1. Go to https://github.com/new"
echo "2. Repository name: chat-server (or your preferred name)"
echo "3. Description: Real-time chat application with Go WebSocket server and React frontend"
echo "4. Set visibility (Public/Private)"
echo "5. DO NOT initialize with README, .gitignore, or license"
echo "6. Click 'Create repository'"
echo

read -p "Press Enter after creating the repository on GitHub..."

print_header "Step 2: Add Remote and Push"
echo "Enter your GitHub repository URL (e.g., https://github.com/0x0kaki/chat-server.git):"
read -p "Repository URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    print_error "Repository URL is required"
    exit 1
fi

print_status "Adding remote origin..."
git remote add origin "$REPO_URL"

print_status "Pushing to GitHub..."
git push -u origin master

print_header "Success!"
echo "Your chat server has been published to GitHub!"
echo "Repository URL: $REPO_URL"
echo
echo "Next steps:"
echo "1. Visit your repository on GitHub"
echo "2. Add a description and topics"
echo "3. Consider adding a GitHub Actions workflow for CI/CD"
echo "4. Share your repository with others!"
