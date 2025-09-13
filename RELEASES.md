# Releases

This document describes how to create and manage releases for the Chat Server.

## Creating a Release

### Method 1: Using Make (Recommended)

```bash
# Set version and build release
make set-version VERSION=v1.0.0
make build-release

# Or build without releasing
make build-all VERSION=v1.0.0
```

### Method 2: Using Build Script

```bash
# Build all binaries
./build.sh v1.0.0

# Create git tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

### Method 3: Manual GitHub Release

1. Go to GitHub → Releases → Create a new release
2. Choose a tag (e.g., `v1.0.0`)
3. Upload the binaries from `dist/` directory
4. Publish the release

## Automated Releases

The project includes GitHub Actions workflows for automated releases:

- **Trigger**: Push a tag starting with `v` (e.g., `v1.0.0`)
- **Actions**: 
  - Cross-compiles for all supported platforms
  - Creates GitHub release with binaries
  - Builds and pushes Docker images
  - Runs security scans

### Supported Platforms

| Platform | Architecture | Binary | Archive |
|----------|-------------|--------|---------|
| Linux | amd64 | `chatserver` | `.tar.gz` |
| Linux | arm64 | `chatserver` | `.tar.gz` |
| Linux | arm | `chatserver` | `.tar.gz` |
| Windows | amd64 | `chatserver.exe` | `.zip` |
| Windows | arm64 | `chatserver.exe` | `.zip` |
| macOS | amd64 | `chatserver` | `.tar.gz` |
| macOS | arm64 | `chatserver` | `.tar.gz` |
| FreeBSD | amd64 | `chatserver` | `.tar.gz` |
| OpenBSD | amd64 | `chatserver` | `.tar.gz` |

## Binary Features

All binaries are:
- **Standalone**: No external dependencies required
- **Embedded Frontend**: React app is embedded in the binary
- **Cross-platform**: Compiled with `CGO_ENABLED=0`
- **Optimized**: Stripped symbols and compressed
- **Versioned**: Include version information

## Testing Releases

### Local Testing

```bash
# Test a specific binary
make test-binary VERSION=v1.0.0

# Manual testing
cd dist
tar -xzf chatserver-v1.0.0-linux-amd64.tar.gz
./chatserver -port 8090
curl http://localhost:8090/health
```

### Health Check

All binaries include a health endpoint:

```bash
curl http://localhost:8090/health
# Returns: {"status":"ok","version":"v1.0.0","service":"chat-server"}
```

## Release Checklist

Before creating a release:

- [ ] Update version in `build.sh` and `Makefile`
- [ ] Update `CHANGELOG.md` (if exists)
- [ ] Test binaries locally
- [ ] Ensure CI/CD passes
- [ ] Update documentation if needed
- [ ] Create release tag
- [ ] Verify GitHub release is created
- [ ] Test Docker images

## Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Incompatible API changes
- **MINOR**: New functionality (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

Examples:
- `v1.0.0` - First stable release
- `v1.1.0` - New features added
- `v1.1.1` - Bug fixes
- `v2.0.0` - Breaking changes

## Docker Releases

Docker images are automatically built and pushed to GitHub Container Registry:

- **Latest**: `ghcr.io/l10r/chat-server:latest`
- **Tagged**: `ghcr.io/l10r/chat-server:v1.0.0`
- **Multi-arch**: Supports `linux/amd64` and `linux/arm64`

### Using Docker Images

```bash
# Pull latest
docker pull ghcr.io/l10r/chat-server:latest

# Run HTTP server
docker run -p 8090:8090 ghcr.io/l10r/chat-server:latest

# Run HTTPS server
docker run -p 8443:8443 ghcr.io/l10r/chat-server:latest ./chatserver -port 8443 -secure
```

## Security

All releases include:
- **Vulnerability Scanning**: Trivy security scanner
- **Dependency Updates**: Automated security updates
- **Code Signing**: Git tags are signed
- **Checksums**: SHA256 checksums for all binaries

## Support

For release-related issues:
- Check [GitHub Issues](https://github.com/l10r/chat-server/issues)
- Review [CI/CD Logs](https://github.com/l10r/chat-server/actions)
- See [Troubleshooting](DOCKER.md#troubleshooting)
