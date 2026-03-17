import { privateApi } from './authApi';
import type {
  AttendanceRecord,
  AttendanceHistoryData,
  AttendanceRecordsData,
  AttendanceHistoryFilters,
  AttendanceRecordsFilters,
  MonthlyAttendanceData,
  MonthlyAttendanceFilters,
  ApiResponse,
} from '@/shared/types/attendance';

/**
 * Attendance API Service
 *
 * Handles all attendance-related API calls
 *
 * Primary Endpoints:
 * - GET /api/attendance/history - User attendance history
 * - GET /api/attendance/records - Admin attendance records (all companies)
 */
export const attendanceApi = {
  /**
   * Get attendance history with filters and pagination
   * Endpoint: GET /api/attendance/history
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
   * @returns ApiResponse<AttendanceHistoryData>
   */
  getHistory: async (filters?: AttendanceHistoryFilters): Promise<ApiResponse<AttendanceHistoryData>> => {
    const params = new URLSearchParams();

    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.pageSize) params.append('pageSize', String(filters.pageSize));

    const response = await privateApi.get<ApiResponse<AttendanceHistoryData>>(
      `/attendance/history?${params}`
    );
    return response.data;
  },

  /**
   * Get all attendance records (Admin only)
   * Endpoint: GET /api/attendance/records
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
   * @returns ApiResponse<AttendanceRecordsData>
   */
  getAllRecords: async (filters?: AttendanceRecordsFilters): Promise<ApiResponse<AttendanceRecordsData>> => {
    const params = new URLSearchParams();

    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.clockOutStatus) params.append('clockOutStatus', filters.clockOutStatus);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.pageSize) params.append('pageSize', String(filters.pageSize));

    const response = await privateApi.get<ApiResponse<AttendanceRecordsData>>(
      `/attendance/records?${params}`
    );
    return response.data;
  },

  /**
   * Get attendance history for a specific user
   */
  getUserHistory: async (
    userId: string,
    filters?: Omit<AttendanceHistoryFilters, 'userId'>
  ): Promise<ApiResponse<AttendanceHistoryData | MonthlyAttendanceData>> => {
    const params = new URLSearchParams();

    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.pageSize) params.append('pageSize', String(filters.pageSize));

    const response = await privateApi.get<ApiResponse<AttendanceHistoryData | MonthlyAttendanceData>>(
      `/attendance/history/user/${userId}?${params}`
    );
    return response.data;
  },

  /**
   * Get monthly attendance summary for all users
   */
  getMonthly: async (filters?: MonthlyAttendanceFilters): Promise<ApiResponse<MonthlyAttendanceData>> => {
    const params = new URLSearchParams();

    if (filters?.month) params.append('month', String(filters.month));
    if (filters?.year) params.append('year', String(filters.year));
    if (filters?.companyId) params.append('companyId', filters.companyId);

    const response = await privateApi.get<ApiResponse<MonthlyAttendanceData>>(
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
