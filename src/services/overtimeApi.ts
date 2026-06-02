import { privateApi } from './authApi';
import type { ApiResponse } from '@/shared/types/attendance';

export interface OvertimeRequest {
  id: string;
  userId: string;
  date: string;
  hours: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface OvertimeListResponse {
  overtimeRequests: OvertimeRequest[];
}

/**
 * Overtime API Service
 *
 * Handles all overtime-related API calls
 *
 * Endpoints:
 * - POST /api/v1/overtime/request - Submit overtime request
 * - GET /api/v1/overtime - Get overtime requests list
 * - PATCH /api/v1/overtime/:id/approve - Approve overtime request
 * - PATCH /api/v1/overtime/:id/reject - Reject overtime request
 */
export const overtimeApi = {
  /**
   * Submit new overtime request
   * Endpoint: POST /api/v1/overtime/request
   *
   * @param data - Overtime request data (userId, date, hours, reason)
   * @returns ApiResponse<OvertimeRequest>
   */
  requestOvertime: async (data: {
    userId: string;
    date: string;
    hours: number;
    reason: string;
  }): Promise<ApiResponse<OvertimeRequest>> => {
    const response = await privateApi.post<ApiResponse<OvertimeRequest>>(
      '/overtime/request',
      data
    );
    return response.data;
  },

  /**
   * Get all overtime requests (filtered by user role)
   * Endpoint: GET /api/v1/overtime
   *
   * Response varies by role:
   * - EMPLOYEE: Only their own requests
   * - MANAGER: Their team's requests + own
   * - HR/ADMIN: All requests
   *
   * @returns ApiResponse<OvertimeRequest[]>
   */
  getOvertimeRequests: async (): Promise<ApiResponse<OvertimeRequest[]>> => {
    const response = await privateApi.get<ApiResponse<OvertimeRequest[]>>(
      '/overtime'
    );
    return response.data;
  },

  /**
   * Approve overtime request (Manager/HR only)
   * Endpoint: PATCH /api/v1/overtime/:id/approve
   *
   * @param id - Overtime request ID
   * @returns ApiResponse<OvertimeRequest>
   */
  approveOvertime: async (id: string): Promise<ApiResponse<OvertimeRequest>> => {
    const response = await privateApi.patch<ApiResponse<OvertimeRequest>>(
      `/overtime/${id}/approve`
    );
    return response.data;
  },

  /**
   * Reject overtime request (Manager/HR only)
   * Endpoint: PATCH /api/v1/overtime/:id/reject
   *
   * @param id - Overtime request ID
   * @returns ApiResponse<OvertimeRequest>
   */
  rejectOvertime: async (id: string): Promise<ApiResponse<OvertimeRequest>> => {
    const response = await privateApi.patch<ApiResponse<OvertimeRequest>>(
      `/overtime/${id}/reject`
    );
    return response.data;
  },

  /**
   * Export overtime report to Excel (optional future feature)
   * Endpoint: GET /api/v1/overtime/export
   *
   * @param filters - Export filters (startDate, endDate, status)
   * @returns Blob (Excel file)
   */
  exportOvertimeReport: async (filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<Blob> => {
    const params = new URLSearchParams();

    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.status) params.append('status', filters.status);

    const response = await privateApi.get<Blob>(
      `/overtime/export?${params}`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },
};

export default overtimeApi;
