import type { AttendanceRecord } from '@/shared/types/attendance';

type Props = {
  data: AttendanceRecord[];
  isLoading?: boolean;
  onViewDetails?: (record: AttendanceRecord) => void;
  onEdit?: (record: AttendanceRecord) => void;
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
}: Props) {
  // Format date to Indonesian format: "1 Maret 2026"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('id-ID', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Format time to HH:MM
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Check if date is Sunday
  const isSunday = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDay() === 0;
  };

  // Get day name in Indonesian
  const getDayName = (dateString: string) => {
    const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
    const date = new Date(dateString);
    return days[date.getDay()];
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
              const isWeekend = isSunday(record.clockIn);
              const showDayName = isWeekend;
              
              return (
                <tr
                  key={record.id}
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
                      {formatDate(record.clockIn)}
                    </div>
                    {showDayName && (
                      <div className="text-sm text-red-600 font-bold mt-1">
                        {getDayName(record.clockIn)}
                      </div>
                    )}
                  </td>
                  
                  {/* Jam Masuk - Green color */}
                  <td className="px-6 py-4 text-center border-r border-gray-200">
                    <span className="text-green-600 font-bold text-base">
                      {formatTime(record.clockIn)}
                    </span>
                  </td>
                  
                  {/* Jam Keluar */}
                  <td className="px-6 py-4 text-center border-r border-gray-200">
                    {record.clockOut ? (
                      <span className="text-gray-700 font-medium text-base">
                        {formatTime(record.clockOut)}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-base">-</span>
                    )}
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
