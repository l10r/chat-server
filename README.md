# Chat Application

A real-time chat application with Go WebSocket server and React frontend.

## Features

- Real-time messaging
- Multiple channels
- Voice memos
- File attachments
- Typing indicators
- User list
- Copy message functionality
- Dark theme UI

## Architecture

### Backend (Go)
- WebSocket server using Gorilla WebSocket
- Channel-based messaging
- User management
- CORS support

### Frontend (React + TypeScript)
- Native WebSocket client (no Socket.IO)
- Modular architecture with services and hooks
- Vite for development and building
- Modern React with hooks

## Getting Started

### Prerequisites
- Go 1.21+
- Node.js 18+
- npm or yarn
- Docker & Docker Compose (optional)

### Quick Start with Docker (Recommended)

1. **Build and run everything**:
```bash
make quick
# or
./docker-scripts.sh build && ./docker-scripts.sh http
```

2. **Access the application**:
   - HTTP: http://localhost:8090
   - HTTPS: http://localhost:8443 (with `./docker-scripts.sh https`)

### Manual Setup

#### Backend Setup

1. Install Go dependencies:
```bash
go mod tidy
```

2. Run the server:
```bash
# HTTP mode
go run server.go

# HTTPS mode with auto-generated certificates
go run server.go -secure

# Custom port
go run server.go -port 3000

# HTTPS on custom port
go run server.go -port 8443 -secure
```

The server will start on the specified port (default: 8090).

#### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:5173

### Docker Commands

| Command | Description |
|---------|-------------|
| `make build` | Build frontend and Docker image |
| `make run-http` | Run HTTP server (port 8090) |
| `make run-https` | Run HTTPS server (port 8443) |
| `make run-dev` | Run development server |
| `make stop` | Stop all services |
| `make logs` | Show logs |
| `make clean` | Remove all containers and images |

For more Docker options, see [DOCKER.md](DOCKER.md).

## API

### WebSocket Messages

#### Client to Server

**Login:**
```json
{
  "type": "login",
  "nick": "username",
  "channel": "channelname"
}
```

**Send Message:**
```json
{
  "type": "message",
  "data": "Hello world"
}
```

**Typing Indicator:**
```json
{
  "type": "typing",
  "typing": true
}
```

#### Server to Client

**New Message:**
```json
{
  "type": "new-msg",
  "message": {
    "id": "msg_1",
    "f": "username",
    "t": 1640995200000,
    "m": "Hello world"
  }
}
```

**User List:**
```json
{
  "type": "userlist",
  "users": ["user1", "user2"]
}
```

**Typing:**
```json
{
  "type": "typing",
  "user": "username",
  "typing": true
}
```

## Project Structure

```
chat/
├── server.go              # Go WebSocket server
├── go.mod                 # Go dependencies
├── html/                  # Static files
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utilities
│   │   └── types/         # TypeScript types
│   └── package.json
└── README.md
```

## Development

The application follows KISS (Keep It Simple, Stupid) principles:

- Simple WebSocket protocol
- Modular frontend architecture
- Minimal dependencies
- Clear separation of concerns
- Easy to understand and maintain