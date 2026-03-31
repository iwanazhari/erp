import { privateApi } from './authApi';
import type {
  Leave,
  LeaveData,
  LeaveFilters,
  LeaveEditHistoryData,
  UpdateLeaveData,
  ApiResponse,
} from '@/shared/types/leave';

/**
 * Leave Management API Service
 *
 * Handles all leave-related API calls
 *
 * Endpoints:
 * - GET /api/leave - Get all leave requests
 * - GET /api/leave/:id/edit-history - Get edit history
 * - PUT /api/leave/:id - Update leave request
 * - DELETE /api/leave/:id - Delete leave request
 */
export const leaveApi = {
  /**
   * Get all leave requests with filters and pagination
   * Endpoint: GET /api/leave
   *
   * @param filters - Query parameters (page, pageSize, status, type, userId, startDate, endDate)
   * @returns ApiResponse<LeaveData>
   */
  getAll: async (filters?: LeaveFilters): Promise<ApiResponse<LeaveData>> => {
    const params = new URLSearchParams();

    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.pageSize) params.append('pageSize', String(filters.pageSize));
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await privateApi.get<ApiResponse<LeaveData>>(`/leave?${params}`);
    return response.data;
  },

  /**
   * Get leave edit history (audit trail)
   * Endpoint: GET /api/leave/:id/edit-history
   *
   * @param leaveId - Leave ID (UUID)
   * @returns ApiResponse<LeaveEditHistoryData>
   */
  getEditHistory: async (leaveId: string): Promise<ApiResponse<LeaveEditHistoryData>> => {
    const response = await privateApi.get<ApiResponse<LeaveEditHistoryData>>(
      `/leave/${leaveId}/edit-history`
    );
    return response.data;
  },

  /**
   * Update leave request (ADMIN/MANAGER only)
   * Endpoint: PUT /api/leave/:id
   *
   * @param leaveId - Leave ID (UUID)
   * @param updateData - Update data (editReason is required)
   * @returns ApiResponse<Leave>
   */
  update: async (leaveId: string, updateData: UpdateLeaveData): Promise<ApiResponse<Leave>> => {
    const response = await privateApi.put<ApiResponse<Leave>>(`/leave/${leaveId}`, updateData);
    return response.data;
  },

  /**
   * Delete leave request (ADMIN only)
   * Endpoint: DELETE /api/leave/:id
   *
   * @param leaveId - Leave ID (UUID)
   * @returns ApiResponse<{ id: string; deleted: boolean }>
   */
  delete: async (leaveId: string): Promise<ApiResponse<{ id: string; deleted: boolean }>> => {
    const response = await privateApi.delete<ApiResponse<{ id: string; deleted: boolean }>>(
      `/leave/${leaveId}`
    );
    return response.data;
  },
};

export default leaveApi;
