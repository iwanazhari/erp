import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '@/services/attendanceApi';
import type {
  AttendanceHistoryFilters,
  AttendanceRecordsFilters,
  MonthlyAttendanceFilters,
} from '@/shared/types/attendance';

export { useAttendanceExport } from './useAttendanceExport';

/**
 * Attendance Query Keys Factory
 *
 * Provides type-safe query keys for React Query caching
 */
export const attendanceKeys = {
  all: ['attendance'] as const,
  /** History list query key with filters */
  history: (filters: AttendanceHistoryFilters) => [...attendanceKeys.all, 'history', filters] as const,
  /** Records list query key with filters (Admin) */
  records: (filters: AttendanceRecordsFilters) => [...attendanceKeys.all, 'records', filters] as const,
  /** User-specific history query key */
  userHistory: (userId: string, filters?: Omit<AttendanceHistoryFilters, 'userId'>) =>
    [...attendanceKeys.all, 'user-history', userId, filters] as const,
  /** Monthly attendance summary query key */
  monthly: (filters?: MonthlyAttendanceFilters) =>
    [...attendanceKeys.all, 'monthly', filters] as const,
  /** Single attendance record by ID */
  byId: (id: string) => [...attendanceKeys.all, 'detail', id] as const,
  /** Daily status overview */
  dailyStatus: () => [...attendanceKeys.all, 'daily-status'] as const,
};

/**
 * Hook to fetch attendance history with filters
 *
 * Uses GET /api/attendance/history - the primary endpoint for attendance history
 *
 * Response format:
 * {
 *   success: true,
 *   message: "OK",
 *   data: {
 *     attendances: [...],
 *     pagination: { page, pageSize, total, totalPages }
 *   }
 * }
 *
 * @param filters - Query parameters (companyId, startDate, endDate, status, page, pageSize)
 * @returns Query result with attendance history data
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useAttendanceHistory({
 *   startDate: '2026-03-01',
 *   endDate: '2026-03-31',
 *   page: 1,
 *   pageSize: 50,
 * });
 *
 * // data.attendances - Array of attendance records
 * // data.pagination - Pagination info
 * ```
 */
export function useAttendanceHistory(filters: AttendanceHistoryFilters = {}) {
  return useQuery({
    queryKey: attendanceKeys.history(filters),
    queryFn: async () => {
      const response = await attendanceApi.getHistory(filters);
      // Handle both nested and flat response structures
      return response.data;
    },
    select: (data) => {
      // If data is already the AttendanceHistoryData format
      if (data && 'attendances' in data && 'pagination' in data) {
        return data;
      }
      // If data is nested inside another data object
      if (data && (data as any).data) {
        return (data as any).data;
      }
      // Return data as-is if no structure matches
      return data;
    },
  });
}

/**
 * Hook to fetch all attendance records (Admin only)
 *
 * Uses GET /api/attendance/records - Admin endpoint for comprehensive attendance data
 *
 * Features:
 * - View all attendance data from all users (clock in & clock out)
 * - No companyId filter - ADMIN can see all data from all companies
 * - Optional filters: date range, status, clockOutStatus
 * - Pagination support (default 50, max 100 per page)
 *
 * Response includes:
 * - Clock in/out time & location (GPS)
 * - Photos (selfie, job completion, signature, etc.)
 * - User info (name, email, role, phone)
 * - Company & office info
 * - Payment info (for technician)
 * - Leave info (if applicable)
 * - Technician tracking info
 *
 * @param filters - Query parameters (startDate, endDate, status, clockOutStatus, page, pageSize)
 * @returns Query result with attendance records data
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useAttendanceRecords({
 *   startDate: '2026-03-01',
 *   endDate: '2026-03-31',
 *   page: 1,
 *   pageSize: 50,
 * });
 *
 * // data.records - Array of attendance records with photos, leave info, etc.
 * // data.pagination - Pagination info
 * ```
 */
export function useAttendanceRecords(filters: AttendanceRecordsFilters = {}) {
  return useQuery({
    queryKey: attendanceKeys.records(filters),
    queryFn: async () => {
      const response = await attendanceApi.getAllRecords(filters);
      return response.data;
    },
    select: (data) => {
      // Handle nested response structure
      if (data && 'records' in data && 'pagination' in data) {
        return data;
      }
      // If data is nested inside another data object
      if (data && (data as any).data) {
        return (data as any).data;
      }
      return data;
    },
  });
}

/**
 * Hook to fetch attendance history for a specific user
 * 
 * Uses GET /api/attendance/history/user/:userId endpoint
 * 
 * @param userId - The user ID to fetch history for
 * @param filters - Optional filters (startDate, endDate, status, page, pageSize)
 * @returns Query result with user's attendance history
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
 * Hook to fetch monthly attendance summary for all users
 * 
 * Uses GET /api/attendance/monthly endpoint
 * Returns aggregated counts per user (not detailed records)
 * 
 * @param filters - Optional filters (month, year, companyId)
 * @returns Query result with monthly attendance summary
 * 
 * @example
 * ```tsx
 * const { data } = useMonthlyAttendance({ month: 3, year: 2026 });
 * // Returns: { users: [{ userId, name, counts: { HADIR: 15, ... } }] }
 * ```
 */
export function useMonthlyAttendance(filters?: MonthlyAttendanceFilters) {
  return useQuery({
    queryKey: attendanceKeys.monthly(filters),
    queryFn: () => attendanceApi.getMonthly(filters),
    select: (data) => data.data,
  });
}

/**
 * Hook to fetch a single attendance record by ID
 * 
 * Uses GET /api/attendance/:id endpoint
 * 
 * @param id - The attendance record ID
 * @returns Query result with single attendance record
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
 * Hook to fetch daily attendance status overview
 * 
 * Uses GET /api/attendance/status/daily endpoint
 * 
 * @returns Query result with daily status summary
 */
export function useDailyStatus() {
  return useQuery({
    queryKey: attendanceKeys.dailyStatus(),
    queryFn: () => attendanceApi.getDailyStatus(),
    select: (data) => data.data,
  });
}

/**
 * Hook to update attendance record
 *
 * Uses PUT /api/attendance/:id endpoint
 *
 * @returns Mutation object with update function
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useUpdateAttendance();
 *
 * mutate({
 *   id: 'att_123',
 *   date: '2026-03-01',
 *   checkIn: '09:00',
 *   checkOut: '17:00',
 *   status: 'HADIR',
 *   editReason: 'Data correction - system error',
 * });
 * ```
 */
export function useUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      date: string;
      checkIn: string;
      checkOut?: string;
      status: string;
      editReason: string;
    }) => {
      // Import privateApi for the update request
      const { privateApi } = await import('@/services/authApi');
      
      // Build the update payload according to backend API documentation
      const payload: Record<string, any> = {
        status: data.status,
        editReason: data.editReason, // Required for audit trail
      };

      // If checkIn or checkOut is provided, we need to update the full datetime
      // The backend expects full ISO datetime strings
      if (data.checkIn) {
        // Get the original date and combine with new time
        const [year, month, day] = data.date.split('-').map(Number);
        const [hours, minutes] = data.checkIn.split(':').map(Number);
        const checkInDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
        payload.clockIn = checkInDate.toISOString();
      }

      if (data.checkOut) {
        const [year, month, day] = data.date.split('-').map(Number);
        const [hours, minutes] = data.checkOut.split(':').map(Number);
        const checkOutDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
        payload.clockOut = checkOutDate.toISOString();
      }

      const response = await privateApi.put(`/attendance/${data.id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate attendance queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
}
