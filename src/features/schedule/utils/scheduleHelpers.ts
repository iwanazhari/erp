import type { Schedule, ScheduleKind, ScheduleStatus } from '@/shared/types/schedule';

export function resolveScheduleKind(schedule: Schedule): ScheduleKind {
  if (schedule.scheduleKind) return schedule.scheduleKind;
  if (schedule.technicianId || schedule.technician) return 'TECHNICIAN';
  return 'SALES';
}

/** Label utama baris jadwal: teknisi utama atau peserta sales (respons bisa campuran legacy + baru). */
export function getScheduleAssigneeDisplay(schedule: Schedule): {
  name: string;
  email?: string;
  kind: ScheduleKind;
} {
  const kind = resolveScheduleKind(schedule);
  if (kind === 'SALES') {
    // Get first sales participant for display
    const salesParticipants = schedule.participants?.filter(
      (p) => (p.role || p.user?.role || '').toUpperCase() === 'SALES'
    ) || [];
    
    const firstSales = salesParticipants[0];
    const name =
      firstSales?.user?.name ??
      (firstSales as { name?: string })?.name ??
      schedule.technician?.name ??
      `${salesParticipants.length} Sales`;
    const email =
      firstSales?.user?.email ?? (firstSales as { email?: string })?.email ?? schedule.technician?.email;
    return { name, email, kind: 'SALES' };
  }
  const t = schedule.technician;
  if (t) return { name: t.name, email: t.email, kind: 'TECHNICIAN' };
  const techP = schedule.participants?.find((p) => (p.role || '').toUpperCase() === 'TECHNICIAN');
  if (techP?.user) {
    return { name: techP.user.name, email: techP.user.email, kind: 'TECHNICIAN' };
  }
  return { name: '—', kind };
}

export function scheduleKindBadgeClasses(kind: ScheduleKind): string {
  return kind === 'TECHNICIAN'
    ? 'bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200/80'
    : 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80';
}

export function scheduleKindLabel(kind: ScheduleKind): string {
  return kind === 'TECHNICIAN' ? 'Teknisi' : 'Sales';
}

export function getPrimaryTechnicianIdFromSchedule(schedule: Schedule): string {
  if (schedule.technician?.id) return schedule.technician.id;
  const techP = schedule.participants?.find((p) => (p.role || '').toUpperCase() === 'TECHNICIAN');
  return techP?.user?.id ?? techP?.userId ?? '';
}

export function getPrimarySalesUserIdFromSchedule(schedule: Schedule): string {
  const salesP = schedule.participants?.find(
    (p) => (p.role || p.user?.role || '').toUpperCase() === 'SALES'
  );
  return salesP?.user?.id ?? salesP?.userId ?? schedule.technician?.id ?? '';
}

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
    PENDING: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200/80',
    ASSIGNED: 'bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200/80',
    IN_PROGRESS: 'bg-indigo-100 text-indigo-900 ring-1 ring-indigo-200/80',
    COMPLETED: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80',
    CANCELLED: 'bg-red-50 text-red-800 ring-1 ring-red-200/80',
  };
  return config[status] || 'bg-slate-100 text-slate-700 ring-1 ring-slate-200/80';
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
