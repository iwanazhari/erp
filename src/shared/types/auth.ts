// Authentication Types

export type UserRole = 'ADMIN' | 'HR' | 'MANAGER' | 'TECHNICIAN' | 'TECHNICIAN_PAYMENT' | 'SALES' | 'FINANCE' | string;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  companyId?: string;
  officeId?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
  deviceId?: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  companyId?: string;
  inviteCode?: string;
  deviceId?: string;
  latitude?: number;
  longitude?: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken?: string;
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export interface DeviceLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}
