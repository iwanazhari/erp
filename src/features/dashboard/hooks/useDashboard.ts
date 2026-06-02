import { useQuery } from '@tanstack/react-query';
import { dashboardApi, type DashboardSummary } from '@/services/dashboardApi';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
};

export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: async () => {
      const response = await dashboardApi.getSummary();
      // Backend spreads data at root level, so response IS the DashboardSummary
      const { success, message, ...data } = response;
      return data as DashboardSummary;
    },
  });
}

// Re-export type for convenience
export type { DashboardSummary } from '@/services/dashboardApi';
