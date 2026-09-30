import { useQuery } from '@tanstack/react-query';
import { trackingApi } from '@/services/trackingApi';

export const trackingKeys = {
  all: ['tracking'] as const,
  activeSessions: () => [...trackingKeys.all, 'active'] as const,
  userTracking: (userId: string, date?: string) =>
    [...trackingKeys.all, 'user', userId, date] as const,
};

export function useActiveSessions(refetchInterval = 30_000) {
  return useQuery({
    queryKey: trackingKeys.activeSessions(),
    queryFn: () => trackingApi.getActiveSessions(),
    refetchInterval,
    staleTime: 10_000,
  });
}

export function useUserTracking(userId: string | null, date?: string, refetchInterval = 15_000) {
  return useQuery({
    queryKey: trackingKeys.userTracking(userId || '', date || ''),
    queryFn: () => trackingApi.getUserTracking(userId!, date),
    enabled: !!userId,
    refetchInterval: userId ? refetchInterval : false,
    staleTime: 10_000,
  });
}
