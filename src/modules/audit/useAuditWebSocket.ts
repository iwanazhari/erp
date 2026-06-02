import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { auditKeys } from './hooks';

/**
 * WebSocket hook for real-time audit log updates.
 * Listens to `auditLogCreated` events from backend
 * and invalidates audit/recent-activity queries so the dashboard
 * Recent Activity feed updates automatically without manual refresh.
 */
export function useAuditWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_PUBLIC_URL || 'http://157.66.34.174:15320';

    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
      console.log('[AuditWS] Connected');
      // Join admin room to receive auditLogCreated events
      socketRef.current?.emit('join', 'admin');
    });

    socketRef.current.on('auditLogCreated', () => {
      console.log('[AuditWS] New audit log — invalidating queries');
      // Invalidate all audit queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: auditKeys.all });
    });

    socketRef.current.on('disconnect', (reason: string) => {
      console.log('[AuditWS] Disconnected:', reason);
    });

    socketRef.current.on('connect_error', (error: Error) => {
      console.error('[AuditWS] Connection error:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [queryClient]);

  return {
    connected: socketRef.current?.connected || false,
  };
}

export default useAuditWebSocket;
