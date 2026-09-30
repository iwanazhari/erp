import type { AttendanceRecord } from '@/shared/types/attendance';
import { isClockInLateFromIso } from '@/utils/attendanceCheckIn';

type Props = {
  data: AttendanceRecord[];
  isLoading?: boolean;
  onViewDetails?: (record: AttendanceRecord) => void;
  onEdit?: (record: AttendanceRecord) => void;
  onDelete?: (record: AttendanceRecord) => void;
};

/**
 * Attendance Daily Table Component
 * 
 * Matches the screenshot design with:
 * - Red header bar
 * - Columns: No, Nama, Tgl, Jam Masuk, Jam Keluar, Bukti Absen
 * - Sunday (MINGGU) highlighted in red
 * - Check-in times in green
 * - Eye icon for viewing details
 */
export default function AttendanceDailyTable({
  data,
  isLoading,
  onViewDetails,
  onEdit,
  onDelete,
}: Props) {
  // Format date to Indonesian format: "1 Maret 2026"
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    });
  };

  // Format time to HH:MM
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta',
    });
  };

  // Check if date is Sunday (in WIB)
  const isSunday = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { weekday: 'long', timeZone: 'Asia/Jakarta' }) === 'Minggu';
  };

  // Get day name in Indonesian
  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { weekday: 'long', timeZone: 'Asia/Jakarta' }).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="animate-pulse">
          <div className="h-10 bg-red-600" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex border-b border-gray-200">
              <div className="w-16 p-4 border-r border-gray-200">
                <div className="h-5 bg-gray-200 rounded" />
              </div>
              <div className="flex-1 p-4 border-r border-gray-200">
                <div className="h-5 bg-gray-200 rounded" />
              </div>
              <div className="w-48 p-4 border-r border-gray-200">
                <div className="h-5 bg-gray-200 rounded" />
              </div>
              <div className="w-32 p-4 border-r border-gray-200">
                <div className="h-5 bg-gray-200 rounded" />
              </div>
              <div className="w-32 p-4 border-r border-gray-200">
                <div className="h-5 bg-gray-200 rounded" />
              </div>
              <div className="w-24 p-4">
                <div className="h-5 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="h-10 bg-red-600" />
        <div className="p-12 text-center text-gray-500">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Tidak ada data attendance
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      {/* Red Header Bar */}
      {/* 
       */}

      {/* Table */}
      
      <div className="overflow-x-auto">
        <table className="min-w-full text-base">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="px-6 py-3 text-center font-bold text-gray-700 border-r border-gray-300 w-16">
                No
              </th>
              <th className="px-6 py-3 text-left font-bold text-gray-700 border-r border-gray-300">
                Nama
              </th>
              <th className="px-6 py-3 text-left font-bold text-gray-700 border-r border-gray-300">
                Tgl
              </th>
              <th className="px-6 py-3 text-center font-bold text-gray-700 border-r border-gray-300 w-32">
                Jam Masuk
              </th>
              <th className="px-6 py-3 text-center font-bold text-gray-700 border-r border-gray-300 w-32">
                Jam Keluar
              </th>
              <th className="px-6 py-3 text-center font-bold text-gray-700 w-32">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((record, index) => {
              // Use record.date for users who haven't clocked in (BELUM_ABSEN)
              // Use record.clockIn for users who have clocked in
              const dateForDisplay = record.date || record.clockIn;
              const isWeekend = dateForDisplay ? isSunday(dateForDisplay) : false;
              const showDayName = isWeekend;

              return (
                <tr
                  key={record.id || record.userId}
                  className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                    isWeekend ? 'bg-red-50' : ''
                  }`}
                  onClick={() => onViewDetails?.(record)}
                >
                  {/* No */}
                  <td className="px-6 py-4 text-center border-r border-gray-200 text-gray-700 text-base">
                    {index + 1}
                  </td>

                  {/* Nama */}
                  <td className="px-6 py-4 border-r border-gray-200">
                    <div className="text-gray-700 font-semibold text-base">
                      {record.user.name}
                    </div>
                  </td>

                  {/* Tgl */}
                  <td className="px-6 py-4 border-r border-gray-200">
                    <div className="text-gray-700 text-base">
                      {dateForDisplay ? formatDate(dateForDisplay) : '-'}
                    </div>
                    {showDayName && (
                      <div className="text-sm text-red-600 font-bold mt-1">
                        {getDayName(dateForDisplay)}
                      </div>
                    )}
                  </td>

                  {/* Jam Masuk — warna mengikuti aturan 09:15 (sama seperti modal edit) */}
                  <td className="px-6 py-4 text-center border-r border-gray-200">
                    <div className="flex items-center justify-center gap-1.5">
                      {record.clockIn ? (
                        <span
                          className={`font-bold text-base ${
                            isClockInLateFromIso(record.clockIn) ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          {formatTime(record.clockIn)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-base">-</span>
                      )}
                      {record.latitudeIn && record.longitudeIn && (
                        <a
                          href={`https://www.google.com/maps?q=${record.latitudeIn},${record.longitudeIn}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Lihat lokasi check-in"
                        >
                          <svg className="h-4 w-4 text-blue-500 hover:text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Jam Keluar */}
                  <td className="px-6 py-4 text-center border-r border-gray-200">
                    <div className="flex items-center justify-center gap-1.5">
                      {record.clockOut ? (
                        <span className="text-gray-700 font-medium text-base">
                          {formatTime(record.clockOut)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-base">-</span>
                      )}
                      {record.latitudeOut && record.longitudeOut && (
                        <a
                          href={`https://www.google.com/maps?q=${record.latitudeOut},${record.longitudeOut}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Lihat lokasi check-out"
                        >
                          <svg className="h-4 w-4 text-red-500 hover:text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </td>
                  
                  {/* Aksi - Eye and Edit icons */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* Eye Icon - View Details */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails?.(record);
                        }}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                        title="Lihat Detail"
                      >
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      
                      {/* Edit Icon - Edit Attendance */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit?.(record);
                        }}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 hover:bg-amber-200 transition-colors"
                        title="Edit Attendance"
                      >
                        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      {/* Delete Icon - Delete Attendance */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.(record);
                        }}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
                        title="Hapus Attendance"
                      >
                        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
