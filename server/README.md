# CodeSync Backend

Express + Socket.io backend for real-time collaborative code editing.

## Quick Start

```bash
cd server
npm install
npm start
```

Server runs on `http://localhost:3001`

## API Endpoints

### REST
- `GET /api/health` - Health check, returns `{ status: 'ok' }`

### Socket.io Events

**Client → Server:**
- `join-room` - Join a room: `{ roomId, userId }`
- `code-change` - Update code: `{ roomId, code, language }`
- `language-change` - Change language: `{ roomId, language }`
- `cursor-move` - Cursor position: `{ roomId, position, userId }`
- `leave-room` - Leave room: `{ roomId }`

**Server → Client:**
- `room-state` - Initial state: `{ code, language, userCount }`
- `code-update` - Code changed: `{ code, language, userId }`
- `language-update` - Language changed: `{ language, userId }`
- `cursor-update` - Cursor moved: `{ userId, position }`
- `user-joined` - User joined: `{ userId, userCount }`
- `user-left` - User left: `{ userId, userCount }`

## Configuration

- Port: `3001` (or `PORT` env variable)
- CORS: Allows `localhost:8080`, `localhost:5173`, `localhost:3000`
