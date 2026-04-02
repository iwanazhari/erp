import { privateApi } from './authApi';
import type {
  Location,
  Schedule,
  CreateLocationInput,
  UpdateLocationInput,
  CreateScheduleInput,
  UpdateScheduleInput,
  AvailabilityData,
  ApiResponse,
  ApiListResponse,
  BulkScheduleResult,
  ScheduleFilters,
  LocationFilters,
  User,
} from '@/shared/types/schedule';

// Location API
export const locationApi = {
  create: async (data: CreateLocationInput): Promise<ApiResponse<Location>> => {
    const response = await privateApi.post('/locations', data);
    return response.data;
  },

  getAll: async (filters?: LocationFilters): Promise<ApiListResponse<Location>> => {
    const params = new URLSearchParams();

    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.officeId) params.append('officeId', filters.officeId);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await privateApi.get(`/locations?${params}`);
    return response.data;
  },

  getById: async (locationId: string): Promise<ApiResponse<Location>> => {
    const response = await privateApi.get(`/locations/${locationId}`);
    return response.data;
  },

  update: async (locationId: string, data: UpdateLocationInput): Promise<ApiResponse<Location>> => {
    const response = await privateApi.patch(`/locations/${locationId}`, data);
    return response.data;
  },

  delete: async (locationId: string): Promise<ApiResponse<void>> => {
    const response = await privateApi.delete(`/locations/${locationId}`);
    return response.data;
  },
};

// User API - Get technicians
export const userApi = {
  getTechnicians: async (): Promise<ApiResponse<User[]>> => {
    // Fetch all users with pagination
    const allUsers: User[] = [];
    let page = 1;
    const limit = 100; // Large limit to minimize requests
    let hasMore = true;

    while (hasMore) {
      const response = await privateApi.get('/user', {
        params: { page, limit }
      });

      const users = response.data.data || response.data;
      const total = response.data.total || users.length;

      if (Array.isArray(users)) {
        allUsers.push(...users);
      }

      // Check if there are more pages
      const fetchedCount = page * limit;
      hasMore = fetchedCount < total && users.length === limit;
      page++;
    }

    // Filter technicians
    const technicians = allUsers.filter(
      (user: User) => user.role === 'TECHNICIAN' || user.role === 'TECHNICIAN_PAYMENT'
    );

    return {
      success: true,
      data: technicians,
    };
  },

  getSales: async (): Promise<ApiResponse<User[]>> => {
    // Fetch all users with pagination
    const allUsers: User[] = [];
    let page = 1;
    const limit = 100; // Large limit to minimize requests
    let hasMore = true;

    while (hasMore) {
      const response = await privateApi.get('/user', {
        params: { page, limit }
      });

      const users = response.data.data || response.data;
      const total = response.data.total || users.length;

      if (Array.isArray(users)) {
        allUsers.push(...users);
      }

      // Check if there are more pages
      const fetchedCount = page * limit;
      hasMore = fetchedCount < total && users.length === limit;
      page++;
    }

    // Filter sales users
    const sales = allUsers.filter(
      (user: User) => user.role === 'SALES'
    );

    return {
      success: true,
      data: sales,
    };
  },
};

// Schedule API
export const scheduleApi = {
  create: async (data: CreateScheduleInput): Promise<ApiResponse<Schedule>> => {
    const response = await privateApi.post('/schedules', data);
    return response.data;
  },

  getAll: async (filters?: ScheduleFilters): Promise<ApiListResponse<Schedule>> => {
    const params = new URLSearchParams();

    if (filters?.technicianId) params.append('technicianId', filters.technicianId);
    if (filters?.locationId) params.append('locationId', filters.locationId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await privateApi.get(`/schedules?${params}`);
    return response.data;
  },

  getById: async (scheduleId: string): Promise<ApiResponse<Schedule>> => {
    const response = await privateApi.get(`/schedules/${scheduleId}`);
    return response.data;
  },

  update: async (scheduleId: string, data: UpdateScheduleInput): Promise<ApiResponse<Schedule>> => {
    const response = await privateApi.patch(`/schedules/${scheduleId}`, data);
    return response.data;
  },

  cancel: async (scheduleId: string): Promise<ApiResponse<Schedule>> => {
    const response = await privateApi.post(`/schedules/${scheduleId}/cancel`);
    return response.data;
  },

  delete: async (scheduleId: string): Promise<ApiResponse<void>> => {
    const response = await privateApi.delete(`/schedules/${scheduleId}`);
    return response.data;
  },

  checkAvailability: async (technicianId: string, date: string): Promise<ApiResponse<AvailabilityData>> => {
    const formattedDate = date.split('T')[0]; // Ensure YYYY-MM-DD format
    // Backend endpoint: /schedules/availability/:technicianId/:date
    const response = await privateApi.get(`/schedules/availability/${technicianId}/${formattedDate}`);
    return response.data;
  },

  bulkCreate: async (schedules: CreateScheduleInput[]): Promise<BulkScheduleResult> => {
    const response = await privateApi.post('/schedules/bulk', { schedules });
    return response.data;
  },

  // Get schedules by technician
  getTechnicianSchedules: async (technicianId: string): Promise<ApiListResponse<Schedule>> => {
    const response = await privateApi.get(`/schedules/technician/${technicianId}`);
    return response.data;
  },

  // Get schedules by location
  getLocationSchedules: async (locationId: string): Promise<ApiListResponse<Schedule>> => {
    const response = await privateApi.get(`/schedules/location/${locationId}`);
    return response.data;
  },
};

export { privateApi as api };
