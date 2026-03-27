// Attendance Types based on Backend API Documentation

export type AttendanceStatus = 'present' | 'late' | 'leave' | 'absent' | 'HADIR' | 'TERLAMBAT' | 'ALPA' | 'IZIN' | 'SAKIT' | 'TECHNICIAN_CHECKED_IN' | 'TECHNICIAN_AT_JOB_SITE';
export type ClockOutStatus = 'completed' | 'pending';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  isActive?: boolean;
}

export interface Company {
  id: string;
  name: string;
}

export interface Office {
  id: string;
  name: string;
  address: string;
  shiftStart: string;
  lateToleranceMinutes: number;
}

export interface PaymentTransaction {
  id: string;
  transactionId: string;
  status: string;
}

export interface Photo {
  id: string;
  url: string;
  type: string;
  timestamp: string;
}

export interface LeaveInfo {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  clockIn: string;
  clockOut: string;
  status: AttendanceStatus;
  clockOutStatus: ClockOutStatus;
  latitudeIn: number;
  longitudeIn: number;
  latitudeOut: number;
  longitudeOut: number;
  selfieUrlIn: string;
  selfieUrlOut: string;
  user: User;
  company: Company;
  office: Office;
  paymentTransaction: PaymentTransaction | null;
  photos?: Photo[];
  leaveInfo?: LeaveInfo;
  createdAt: string;
  updatedAt: string;
}

/**
 * Attendance History Response Format (GET /api/attendance/history)
 * Uses 'attendances' array and 'pagination' object
 */
export interface AttendanceHistoryData {
  attendances: AttendanceRecord[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Attendance Records Response Format (GET /api/attendance/records)
 * Admin endpoint - includes comprehensive data with photos, leave info, etc.
 */
export interface AttendanceRecordsData {
  records: AttendanceRecord[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Monthly Attendance User Record (new format from backend)
export interface MonthlyAttendanceUser {
  userId: string;
  name: string;
  email: string;
  role: string;
  counts: {
    HADIR: number;
    TERLAMBAT: number;
    ALPA: number;
    IZIN: number;
    SAKIT: number;
    TECHNICIAN_CHECKED_IN: number;
    TECHNICIAN_AT_JOB_SITE: number;
  };
  lastClockIn: string | null;
  lastClockOut: string | null;
}

export interface MonthlyAttendanceData {
  year: number;
  month: number;
  page: number;
  pageSize: number;
  totalUsers: number;
  totalPages: number;
  users: MonthlyAttendanceUser[];
}

export interface UserAttendanceStats {
  userId: string;
  totalPresent: number;
  totalLate: number;
  totalLeave: number;
  totalAbsent: number;
  totalWorkingDays: number;
  attendanceRate: number;
  averageClockIn: string;
  averageClockOut: string;
}

export interface MonthlyAttendance {
  userId: string;
  userName: string;
  email: string;
  month: number;
  year: number;
  totalPresent: number;
  totalLate: number;
  totalLeave: number;
  totalAbsent: number;
  totalWorkingDays: number;
  attendanceRate: number;
}

export interface AttendanceHistoryFilters {
  companyId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
  clockOutStatus?: ClockOutStatus;
  page?: number;
  pageSize?: number;
}

export interface AttendanceRecordsFilters {
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
  clockOutStatus?: ClockOutStatus;
  page?: number;
  pageSize?: number;
}

export interface AttendanceStatsFilters {
  startDate?: string;
  endDate?: string;
}

export interface MonthlyAttendanceFilters {
  month?: number;
  year?: number;
  companyId?: string;
}

// Excel Export Filter Types
export interface MonthlyReportExportFilters {
  year?: number;
  month?: number;
  q?: string; // Search by name/email
}

export interface HistoryExportFilters {
  startDate?: string;
  endDate?: string;
  userId?: string;
  status?: AttendanceStatus;
}

export interface AllRecordsExportFilters {
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
  clockOutStatus?: ClockOutStatus;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
