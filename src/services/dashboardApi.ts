import { privateApi } from './authApi';

export interface DashboardSummary {
  totalTechnicians: number;
  todayAttendance: number;
  activeSchedules: number;
  pendingLeaves: number;
  pendingApprovals: number;
  totalSales: number;
  completedToday: number;
  lateToday: number;
}

/**
 * NOTE: Backend sendResponse() spreads the data object at root level,
 * so the response shape is:
 *   { success: true, message: "...", totalTechnicians: 9, ... }
 * NOT nested under a "data" key.
 */
export type DashboardSummaryResponse = DashboardSummary & { success: boolean; message?: string };

// ─── Attendance Traffic ──────────────────────────────────────────

export interface TrafficDay {
  date: string;           // "2026-05-24"
  total: number;
  onTime: number;
  late: number;
}

export interface AttendanceTrafficData {
  traffic: TrafficDay[];
  summary: {
    totalCheckedIn: number;
    totalLate: number;
    totalOnTime: number;
    averagePerDay: number;
    totalUsers: number;
    role: string;
  };
}

export interface AttendanceTrafficFilters {
  startDate?: string;
  endDate?: string;
  role?: 'ALL' | 'SALES' | 'TECHNICIAN';
}

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummaryResponse> => {
    const response = await privateApi.get<DashboardSummaryResponse>(
      '/dashboard/summary'
    );
    return response.data;
  },

  /**
   * Get attendance traffic data for line chart
   * GET /api/dashboard/attendance-traffic?startDate=...&endDate=...&role=...
   * 
   * NOTE: Backend sendResponse() spreads the data object at root level,
   * so the response shape is:
   *   { success: true, message: "...", traffic: [...], summary: {...} }
   * NOT nested under a "data" key.
   */
  getAttendanceTraffic: async (
    filters?: AttendanceTrafficFilters
  ): Promise<AttendanceTrafficData & { success: boolean; message?: string }> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.role && filters.role !== 'ALL') params.append('role', filters.role);

    const response = await privateApi.get<AttendanceTrafficData & { success: boolean; message?: string }>(
      `/dashboard/attendance-traffic?${params}`
    );
    return response.data;
  },
};

export default dashboardApi;
