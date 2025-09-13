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

### Backend Setup

1. Install Go dependencies:
```bash
go mod tidy
```

2. Run the server:
```bash
go run server.go
```

The server will start on port 8090.

### Frontend Setup

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