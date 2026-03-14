import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '@/services/attendanceApi';
import type {
  AttendanceHistoryFilters,
  AttendanceStatsFilters,
  MonthlyAttendanceFilters,
} from '@/shared/types/attendance';

// Query keys
export const attendanceKeys = {
  all: ['attendance'] as const,
  history: (filters: AttendanceHistoryFilters) => [...attendanceKeys.all, 'history', filters] as const,
  userHistory: (userId: string, filters?: Omit<AttendanceHistoryFilters, 'userId'>) =>
    [...attendanceKeys.all, 'user-history', userId, filters] as const,
  userStats: (userId: string, filters?: AttendanceStatsFilters) =>
    [...attendanceKeys.all, 'stats', userId, filters] as const,
  monthly: (filters?: MonthlyAttendanceFilters) =>
    [...attendanceKeys.all, 'monthly', filters] as const,
  byId: (id: string) => [...attendanceKeys.all, 'detail', id] as const,
  dailyStatus: () => [...attendanceKeys.all, 'daily-status'] as const,
};

/**
 * Hook to fetch attendance history with filters
 */
export function useAttendanceHistory(filters: AttendanceHistoryFilters = {}) {
  return useQuery({
    queryKey: attendanceKeys.history(filters),
    queryFn: () => attendanceApi.getHistory(filters),
    select: (data) => data.data,
  });
}

/**
 * Hook to fetch attendance history for a specific user
 */
export function useUserAttendanceHistory(
  userId: string,
  filters?: Omit<AttendanceHistoryFilters, 'userId'>
) {
  return useQuery({
    queryKey: attendanceKeys.userHistory(userId, filters),
    queryFn: () => attendanceApi.getUserHistory(userId, filters),
    select: (data) => data.data,
    enabled: !!userId,
  });
}

/**
 * Hook to fetch attendance statistics for a user
 */
export function useUserAttendanceStats(userId: string, filters?: AttendanceStatsFilters) {
  return useQuery({
    queryKey: attendanceKeys.userStats(userId, filters),
    queryFn: () => attendanceApi.getUserStats(userId, filters),
    select: (data) => data.data,
    enabled: !!userId,
  });
}

/**
 * Hook to fetch monthly attendance summary
 */
export function useMonthlyAttendance(filters?: MonthlyAttendanceFilters) {
  return useQuery({
    queryKey: attendanceKeys.monthly(filters),
    queryFn: () => attendanceApi.getMonthly(filters),
    select: (data) => data.data,
  });
}

/**
 * Hook to fetch attendance by ID
 */
export function useAttendanceById(id: string) {
  return useQuery({
    queryKey: attendanceKeys.byId(id),
    queryFn: () => attendanceApi.getById(id),
    select: (data) => data.data,
    enabled: !!id,
  });
}

/**
 * Hook to fetch daily status
 */
export function useDailyStatus() {
  return useQuery({
    queryKey: attendanceKeys.dailyStatus(),
    queryFn: () => attendanceApi.getDailyStatus(),
    select: (data) => data.data,
  });
}
