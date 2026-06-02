import { useQuery } from '@tanstack/react-query';
import { dashboardApi, type AttendanceTrafficFilters, type AttendanceTrafficData } from '@/services/dashboardApi';

export const attendanceTrafficKeys = {
  all: ['dashboard', 'attendance-traffic'] as const,
  filtered: (filters: AttendanceTrafficFilters) =>
    [...attendanceTrafficKeys.all, filters] as const,
};

/**
 * Hook to fetch attendance traffic data for line chart
 * Supports role filter (ALL, SALES, TECHNICIAN) and date range
 */
export function useAttendanceTraffic(filters: AttendanceTrafficFilters = {}) {
  return useQuery({
    queryKey: attendanceTrafficKeys.filtered(filters),
    queryFn: async () => {
      // Backend sendResponse() spreads data at root level:
      //   { success, message, traffic: [...], summary: {...} }
      // Destructure to extract only the data fields
      const { success, message, ...data } = await dashboardApi.getAttendanceTraffic(filters);
      return data as AttendanceTrafficData;
    },
    // Refetch every 5 minutes to show latest data
    refetchInterval: 5 * 60 * 1000,
  });
}
