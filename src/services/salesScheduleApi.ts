import { privateApi } from './authApi';
import type {
  Schedule,
  CreateScheduleInput,
  UpdateScheduleInput,
  ApiResponse,
  ApiListResponse,
  ScheduleFilters,
} from '@/shared/types/schedule';

/**
 * Sales Schedule API
 * Endpoint khusus untuk role SALES mengelola jadwal
 * Base endpoint: /api/sales/schedules
 */
export const salesScheduleApi = {
  /**
   * Create new schedule
   * POST /api/sales/schedules
   */
  create: async (data: CreateScheduleInput): Promise<ApiResponse<Schedule>> => {
    const response = await privateApi.post('/sales/schedules', data);
    return response.data;
  },

  /**
   * Get all schedules with filters and pagination
   * GET /api/sales/schedules
   */
  getAll: async (filters?: ScheduleFilters): Promise<ApiListResponse<Schedule>> => {
    const params = new URLSearchParams();

    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.pageSize || filters?.limit) params.append('pageSize', String(filters.pageSize || filters.limit));
    // Support both salesId (new) and technicianId (legacy) for filtering
    if (filters?.technicianId) params.append('salesId', filters.technicianId);
    if (filters?.locationId) params.append('locationId', filters.locationId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.search) params.append('search', filters.search);

    const response = await privateApi.get(`/sales/schedules?${params}`);
    return response.data;
  },

  /**
   * Get schedule by ID
   * GET /api/sales/schedules/:id
   */
  getById: async (scheduleId: string): Promise<ApiResponse<Schedule>> => {
    const response = await privateApi.get(`/sales/schedules/${scheduleId}`);
    return response.data;
  },

  /**
   * Update schedule
   * PATCH /api/sales/schedules/:id
   */
  update: async (scheduleId: string, data: UpdateScheduleInput): Promise<ApiResponse<Schedule>> => {
    const response = await privateApi.patch(`/sales/schedules/${scheduleId}`, data);
    return response.data;
  },

  /**
   * Cancel schedule
   * PATCH /api/sales/schedules/:id/cancel
   */
  cancel: async (scheduleId: string, reason?: string): Promise<ApiResponse<Schedule>> => {
    const response = await privateApi.patch(`/sales/schedules/${scheduleId}/cancel`, { reason });
    return response.data;
  },

  /**
   * Delete schedule (only PENDING status)
   * DELETE /api/sales/schedules/:id
   */
  delete: async (scheduleId: string): Promise<ApiResponse<void>> => {
    const response = await privateApi.delete(`/sales/schedules/${scheduleId}`);
    return response.data;
  },

  /**
   * Check technician availability
   * GET /api/sales/technicians/:technicianId/availability?date=YYYY-MM-DD
   */
  checkAvailability: async (technicianId: string, date: string): Promise<ApiResponse<any>> => {
    const formattedDate = date.split('T')[0]; // Ensure YYYY-MM-DD format
    const response = await privateApi.get(`/sales/technicians/${technicianId}/availability`, {
      params: { date: formattedDate }
    });
    return response.data;
  },
};
