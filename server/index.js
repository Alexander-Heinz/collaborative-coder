const express = require('express');
const http = require('http'); // Changed from { createServer }
const { Server } = require('socket.io');
const cors = require('cors');
const { setupSocketHandlers } = require('./socketHandlers');

const app = express();
const server = http.createServer(app); // Changed from httpServer = createServer(app)

// CORS configuration
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Socket.io server
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for dev/test
    methods: ["GET", "POST"]
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('[Health] Health check requested');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Setup socket handlers
setupSocketHandlers(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`[Server] CodeSync backend running on port ${PORT}`);
  console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
});
