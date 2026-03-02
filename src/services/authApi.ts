import axios from 'axios';
import type {
  LoginInput,
  RegisterInput,
  AuthResponse,
  RefreshTokenResponse,
  User,
} from '@/shared/types/auth';

const BASE_URL = import.meta.env.VITE_API_PUBLIC_URL || 'https://worksy-production.up.railway.app';

// Create axios instance for public routes (no /api prefix)
const publicApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for private routes (with /api prefix and auth token)
const privateApi = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to private API requests
privateApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
privateApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Try to refresh the token
        const response = await publicApi.post<RefreshTokenResponse>('/auth/token/refresh', {
          refreshToken,
        });

        // Handle flat or nested response structure
        let accessToken: string;
        let newRefreshToken: string;
        
        if ('data' in response.data && response.data.data) {
          accessToken = response.data.data.accessToken;
          newRefreshToken = response.data.data.refreshToken;
        } else {
          accessToken = (response.data as any).accessToken;
          newRefreshToken = (response.data as any).refreshToken;
        }

        // Store new tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return privateApi(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await publicApi.post('/login', data);
    const responseData = response.data as any;
    
    // Handle flat response structure from API
    if (responseData.accessToken && !responseData.data) {
      return {
        success: responseData.success,
        message: responseData.message,
        data: {
          user: responseData.user,
          accessToken: responseData.accessToken,
          refreshToken: responseData.refreshToken,
        },
      };
    }
    return responseData as AuthResponse;
  },

  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const response = await publicApi.post('/register', data);
    const responseData = response.data as any;
    
    // Handle flat response structure from API
    if (responseData.accessToken && !responseData.data) {
      return {
        success: responseData.success,
        message: responseData.message,
        data: {
          user: responseData.user,
          accessToken: responseData.accessToken,
          refreshToken: responseData.refreshToken,
        },
      };
    }
    return responseData as AuthResponse;
  },

  logout: async (): Promise<void> => {
    try {
      await privateApi.post('/auth/token/revoke');
    } catch (error) {
      // Ignore errors on logout
    }
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await publicApi.post<RefreshTokenResponse>('/auth/token/refresh', {
      refreshToken,
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<{ success: boolean; data: User }> => {
    const response = await privateApi.get<{ success: boolean; data: User }>('/profile');
    return response.data;
  },
};

export { publicApi, privateApi };
