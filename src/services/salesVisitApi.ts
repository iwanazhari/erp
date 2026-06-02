import { privateApi } from './authApi';

/**
 * Sales Visit API
 * Endpoint: /api/sales/visits
 * Untuk role SALES mengelola jadwal kunjungan sendiri (survey, meeting, visit lokasi).
 */

export interface SalesVisitInput {
  locationId?: string | null;
  locationName: string;
  locationAddress?: string;
  latitude: number;
  longitude: number;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  notes?: string;
}

export interface SalesVisitUpdateInput {
  locationName?: string;
  locationAddress?: string;
  latitude?: number;
  longitude?: number;
  date?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  notes?: string;
}

export interface SalesVisitLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface SalesVisit {
  id: string;
  salesUserId: string | null;
  locationId: string | null;
  location: SalesVisitLocation;
  date: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  description: string | null;
  notes: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  scheduleKind: 'SALES';
}

export interface SalesVisitsListResponse {
  data: SalesVisit[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface SalesVisitFilters {
  page?: number;
  pageSize?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export const salesVisitApi = {
  /**
   * Create a new sales visit
   * POST /api/sales/visits
   */
  create: async (data: SalesVisitInput): Promise<{ success: boolean; data: SalesVisit }> => {
    const response = await privateApi.post('/sales/visits', data);
    return response.data;
  },

  /**
   * Get all sales visits for current user
   * GET /api/sales/visits
   */
  getAll: async (filters?: SalesVisitFilters): Promise<{ success: boolean; data: SalesVisitsListResponse }> => {
    const params = new URLSearchParams();

    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.pageSize) params.append('pageSize', String(filters.pageSize));
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.search) params.append('search', filters.search);

    const response = await privateApi.get(`/sales/visits?${params}`);
    return response.data;
  },

  /**
   * Get single sales visit by ID
   * GET /api/sales/visits/:id
   */
  getById: async (visitId: string): Promise<{ success: boolean; data: SalesVisit }> => {
    const response = await privateApi.get(`/sales/visits/${visitId}`);
    return response.data;
  },

  /**
   * Update a sales visit
   * PATCH /api/sales/visits/:id
   */
  update: async (visitId: string, data: SalesVisitUpdateInput): Promise<{ success: boolean; data: SalesVisit }> => {
    const response = await privateApi.patch(`/sales/visits/${visitId}`, data);
    return response.data;
  },

  /**
   * Cancel a sales visit
   * PATCH /api/sales/visits/:id/cancel
   */
  cancel: async (visitId: string, reason?: string): Promise<{ success: boolean; data: SalesVisit }> => {
    const response = await privateApi.patch(`/sales/visits/${visitId}/cancel`, { reason });
    return response.data;
  },

  /**
   * Delete a sales visit (PENDING only)
   * DELETE /api/sales/visits/:id
   */
  delete: async (visitId: string): Promise<{ success: boolean; data: { id: string } }> => {
    const response = await privateApi.delete(`/sales/visits/${visitId}`);
    return response.data;
  },
};
