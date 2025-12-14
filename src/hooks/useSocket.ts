import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from './use-toast';

// Define socket events
interface ServerToClientEvents {
  'room-state': (state: { code: string; language: string; userCount: number }) => void;
  'code-update': (data: { code: string; language?: string }) => void;
  'user-joined': (data: { userId: string; userCount: number }) => void;
  'user-left': (data: { userId: string; userCount: number }) => void;
  'error': (error: string) => void;
}

interface ClientToServerEvents {
  'join-room': (data: { roomId: string; userId: string }) => void;
  'leave-room': (roomId: string) => void;
  'code-change': (data: { roomId: string; code: string; language?: string }) => void;
}

const SOCKET_URL = import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin;

export const useSocket = (roomId: string | null) => {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);
      if (roomId) {
        socket.emit('join-room', { roomId, userId: socket.id });
      }
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setIsConnected(false);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });

    socket.on('room-state', (state) => {
      console.log('Received room state:', state);
      setCode(state.code);
      setLanguage(state.language);
      setUserCount(state.userCount);
    });

    socket.on('code-update', (data) => {
      console.log('Received code update:', data);
      setCode(data.code);
      if (data.language) {
        setLanguage(data.language);
      }
    });

    socket.on('user-joined', ({ userCount }) => {
      console.log('User joined, count:', userCount);
      setUserCount(userCount);
      toast({
        title: "User joined",
        description: `There are now ${userCount} users in the room`,
      });
    });

    socket.on('user-left', ({ userCount }) => {
      console.log('User left, count:', userCount);
      setUserCount(userCount);
      toast({
        title: "User left",
        description: `There are now ${userCount} users in the room`,
      });
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: error,
      });
    });

    return () => {
      if (roomId) {
        socket.emit('leave-room', roomId);
      }
      socket.disconnect();
    };
  }, [roomId]);

  const updateCode = useCallback((newCode: string, newLanguage?: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('code-change', {
        roomId: roomId || 'default-room',
        code: newCode,
        language: newLanguage || language
      });

      // Optimistically update local state
      setCode(newCode);
      if (newLanguage) setLanguage(newLanguage);
    } else {
      console.warn('[useSocket] Cannot emit code-change: not connected or no room ID');
    }
  }, [isConnected, roomId, language]);

  return {
    socket: socketRef.current,
    isConnected,
    code,
    language,
    userCount,
    updateCode
  };
};
