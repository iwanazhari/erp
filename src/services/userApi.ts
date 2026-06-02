import { privateApi } from './authApi';

export interface UserOption {
  id: string;
  name: string;
  email: string;
  role: string;
  division?: string;
  phone?: string;
  image?: string | null;
  managerId?: string | null;
  companyId?: string | null;
  officeId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaveBalanceInfo {
  id: string;
  year: number;
  month: number;
  sidTaken: number;
  sidRemaining: number;
  cutiTaken: number;
  cutiRemaining: number;
}

export interface UserWithBalance extends UserOption {
  latestAttendance: {
    clockIn: string | null;
    clockOut: string | null;
  };
  latestLeaveBalance: LeaveBalanceInfo | null;
}

interface SearchApiResponse {
  success: boolean;
  message?: string;
  data: UserOption[] | {
    users: UserOption[];
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
  total?: number;
  page?: number;
  limit?: number;
}

/**
 * User API Service
 */
export const userApi = {
  /**
   * Search users by name or email
   * GET /api/search/:q
   */
  searchUsers: async (query: string, page = 1): Promise<SearchApiResponse> => {
    if (!query || query.trim().length === 0) {
      return { success: true, data: [], total: 0, page, limit: 50 };
    }
    const response = await privateApi.get<SearchApiResponse>(
      `/search/${encodeURIComponent(query)}/${page}`
    );
    return response.data;
  },

  /**
   * Get all users (paginated, with optional search)
   * GET /api/user?q=&p=&l=
   */
  getAllUsers: async (params?: { q?: string; p?: number; l?: number }): Promise<SearchApiResponse> => {
    const response = await privateApi.get<SearchApiResponse>('/user', {
      params: {
        q: params?.q || '',
        p: params?.p || 1,
        l: params?.l || 1000,
      },
    });
    return response.data;
  },

  /**
   * Helper to extract users array from response
   */
  extractUsers: (response: SearchApiResponse): UserOption[] => {
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && 'users' in response.data && Array.isArray(response.data.users)) {
      return response.data.users;
    }
    return [];
  },

  /**
   * Create a new user (admin/HR only)
   * POST /api/user
   */
  createUser: async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
    division?: string;
    managerId?: string;
    companyId?: string;
    officeId?: string;
  }): Promise<{ success: boolean; message?: string; data?: UserOption }> => {
    const response = await privateApi.post('/user', userData);
    return response.data;
  },

  /**
   * Update an existing user (admin/HR only)
   * PATCH /api/user/:id
   */
  updateUser: async (id: string, userData: Partial<{
    name: string;
    email: string;
    role: string;
    phone: string;
    division: string;
    managerId: string;
    companyId: string;
    officeId: string;
  }>): Promise<{ success: boolean; message?: string; data?: UserOption }> => {
    const response = await privateApi.patch(`/user/${id}`, userData);
    return response.data;
  },

  /**
   * Delete a user (admin/HR only)
   * DELETE /api/user/:id
   */
  deleteUser: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const response = await privateApi.delete(`/user/${id}`);
    return response.data;
  },

  /**
   * Get user detail with LeaveBalance
   * GET /api/user/:id
   * 
   * NOTE: Backend sendResponse() spreads the user object at root level,
   * so user fields (id, name, etc.) are alongside success/message,
   * NOT nested under a "data" key.
   */
  getUserById: async (id: string): Promise<UserWithBalance & { success: boolean; message?: string }> => {
    const response = await privateApi.get(`/user/${id}`);
    // Backend returns user fields directly at root level
    return response.data as UserWithBalance & { success: boolean; message?: string };
  },
};

export default userApi;
