import type { Schedule } from '@/shared/types/schedule';
import {
  getScheduleAssigneeDisplay,
  scheduleKindLabel,
  scheduleTypeLabel,
  formatScheduleStatus,
} from '@/features/schedule/utils/scheduleHelpers';

/** Escape nilai CSV: bungkus kutip, ganti newline/quote di dalamnya. */
function cell(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value);
  return `"${s.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
}

function downloadCsv(headers: string[], rows: string[][], filename: string) {
  const csvContent = [
    headers.map(cell).join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export jadwal yang dibaca manusia: tanpa id internal/user, tanpa email.
 * Kolom: tanggal, jam, jenis, penugasan, lokasi, alamat, status, tipe, durasi, deskripsi, catatan.
 */
export function exportSchedulesToCSV(schedules: Schedule[], filename = 'jadwal') {
  const headers = [
    'Tanggal',
    'Mulai',
    'Selesai',
    'Durasi (menit)',
    'Jenis',
    'Tipe Pekerjaan',
    'Penugasan',
    'Lokasi',
    'Alamat',
    'Status',
    'Deskripsi',
    'Catatan',
  ];

  const rows = schedules.map((schedule) => {
    const duration = Math.floor(
      (new Date(schedule.endTime).getTime() - new Date(schedule.startTime).getTime()) /
        (1000 * 60)
    );
    const assignee = getScheduleAssigneeDisplay(schedule);

    return [
      cell(formatDateId(schedule.date)),
      cell(formatTimeId(schedule.startTime)),
      cell(formatTimeId(schedule.endTime)),
      cell(duration),
      cell(scheduleKindLabel(assignee.kind)),
      cell(scheduleTypeLabel(schedule.scheduleType)),
      cell(assignee.name),
      cell(schedule.location?.name || ''),
      cell(schedule.location?.address || ''),
      cell(formatScheduleStatus(schedule.status)),
      cell(schedule.description || ''),
      cell(schedule.notes || ''),
    ];
  });

  downloadCsv(headers, rows, filename);
}

function formatDateId(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' });
}

function formatTimeId(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  });
}

export function exportLocationsToCSV(
  locations: Array<{
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    radius?: number;
    description?: string;
    isActive: boolean;
    createdAt: string;
  }>,
  filename = 'locations'
) {
  const headers = [
    'ID',
    'Name',
    'Address',
    'Latitude',
    'Longitude',
    'Radius (m)',
    'Description',
    'Status',
    'Created At',
  ];

  const rows = locations.map((loc) => [
    loc.id,
    `"${loc.name}"`,
    `"${loc.address}"`,
    loc.latitude,
    loc.longitude,
    loc.radius || 50,
    `"${loc.description || ''}"`,
    loc.isActive ? 'Active' : 'Inactive',
    new Date(loc.createdAt).toLocaleString('id-ID'),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
