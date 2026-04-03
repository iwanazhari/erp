// Leave / izin — baris Attendance dengan leaveStatus (backend Worksy)

/** Nilai status absensi untuk baris pengajuan izin (sesuai enum backend) */
export type AttendanceStatus =
  | 'HADIR'
  | 'TERLAMBAT'
  | 'ALPA'
  | 'IZIN'
  | 'SAKIT'
  | 'TECHNICIAN_CHECKED_IN'
  | 'TECHNICIAN_AT_JOB_SITE'
  | string;

export type LeaveApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/** User ringkas pada GET /api/leave */
export interface LeaveUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

/**
 * Satu pengajuan izin = satu baris Attendance dengan leaveStatus terisi.
 * Field tambahan (lokasi, teknisi, …) boleh ada sesuai model server.
 */
export interface Leave {
  id: string;
  userId: string;
  date: string;
  sessionId?: string;
  sessionNumber?: number;
  status: AttendanceStatus;
  leaveReason: string;
  leaveFileUrl: string | null;
  leaveStatus: LeaveApprovalStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  user: LeaveUser;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Body POST /api/leave
 * - Tanpa `targetUserId` / `userId`: pemohon = user dari token.
 * - **ADMIN / HR** boleh mengisi `targetUserId` (atau alias `userId`) untuk mengajukan atas nama karyawan lain (perusahaan harus sama).
 */
export interface CreateLeaveInput {
  date: string;
  status: 'IZIN' | 'SAKIT';
  leaveReason: string;
  leaveFileUrl?: string | null;
  /** Hanya ADMIN/HR — UUID karyawan yang diajukan izinnya */
  targetUserId?: string;
  /** Alias backend untuk `targetUserId` — jangan isi keduanya dengan nilai berbeda */
  userId?: string;
}

/** Filter & paginasi di klien (GET /api/leave tidak memakai query di dokumentasi) */
export interface LeaveFilters {
  page?: number;
  pageSize?: number;
  status?: LeaveApprovalStatus;
  /** Filter ke status absensi baris (IZIN / SAKIT) */
  type?: AttendanceStatus;
  startDate?: string;
  endDate?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: unknown;
}

// --- Komponen modal lama (edit/history) — tidak dipakai alur API terbaru ---

export type LeaveStatus = 'IZIN' | 'SAKIT' | 'ALPA';

export interface LeaveEditHistory {
  editedAt: string;
  editedBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  reason: string;
  changes: Record<string, { old: unknown; new: unknown }>;
}

export interface LeaveEditInfo {
  editedAt: string;
  editedBy: string;
  editReason: string;
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
