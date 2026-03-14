// Attendance Types based on Backend API Documentation

export type AttendanceStatus = 'present' | 'late' | 'leave' | 'absent';
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
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceHistoryData {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  records: AttendanceRecord[];
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

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
