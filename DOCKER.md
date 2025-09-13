# Docker Setup for Chat Server

This document explains how to run the Chat Server using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Node.js 18+ (for building frontend)

## Quick Start

### 1. Build and Run HTTP Server
```bash
# Build everything and start HTTP server
./docker-scripts.sh build
./docker-scripts.sh http
```

### 2. Run HTTPS Server
```bash
# Start HTTPS server with self-signed certificates
./docker-scripts.sh https
```

### 3. Development Mode
```bash
# Start development server with live reload
./docker-scripts.sh dev
```

## Manual Docker Commands

### Build Frontend and Docker Image
```bash
# Build frontend
cd frontend && npm run build && cd ..

# Build Docker image
docker build -t chat-server:latest .
```

### Run with Docker Compose

#### HTTP Server (Port 8090)
```bash
docker-compose up chat-server
```

#### HTTPS Server (Port 8443)
```bash
docker-compose --profile https up chat-server-https
```

#### Development Server
```bash
docker-compose --profile dev up chat-server-dev
```

### Run with Docker (without compose)

#### HTTP Server
```bash
docker run -p 8090:8090 chat-server:latest
```

#### HTTPS Server
```bash
docker run -p 8443:8443 -v $(pwd)/certs:/app/certs chat-server:latest ./chatserver -port 8443 -secure
```

## Docker Services

### chat-server (HTTP)
- **Port**: 8090
- **Protocol**: HTTP
- **Health Check**: `http://localhost:8090/health`
- **Use Case**: Production HTTP server

### chat-server-https (HTTPS)
- **Port**: 8443
- **Protocol**: HTTPS with self-signed certificates
- **Health Check**: `https://localhost:8443/health`
- **Use Case**: Production HTTPS server
- **Profile**: `https`

### chat-server-dev (Development)
- **Ports**: 8090, 8443
- **Protocol**: HTTP (configurable)
- **Volumes**: Source code mounted for development
- **Use Case**: Development with live code changes
- **Profile**: `dev`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 8090 | Server port |
| `SECURE` | false | Enable HTTPS mode |

## Volumes

### Certificate Volume
- **Host**: `./certs`
- **Container**: `/app/certs`
- **Purpose**: Persistent storage for SSL certificates

### Development Volume
- **Host**: `.` (current directory)
- **Container**: `/app`
- **Purpose**: Live code reloading in development mode

## Health Checks

All services include health checks that verify the server is responding:

- **HTTP**: `wget --spider http://localhost:8090/health`
- **HTTPS**: `wget --no-check-certificate --spider https://localhost:8443/health`

## Helper Scripts

The `docker-scripts.sh` script provides convenient commands:

```bash
./docker-scripts.sh build    # Build frontend and Docker image
./docker-scripts.sh http     # Start HTTP server
./docker-scripts.sh https    # Start HTTPS server
./docker-scripts.sh dev      # Start development server
./docker-scripts.sh stop     # Stop all services
./docker-scripts.sh logs     # Show logs
./docker-scripts.sh status   # Show container status
./docker-scripts.sh cleanup  # Remove all containers and images
```

## Security Considerations

### Self-Signed Certificates
- Certificates are generated automatically when using HTTPS mode
- Certificates are stored in the `./certs` volume for persistence
- Browser will show security warnings (normal for self-signed certs)

### Non-Root User
- Container runs as non-root user (`appuser:appgroup`)
- Improves security by following Docker best practices

### Certificate Management
For production use, replace self-signed certificates:

```bash
# Copy your certificates to the certs directory
mkdir -p certs
cp your-cert.crt certs/server.crt
cp your-key.key certs/server.key

# Run with HTTPS
docker-compose --profile https up chat-server-https
```

## Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
lsof -i :8090
lsof -i :8443

# Stop conflicting services
docker-compose down
```

### Certificate Issues
```bash
# Remove old certificates
rm -rf certs/
docker-compose --profile https up chat-server-https
```

### Build Issues
```bash
# Clean build
docker-compose down --rmi all --volumes
./docker-scripts.sh build
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f chat-server
docker-compose logs -f chat-server-https
```

## Production Deployment

### Using Docker Compose
```bash
# Start HTTP server
docker-compose up -d chat-server

# Start HTTPS server
docker-compose --profile https up -d chat-server-https
```

### Using Docker Swarm
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml chat-stack
```

### Using Kubernetes
Convert docker-compose.yml to Kubernetes manifests:
```bash
# Install kompose
# https://kompose.io/installation/

# Convert
kompose convert
```

## Monitoring

### Health Check Status
```bash
# Check container health
docker ps
docker inspect <container_id> | grep Health -A 10
```

### Resource Usage
```bash
# Monitor resource usage
docker stats
```

## Development Workflow

1. **Start Development Server**:
   ```bash
   ./docker-scripts.sh dev
   ```

2. **Make Code Changes**: Edit files in your IDE

3. **Restart Container**: Changes require container restart
   ```bash
   docker-compose restart chat-server-dev
   ```

4. **View Logs**: Monitor server output
   ```bash
   ./docker-scripts.sh logs
   ```

5. **Stop Development Server**:
   ```bash
   ./docker-scripts.sh stop
   ```
