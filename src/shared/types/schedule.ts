// Schedule and Location Types based on API Documentation

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'TECHNICIAN' | 'TECHNICIAN_PAYMENT' | 'ADMIN' | 'HR' | 'MANAGER' | string;
  phone?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius?: number;
  description?: string;
  isActive: boolean;
  companyId?: string;
  officeId?: string;
  company?: {
    id: string;
    name: string;
  };
  office?: {
    id: string;
    name: string;
  };
  _count?: {
    schedules: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  role: 'TECHNICIAN' | 'TECHNICIAN_PAYMENT' | string;
}

export type ScheduleStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Schedule {
  id: string;
  technician: Technician;
  location: Location;
  date: string;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
  description?: string;
  notes?: string;
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancelledBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationInput {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius?: number;
  description?: string;
  companyId?: string;
  officeId?: string;
  isActive?: boolean;
}

export interface UpdateLocationInput {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  description?: string;
  isActive?: boolean;
}

export interface CreateScheduleInput {
  technicianId: string;
  locationId?: string;
  locationName?: string;
  locationAddress?: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  notes?: string;
  companyId?: string;
  // Technician location coordinates (optional)
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface UpdateScheduleInput {
  technicianId?: string;
  locationId?: string;
  locationName?: string;
  locationAddress?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  status?: ScheduleStatus;
  description?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface AvailabilityData {
  technician: Technician;
  date: string;
  isAvailable: boolean;
  existingSchedules: Array<{
    id: string;
    startTime: string;
    endTime: string;
    location: {
      id: string;
      name: string;
    };
    status: ScheduleStatus;
  }>;
  availableSlots: Array<{
    startTime: string;
    endTime: string;
  }>;
  quotaUsed: number;
  quotaMax: number;
  quotaRemaining: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export interface BulkScheduleResult {
  success: boolean;
  message: string;
  created: Schedule[];
  failed: Array<{
    index: number;
    error: string;
    code: string;
  }>;
  summary: {
    total: number;
    created: number;
    failed: number;
  };
}

export interface ScheduleFilters {
  technicianId?: string;
  locationId?: string;
  status?: ScheduleStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface LocationFilters {
  companyId?: string;
  officeId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
