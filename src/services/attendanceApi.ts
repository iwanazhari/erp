import { privateApi } from './authApi';
import type {
  AttendanceRecord,
  AttendanceHistoryData,
  UserAttendanceStats,
  MonthlyAttendance,
  AttendanceHistoryFilters,
  AttendanceStatsFilters,
  MonthlyAttendanceFilters,
  ApiResponse,
} from '@/shared/types/attendance';

/**
 * Attendance API Service
 *
 * Handles all attendance-related API calls
 * 
 * Primary Endpoint: GET /api/attendance
 */
export const attendanceApi = {
  /**
   * Get all attendance records with filters and pagination
   * Primary endpoint: GET /api/attendance
   */
  getAll: async (filters?: AttendanceHistoryFilters): Promise<ApiResponse<AttendanceHistoryData>> => {
    const params = new URLSearchParams();

    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.pageSize) params.append('pageSize', String(filters.pageSize));

    const response = await privateApi.get<ApiResponse<AttendanceHistoryData>>(
      `/attendance?${params}`
    );
    return response.data;
  },

  /**
   * Get attendance history (alias for getAll - backward compatibility)
   * @deprecated Use getAll() instead
   */
  getHistory: async (filters?: AttendanceHistoryFilters): Promise<ApiResponse<AttendanceHistoryData>> => {
    return attendanceApi.getAll(filters);
  },

  /**
   * Get attendance history for a specific user
   */
  getUserHistory: async (
    userId: string,
    filters?: Omit<AttendanceHistoryFilters, 'userId'>
  ): Promise<ApiResponse<AttendanceHistoryData>> => {
    const params = new URLSearchParams();

    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.pageSize) params.append('pageSize', String(filters.pageSize));

    const response = await privateApi.get<ApiResponse<AttendanceHistoryData>>(
      `/attendance/history/user/${userId}?${params}`
    );
    return response.data;
  },

  /**
   * Get attendance statistics for a specific user
   */
  getUserStats: async (
    userId: string,
    filters?: AttendanceStatsFilters
  ): Promise<ApiResponse<UserAttendanceStats>> => {
    const params = new URLSearchParams();

    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await privateApi.get<ApiResponse<UserAttendanceStats>>(
      `/attendance/stats/user/${userId}?${params}`
    );
    return response.data;
  },

  /**
   * Get monthly attendance summary for all users
   */
  getMonthly: async (filters?: MonthlyAttendanceFilters): Promise<ApiResponse<MonthlyAttendance[]>> => {
    const params = new URLSearchParams();

    if (filters?.month) params.append('month', String(filters.month));
    if (filters?.year) params.append('year', String(filters.year));
    if (filters?.companyId) params.append('companyId', filters.companyId);

    const response = await privateApi.get<ApiResponse<MonthlyAttendance[]>>(
      `/attendance/monthly?${params}`
    );
    return response.data;
  },

  /**
   * Get attendance by ID
   */
  getById: async (id: string): Promise<ApiResponse<AttendanceRecord>> => {
    const response = await privateApi.get<ApiResponse<AttendanceRecord>>(`/attendance/${id}`);
    return response.data;
  },

  /**
   * Get daily status
   */
  getDailyStatus: async (): Promise<ApiResponse<any>> => {
    const response = await privateApi.get<ApiResponse<any>>('/attendance/status/daily');
    return response.data;
  },
};

export default attendanceApi;
