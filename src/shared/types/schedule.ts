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

/** Satu jadwal hanya salah satu: teknisi lapangan atau sales (backend). */
export type ScheduleKind = 'TECHNICIAN' | 'SALES';

export interface ScheduleParticipant {
  userId?: string;
  role?: string;
  user?: Pick<Technician, 'id' | 'name' | 'email'> & { role?: string };
}

export interface Schedule {
  id: string;
  scheduleKind?: ScheduleKind;
  /** Untuk jadwal SALES biasanya `null` (legacy/API lama bisa masih mengisi). */
  technicianId?: string | null;
  technician?: Technician | null;
  participants?: ScheduleParticipant[];
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
  cancellationReason?: string;
  attendances?: Array<{
    id: string;
    userId: string;
    date: string;
    clockIn: string;
    clockOut: string;
    status: string;
    sessionNumber?: number;
    latitudeIn?: number;
    longitudeIn?: number;
    latitudeOut?: number;
    longitudeOut?: number;
    selfieUrlIn?: string;
    selfieUrlOut?: string;
  }>;
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

/**
 * Create: **salah satu** kelompok assignee (XOR):
 * - `technicianId` atau `technicianIds` (tanpa `salesIds`), atau
 * - `salesIds` minimal satu (tanpa `technicianId` / `technicianIds`).
 */
export interface CreateScheduleInput {
  technicianId?: string;
  technicianIds?: string[];
  salesIds?: string[];
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
  technicianIds?: string[];
  salesIds?: string[];
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
  /** Filter daftar: hanya jadwal teknisi atau hanya jadwal sales */
  scheduleKind?: ScheduleKind;
  technicianId?: string;
  locationId?: string;
  status?: ScheduleStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  pageSize?: number;
}

export interface LocationFilters {
  companyId?: string;
  officeId?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// Google Maps URL Parser Types
export interface ParseMapsUrlRequest {
  url: string;
}

export interface ParseMapsUrlResponse {
  success: boolean;
  data: {
    latitude: number;
    longitude: number;
    cached: boolean;
    expandedUrl?: string;
  };
  error?: string;
}
