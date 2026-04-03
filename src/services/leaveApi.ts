import axios from 'axios';
import { privateApi } from './authApi';
import type { CreateLeaveInput, Leave, ApiResponse } from '@/shared/types/leave';

export type LeaveTargetUser = { id: string; name: string; email: string };

/** GET /user — dipakai untuk memilih pemohon saat HR/Admin mengajukan untuk karyawan lain */
async function fetchAllUsersForLeaveTarget(): Promise<LeaveTargetUser[]> {
  const all: LeaveTargetUser[] = [];
  let page = 1;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    const response = await privateApi.get('/user', { params: { page, limit } });
    const raw = response.data as {
      data?: unknown[];
      total?: number;
    };
    const users = Array.isArray(raw.data)
      ? raw.data
      : Array.isArray(response.data)
        ? (response.data as unknown[])
        : [];
    const total = typeof raw.total === 'number' ? raw.total : users.length;

    for (const u of users as Array<{ id: string; name: string; email: string }>) {
      if (u?.id && u?.name) {
        all.push({ id: u.id, name: u.name, email: u.email ?? '' });
      }
    }

    const fetchedCount = page * limit;
    hasMore = fetchedCount < total && users.length === limit;
    page += 1;
  }

  return all;
}

function apiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.message;
    if (typeof msg === 'string' && msg.trim()) return msg;
    if (err.response?.status === 403) return 'Akses ditolak. Anda tidak memiliki izin.';
    if (err.response?.status === 409) return 'Sudah ada data absensi untuk tanggal tersebut.';
    if (err.response?.status === 400) return 'Data tidak valid. Periksa kembali formulir.';
  }
  if (err instanceof Error) return err.message;
  return 'Terjadi kesalahan';
}

export { apiErrorMessage as leaveApiErrorMessage };

/**
 * Leave API — sesuai dokumentasi backend (baris Attendance + leaveStatus).
 *
 * - GET /api/leave — daftar (scope oleh role di server)
 * - POST /api/leave — ajukan izin (sendiri atau ADMIN/HR dengan targetUserId)
 * - PATCH /api/leave/:id/approve — ADMIN, HR
 * - PATCH /api/leave/:id/reject — ADMIN, HR
 */
export const leaveApi = {
  /**
   * Daftar pengajuan izin (array Attendance dengan relasi user ringkas).
   */
  getList: async (): Promise<Leave[]> => {
    const response = await privateApi.get<ApiResponse<Leave[]>>('/leave');
    const body = response.data;
    if (!body.success) {
      throw new Error(body.message || 'Gagal mengambil daftar izin');
    }
    const raw = body.data;
    return Array.isArray(raw) ? raw : [];
  },

  /** Daftar user (perusahaan) untuk dropdown HR/Admin — pemohon alternatif */
  getUsersForLeaveTarget: (): Promise<LeaveTargetUser[]> => fetchAllUsersForLeaveTarget(),

  /**
   * Mengajukan izin untuk satu tanggal.
   * Tanpa targetUserId: pemohon = user dari token.
   * Dengan targetUserId (ADMIN/HR): pemohon = karyawan tersebut.
   */
  create: async (input: CreateLeaveInput): Promise<Leave> => {
    const body: Record<string, unknown> = {
      date: input.date,
      status: input.status,
      leaveReason: input.leaveReason,
    };
    if (input.leaveFileUrl != null && input.leaveFileUrl !== '') {
      body.leaveFileUrl = input.leaveFileUrl;
    }
    if (input.targetUserId?.trim()) {
      body.targetUserId = input.targetUserId.trim();
    } else if (input.userId?.trim()) {
      body.userId = input.userId.trim();
    }

    const response = await privateApi.post<ApiResponse<Leave>>('/leave', body);
    const resBody = response.data;
    if (!resBody.success) {
      throw new Error(resBody.message || 'Gagal mengajukan izin');
    }
    return resBody.data;
  },

  approve: async (id: string): Promise<Leave> => {
    const response = await privateApi.patch<ApiResponse<Leave>>(`/leave/${id}/approve`, {});
    const body = response.data;
    if (!body.success) {
      throw new Error(body.message || 'Gagal menyetujui izin');
    }
    return body.data;
  },

  reject: async (id: string): Promise<Leave> => {
    const response = await privateApi.patch<ApiResponse<Leave>>(`/leave/${id}/reject`, {});
    const body = response.data;
    if (!body.success) {
      throw new Error(body.message || 'Gagal menolak izin');
    }
    return body.data;
  },
};

export default leaveApi;
