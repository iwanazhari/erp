export interface Attendance {
  id: string;
  companyId: string;
  userId: string;
  name: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: "Present" | "Late" | "Absent";
}

export interface AttendanceFilters {
  search: string;
  date: string;
  status: string;
}

export interface AttendanceSummary {
  present: number;
  late: number;
  absent: number;
  total: number;
}

export interface AttendanceQueryParams {
  page: number;
  limit: number;
  search?: string;
  date?: string;
  status?: string;
  sort?: string; // Unified: "date_desc", "name_asc", etc.
}

export interface AttendanceResponse {
  data: Attendance[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type UserRole = "admin" | "supervisor" | "technician";

export interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Permission {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
}
