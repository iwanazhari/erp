import { privateApi } from './authApi';
import type { ApiResponse } from '@/shared/types/attendance';

export interface OvertimeRequest {
  id: string;
  userId: string;
  date: string;
  /** Durasi lembur format "H:MM", contoh "6:30" */
  hours: string;
  reason: string;
  /** Catatan request mentah dari client (teks bebas, opsional) */
  note?: string | null;
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

export interface OvertimeListResponse extends ApiResponse<OvertimeRequest[]> {
  total: number;
  /** Total durasi lembur untuk seluruh hasil filter, format "H:MM" */
  totalHours: string;
  page: number;
  pageSize: number;
  totalPages: number;
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
    hours: string;
    reason: string;
    note?: string;
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
  getOvertimeRequests: async (params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<OvertimeListResponse> => {
    const response = await privateApi.get<OvertimeListResponse>('/overtime', {
      params,
    });
    return response.data;
  },

  /**
   * Get single overtime request detail (HR/ADMIN)
   * Endpoint: GET /api/v1/overtime/:id
   */
  getOvertimeById: async (id: string): Promise<ApiResponse<OvertimeRequest>> => {
    const response = await privateApi.get<ApiResponse<OvertimeRequest>>(`/overtime/${id}`);
    return response.data;
  },

  /**
   * Update overtime request (HR/ADMIN)
   * Endpoint: PATCH /api/v1/overtime/:id
   */
  updateOvertime: async (
    id: string,
    data: { date?: string; hours?: string; reason?: string; note?: string }
  ): Promise<ApiResponse<OvertimeRequest>> => {
    const response = await privateApi.patch<ApiResponse<OvertimeRequest>>(`/overtime/${id}`, data);
    return response.data;
  },

  /**
   * Delete overtime request (HR/ADMIN)
   * Endpoint: DELETE /api/v1/overtime/:id
   */
  deleteOvertime: async (id: string): Promise<ApiResponse<{ id: string }>> => {
    const response = await privateApi.delete<ApiResponse<{ id: string }>>(`/overtime/${id}`);
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
