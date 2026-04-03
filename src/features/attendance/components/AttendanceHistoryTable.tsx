import type { AttendanceRecord } from '@/shared/types/attendance';
import { isClockInLateFromIso } from '@/utils/attendanceCheckIn';

interface AttendanceHistoryTableProps {
  attendances: AttendanceRecord[];
  isLoading?: boolean;
  onViewDetails?: (record: AttendanceRecord) => void;
}

export function AttendanceHistoryTable({
  attendances,
  isLoading,
  onViewDetails,
}: AttendanceHistoryTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /** Palet dibatasi: netral + indigo (info) + emerald/amber/merah untuk makna jelas */
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      present: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80',
      late: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200/80',
      leave: 'bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200/80',
      absent: 'bg-red-50 text-red-800 ring-1 ring-red-200/80',
      HADIR: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80',
      TERLAMBAT: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200/80',
      ALPA: 'bg-red-50 text-red-800 ring-1 ring-red-200/80',
      IZIN: 'bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200/80',
      SAKIT: 'bg-slate-100 text-slate-800 ring-1 ring-slate-200/80',
      TECHNICIAN_CHECKED_IN: 'bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200/80',
      TECHNICIAN_AT_JOB_SITE: 'bg-slate-100 text-slate-800 ring-1 ring-slate-200/80',
    };
    return colors[status] || 'bg-slate-100 text-slate-700 ring-1 ring-slate-200/80';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      present: 'Hadir',
      late: 'Terlambat',
      leave: 'Cuti',
      absent: 'Tidak Hadir',
      HADIR: 'Hadir',
      TERLAMBAT: 'Terlambat',
      ALPA: 'Alpa',
      IZIN: 'Izin',
      SAKIT: 'Sakit',
      TECHNICIAN_CHECKED_IN: 'Check-in',
      TECHNICIAN_AT_JOB_SITE: 'Di Lokasi',
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="mt-2 text-sm text-slate-600">Memuat data attendance...</p>
      </div>
    );
  }

  if (!attendances || attendances.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="h-12 w-12 text-slate-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-2 text-sm text-slate-600">Tidak ada data attendance</p>
      </div>
    );
  }

  // Render Daily Attendance Table
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50/90">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              Karyawan
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              Tanggal
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              Clock In
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              Clock Out
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              Kantor
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {attendances.map((record) => (
            <tr key={record.id} className="transition-colors hover:bg-slate-50/80">
              <td className="px-4 py-3 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    {record.user.name}
                  </div>
                  <div className="text-sm text-slate-500">
                    {record.user.email}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-800">
                {formatDate(record.clockIn)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-800">
                <div className="flex items-center gap-2">
                  <span
                    className={
                      isClockInLateFromIso(record.clockIn)
                        ? 'font-semibold text-red-600'
                        : 'font-medium text-emerald-700'
                    }
                  >
                    {formatTime(record.clockIn)}
                  </span>
                  {record.latitudeIn && record.longitudeIn && (
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-800">
                <div className="flex items-center gap-2">
                  <span>{record.clockOut ? formatTime(record.clockOut) : '-'}</span>
                  {record.latitudeOut && record.longitudeOut && (
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(record.status)}`}>
                  {getStatusLabel(record.status)}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                {record.office?.name || '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                <button
                  type="button"
                  onClick={() => onViewDetails?.(record)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Lihat detail
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AttendanceHistoryTable;
