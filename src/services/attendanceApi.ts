import { privateApi } from './authApi';
import type {
  AttendanceRecord,
  AttendanceHistoryData,
  AttendanceRecordsData,
  AttendanceHistoryFilters,
  AttendanceRecordsFilters,
  MonthlyAttendanceData,
  MonthlyAttendanceFilters,
  MonthlyReportExportFilters,
  HistoryExportFilters,
  AllRecordsExportFilters,
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

  /**
   * Export Monthly Report to Excel
   * Endpoint: GET /api/attendance/export/monthly
   * Access: ADMIN, MANAGER
   * 
   * @param filters - Export filters (year, month, search query)
   * @returns Blob (Excel file)
   */
  exportMonthlyReport: async (filters?: MonthlyReportExportFilters): Promise<Blob> => {
    const params = new URLSearchParams();

    if (filters?.year) params.append('year', String(filters.year));
    if (filters?.month) params.append('month', String(filters.month));
    if (filters?.q) params.append('q', filters.q);

    const response = await privateApi.get<Blob>(
      `/attendance/export/monthly?${params}`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },

  /**
   * Export Attendance History to Excel
   * Endpoint: GET /api/attendance/export/history
   * Access: ADMIN, MANAGER
   * 
   * @param filters - Export filters (startDate, endDate, userId, status)
   * @returns Blob (Excel file)
   */
  exportHistory: async (filters?: HistoryExportFilters): Promise<Blob> => {
    const params = new URLSearchParams();

    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.status) params.append('status', filters.status);

    const response = await privateApi.get<Blob>(
      `/attendance/export/history?${params}`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },

  /**
   * Export All Attendance Records to Excel
   * Endpoint: GET /api/attendance/export/records
   * Access: ADMIN ONLY
   * 
   * @param filters - Export filters (startDate, endDate, status, clockOutStatus)
   * @returns Blob (Excel file)
   */
  exportAllRecords: async (filters?: AllRecordsExportFilters): Promise<Blob> => {
    const params = new URLSearchParams();

    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.clockOutStatus) params.append('clockOutStatus', filters.clockOutStatus);

    const response = await privateApi.get<Blob>(
      `/attendance/export/records?${params}`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },
};

export default attendanceApi;
