import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { trackingKeys } from './useTracking';

interface TrackingPosition {
  userId: string;
  name: string | null;
  latitude: number;
  longitude: number;
  recordedAt: string;
  sessionId: string | null;
}

interface UseTrackingWebSocketOptions {
  enabled?: boolean;
  onPositionUpdate?: (position: TrackingPosition) => void;
}

export function useTrackingWebSocket({
  enabled = true,
  onPositionUpdate,
}: UseTrackingWebSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  const handlePosition = useCallback(
    (position: TrackingPosition) => {
      queryClient.invalidateQueries({ queryKey: trackingKeys.activeSessions() });
      queryClient.invalidateQueries({
        queryKey: trackingKeys.userTracking(position.userId),
      });
      onPositionUpdate?.(position);
    },
    [queryClient, onPositionUpdate]
  );

  useEffect(() => {
    if (!enabled) return;

    socketRef.current = io({
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
      console.log('[TrackingWS] Connected');
      socketRef.current?.emit('join:tracking');
    });

    socketRef.current.on('tracking:position', handlePosition);

    socketRef.current.on('disconnect', (reason: string) => {
      console.log('[TrackingWS] Disconnected:', reason);
    });

    socketRef.current.on('connect_error', (error: Error) => {
      console.error('[TrackingWS] Connection error:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave:tracking');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [enabled, handlePosition]);

  return {
    connected: socketRef.current?.connected || false,
  };
}

export default useTrackingWebSocket;
