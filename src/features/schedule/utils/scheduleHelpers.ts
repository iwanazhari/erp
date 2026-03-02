import type { ScheduleStatus } from '@/shared/types/schedule';

export function handleScheduleError(error: any): string {
  const errorCode = error.response?.data?.code;
  const message = error.response?.data?.message;

  const errorMap: Record<string, (data?: any) => string> = {
    VALIDATION: (data) => {
      const errors = data?.errors || [];
      return errors.map((e: any) => `${e.path}: ${e.message}`).join(', ');
    },
    UNAUTHORIZED: () => {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
      return 'Session expired. Redirecting to login...';
    },
    FORBIDDEN: () => {
      return 'Anda tidak memiliki izin untuk melakukan aksi ini.';
    },
    SCHEDULE_TIME_OVERLAP: (data) => {
      const overlaps = data?.meta?.overlappingSchedules || [];
      return `Jadwal bentrok dengan ${overlaps.length} jadwal lain.`;
    },
    TECHNICIAN_DAILY_QUOTA_EXCEEDED: (data) => {
      const { quotaMax } = data?.meta || {};
      return `Teknisi sudah mencapai batas maksimal ${quotaMax} lokasi per hari.`;
    },
    PAST_SCHEDULE_NOT_ALLOWED: () => {
      return 'Tidak dapat membuat jadwal di masa lalu.';
    },
    SCHEDULE_DURATION_TOO_SHORT: () => {
      return 'Durasi jadwal minimal 30 menit.';
    },
    SCHEDULE_DURATION_TOO_LONG: () => {
      return 'Durasi jadwal maksimal 8 jam.';
    },
    INVALID_TECHNICIAN_ROLE: () => {
      return 'Teknisi yang dipilih tidak memiliki role yang valid.';
    },
    SCHEDULE_CANNOT_BE_CANCELLED: () => {
      return 'Jadwal sudah selesai atau dibatalkan.';
    },
    SCHEDULE_CANNOT_BE_MODIFIED: () => {
      return 'Jadwal yang sudah selesai tidak dapat diubah.';
    },
    LOCATION_HAS_ACTIVE_SCHEDULES: () => {
      return 'Lokasi memiliki jadwal aktif dan tidak dapat dihapus.';
    },
    TECHNICIAN_NOT_FOUND: () => {
      return 'Teknisi tidak ditemukan.';
    },
    LOCATION_NOT_FOUND: () => {
      return 'Lokasi tidak ditemukan.';
    },
    SCHEDULE_NOT_FOUND: () => {
      return 'Jadwal tidak ditemukan.';
    },
  };

  if (errorCode && errorMap[errorCode]) {
    return errorMap[errorCode](error.response?.data);
  }

  return message || 'Terjadi kesalahan. Silakan coba lagi.';
}

export function getStatusColor(status: ScheduleStatus): string {
  const colors: Record<ScheduleStatus, string> = {
    PENDING: '#FFA500',
    ASSIGNED: '#2196F3',
    IN_PROGRESS: '#9C27B0',
    COMPLETED: '#4CAF50',
    CANCELLED: '#F44336',
  };
  return colors[status] || '#757575';
}

export function getStatusBadgeClasses(status: ScheduleStatus): string {
  const config: Record<ScheduleStatus, string> = {
    PENDING: 'bg-amber-50 text-amber-600',
    ASSIGNED: 'bg-blue-50 text-blue-600',
    IN_PROGRESS: 'bg-purple-50 text-purple-600',
    COMPLETED: 'bg-emerald-50 text-emerald-600',
    CANCELLED: 'bg-red-50 text-red-600',
  };
  return config[status] || 'bg-slate-100 text-slate-600';
}

export function formatScheduleTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatScheduleDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function calculateDuration(startTime: string, endTime: string): { hours: number; minutes: number } {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  return {
    hours: Math.floor(diffMins / 60),
    minutes: diffMins % 60,
  };
}
