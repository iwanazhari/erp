import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

interface UseScheduleWebSocketOptions {
  enabled?: boolean;
  userId?: string;
  onScheduleUpdate?: (schedule: any) => void;
}

/**
 * WebSocket hook for real-time schedule updates
 * Listens to scheduleStatusUpdated events from backend
 */
export function useScheduleWebSocket({
  enabled = true,
  userId,
  onScheduleUpdate,
}: UseScheduleWebSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Initialize socket connection
    const socketUrl = import.meta.env.VITE_API_PUBLIC_URL || 'http://157.66.34.174:15320';
    
    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
      console.log('[WebSocket] Connected to schedule updates');
      
      // Join user-specific room if userId provided
      if (userId) {
        socketRef.current?.emit('join', `user:${userId}`);
        socketRef.current?.emit('join', `technician-${userId}`);
      }
    });

    // Listen for schedule status updates
    socketRef.current.on('scheduleStatusUpdated', (data: {
      scheduleId: string;
      status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
      completedAt?: string;
      startedAt?: string;
      schedule?: any;
    }) => {
      console.log('[WebSocket] Schedule status updated:', data);

      // Invalidate schedule queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['sales-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });

      // Call custom callback if provided
      if (onScheduleUpdate) {
        onScheduleUpdate(data);
      }

      // Show toast notification for status changes
      if (data.status === 'IN_PROGRESS') {
        console.log(`[WebSocket] Schedule ${data.scheduleId} started - technician clocked in`);
      } else if (data.status === 'COMPLETED') {
        console.log(`[WebSocket] Schedule ${data.scheduleId} completed - technician clocked out`);
      }
    });

    socketRef.current.on('disconnect', (reason: string) => {
      console.log('[WebSocket] Disconnected:', reason);
    });

    socketRef.current.on('connect_error', (error: Error) => {
      console.error('[WebSocket] Connection error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [enabled, userId, onScheduleUpdate, queryClient]);

  return {
    connected: socketRef.current?.connected || false,
    socket: socketRef.current,
  };
}

export default useScheduleWebSocket;
