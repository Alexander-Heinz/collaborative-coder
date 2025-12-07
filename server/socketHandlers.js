const {
  joinRoom,
  leaveRoom,
  updateCode,
  getRoomState,
  getUserCount,
  findUserRoom
} = require('./roomManager');

/**
 * Setup all Socket.io event handlers
 */
function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join a room
    socket.on('join-room', ({ roomId, userId }) => {
      try {
        console.log(`[Socket] join-room: user=${userId}, room=${roomId}`);
        
        // Leave any existing room first
        const existingRoom = findUserRoom(socket.id);
        if (existingRoom && existingRoom !== roomId) {
          handleLeaveRoom(socket, io, existingRoom);
        }

        // Join the Socket.io room
        socket.join(roomId);
        
        // Join the logical room
        const room = joinRoom(roomId, socket.id);
        
        // Store room info on socket for cleanup
        socket.data.roomId = roomId;
        socket.data.userId = userId;

        // Get current room state
        const roomState = getRoomState(roomId);
        
        // Send room state to the joining user
        socket.emit('room-state', roomState);
        console.log(`[Socket] Sent room-state to ${socket.id}:`, roomState);

        // Notify others in the room
        socket.to(roomId).emit('user-joined', {
          userId,
          userCount: roomState.userCount
        });
        console.log(`[Socket] Broadcast user-joined to room ${roomId}`);

      } catch (error) {
        console.error(`[Socket] Error in join-room:`, error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle code changes
    socket.on('code-change', ({ roomId, code, language }) => {
      try {
        // Update room state
        const room = updateCode(roomId, code, language);
        
        if (room) {
          // Broadcast to all other users in the room
          socket.to(roomId).emit('code-update', {
            code,
            language,
            userId: socket.data.userId || socket.id
          });
        }
      } catch (error) {
        console.error(`[Socket] Error in code-change:`, error);
      }
    });

    // Handle language changes
    socket.on('language-change', ({ roomId, language }) => {
      try {
        console.log(`[Socket] language-change: room=${roomId}, language=${language}`);
        
        // Broadcast to all other users in the room
        socket.to(roomId).emit('language-update', {
          language,
          userId: socket.data.userId || socket.id
        });
      } catch (error) {
        console.error(`[Socket] Error in language-change:`, error);
      }
    });

    // Handle cursor position updates
    socket.on('cursor-move', ({ roomId, position, userId }) => {
      try {
        socket.to(roomId).emit('cursor-update', {
          userId: userId || socket.id,
          position
        });
      } catch (error) {
        console.error(`[Socket] Error in cursor-move:`, error);
      }
    });

    // Handle explicit leave room
    socket.on('leave-room', ({ roomId }) => {
      try {
        handleLeaveRoom(socket, io, roomId);
      } catch (error) {
        console.error(`[Socket] Error in leave-room:`, error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      try {
        console.log(`[Socket] Client disconnected: ${socket.id}, reason: ${reason}`);
        
        const roomId = socket.data.roomId;
        if (roomId) {
          handleLeaveRoom(socket, io, roomId);
        }
      } catch (error) {
        console.error(`[Socket] Error in disconnect:`, error);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`[Socket] Socket error for ${socket.id}:`, error);
    });
  });

  // Log connection stats periodically
  setInterval(() => {
    const sockets = io.sockets.sockets;
    console.log(`[Stats] Active connections: ${sockets.size}`);
  }, 60000);
}

/**
 * Helper function to handle leaving a room
 */
function handleLeaveRoom(socket, io, roomId) {
  console.log(`[Socket] handleLeaveRoom: socket=${socket.id}, room=${roomId}`);
  
  // Leave Socket.io room
  socket.leave(roomId);
  
  // Leave logical room
  const room = leaveRoom(roomId, socket.id);
  
  // Clear socket data
  socket.data.roomId = null;
  
  if (room) {
    // Notify remaining users
    io.to(roomId).emit('user-left', {
      userId: socket.data.userId || socket.id,
      userCount: room.users.size
    });
    console.log(`[Socket] Broadcast user-left to room ${roomId}, remaining: ${room.users.size}`);
  }
}

module.exports = { setupSocketHandlers };
