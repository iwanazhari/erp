// Leave Management Types based on Backend API Documentation

export type LeaveStatus = 'IZIN' | 'SAKIT' | 'ALPA';
export type LeaveApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Leave {
  id: string;
  userId: string;
  date: string;
  status: LeaveStatus;
  leaveReason: string;
  leaveFileUrl: string;
  leaveStatus: LeaveApprovalStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  user: User;
  editedBy?: string | null;
  editedAt?: string | null;
  editReason?: string | null;
  editHistory?: LeaveEditHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface LeaveEditHistory {
  editedAt: string;
  editedBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  reason: string;
  changes: Record<string, {
    old: any;
    new: any;
  }>;
}

export interface LeaveEditInfo {
  editedAt: string;
  editedBy: string;
  editReason: string;
}

export interface LeaveData {
  leaves: Leave[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface LeaveEditHistoryData {
  leaveId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  currentEditInfo: LeaveEditInfo | null;
  editHistory: LeaveEditHistory[];
}

export interface LeaveFilters {
  page?: number;
  pageSize?: number;
  status?: LeaveApprovalStatus;
  type?: LeaveStatus;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateLeaveData {
  status?: LeaveStatus;
  leaveReason?: string;
  leaveFileUrl?: string;
  leaveStatus?: LeaveApprovalStatus;
  date?: string;
  editReason: string; // Required for audit trail
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
