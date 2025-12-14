const express = require('express');
const http = require('http'); // Changed from { createServer }
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
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

// Serve static files from the dist folder (frontend build) in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// SPA fallback - serve index.html for all non-API routes
app.get('(.*)', (req, res) => {
  // Don't serve index.html for API routes or socket.io routes
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

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
