const { nanoid } = require('nanoid');

// In-memory room storage
const rooms = new Map();

// Default code templates for each language
const defaultCode = {
  javascript: `// Welcome to CodeSync! 🚀\nconsole.log("Hello, World!");`,
  python: `# Welcome to CodeSync! 🚀\nprint("Hello, World!")`,
  html: `<!DOCTYPE html>\n<html>\n<head>\n  <title>CodeSync</title>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>`
};

/**
 * Generate a new unique room ID
 */
function generateRoomId() {
  return nanoid(8);
}

/**
 * Create a new room or get existing one
 */
function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) {
    console.log(`[Room] Creating new room: ${roomId}`);
    rooms.set(roomId, {
      code: defaultCode.javascript,
      language: 'javascript',
      users: new Set(),
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    });
  }
  return rooms.get(roomId);
}

/**
 * Add a user to a room
 */
function joinRoom(roomId, userId) {
  const room = getOrCreateRoom(roomId);
  room.users.add(userId);
  room.lastActivity = new Date().toISOString();
  console.log(`[Room] User ${userId} joined room ${roomId}. Users: ${room.users.size}`);
  return room;
}

/**
 * Remove a user from a room
 */
function leaveRoom(roomId, userId) {
  if (!rooms.has(roomId)) {
    console.log(`[Room] Room ${roomId} not found for user ${userId}`);
    return null;
  }

  const room = rooms.get(roomId);
  room.users.delete(userId);
  room.lastActivity = new Date().toISOString();
  console.log(`[Room] User ${userId} left room ${roomId}. Users: ${room.users.size}`);

  // Auto-cleanup empty rooms
  if (room.users.size === 0) {
    console.log(`[Room] Room ${roomId} is empty, scheduling cleanup`);
    // Keep room for 5 minutes in case users reconnect
    setTimeout(() => {
      if (rooms.has(roomId) && rooms.get(roomId).users.size === 0) {
        rooms.delete(roomId);
        console.log(`[Room] Room ${roomId} cleaned up`);
      }
    }, 5 * 60 * 1000);
  }

  return room;
}

/**
 * Update room code
 */
function updateCode(roomId, code, language) {
  if (!rooms.has(roomId)) {
    console.log(`[Room] Cannot update code, room ${roomId} not found`);
    return null;
  }

  const room = rooms.get(roomId);
  room.code = code;
  if (language) {
    room.language = language;
  }
  room.lastActivity = new Date().toISOString();
  return room;
}

/**
 * Get room state
 */
function getRoomState(roomId) {
  const room = rooms.get(roomId);
  if (!room) return null;
  
  return {
    code: room.code,
    language: room.language,
    userCount: room.users.size
  };
}

/**
 * Get user count in a room
 */
function getUserCount(roomId) {
  const room = rooms.get(roomId);
  return room ? room.users.size : 0;
}

/**
 * Find which room a user is in
 */
function findUserRoom(userId) {
  for (const [roomId, room] of rooms.entries()) {
    if (room.users.has(userId)) {
      return roomId;
    }
  }
  return null;
}

/**
 * Get all active rooms (for debugging)
 */
function getAllRooms() {
  const roomList = [];
  for (const [roomId, room] of rooms.entries()) {
    roomList.push({
      roomId,
      userCount: room.users.size,
      language: room.language,
      createdAt: room.createdAt,
      lastActivity: room.lastActivity
    });
  }
  return roomList;
}

module.exports = {
  generateRoomId,
  getOrCreateRoom,
  joinRoom,
  leaveRoom,
  updateCode,
  getRoomState,
  getUserCount,
  findUserRoom,
  getAllRooms
};
