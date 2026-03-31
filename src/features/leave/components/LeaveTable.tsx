import type { Leave } from '@/shared/types/leave';

type Props = {
  leaves: Leave[];
  isLoading?: boolean;
  onViewDetails?: (leave: Leave) => void;
  onEdit?: (leave: Leave) => void;
  onDelete?: (leave: Leave) => void;
  onViewHistory?: (leave: Leave) => void;
};

/**
 * Leave Table Component
 *
 * Displays leave requests in a table format
 */
export default function LeaveTable({
  leaves,
  isLoading,
  onViewDetails,
  onEdit,
  onDelete,
  onViewHistory,
}: Props) {
  // Format date to Indonesian format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get type badge color
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      IZIN: 'bg-blue-100 text-blue-800',
      SAKIT: 'bg-purple-100 text-purple-800',
      ALPA: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex border-b border-gray-200">
              <div className="flex-1 p-4">
                <div className="h-4 bg-gray-200 rounded" />
              </div>
              <div className="w-32 p-4">
                <div className="h-4 bg-gray-200 rounded" />
              </div>
              <div className="w-32 p-4">
                <div className="h-4 bg-gray-200 rounded" />
              </div>
              <div className="w-48 p-4">
                <div className="h-4 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!leaves || leaves.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-12 text-center text-gray-500">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium">Tidak ada data leave</p>
          <p className="text-sm mt-1">Coba sesuaikan filter Anda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">
                Karyawan
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">
                Tipe
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">
                Tanggal
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">
                Alasan
              </th>
              <th className="px-6 py-3 text-center font-semibold text-gray-700">
                Status
              </th>
              <th className="px-6 py-3 text-center font-semibold text-gray-700">
                Dokumen
              </th>
              <th className="px-6 py-3 text-center font-semibold text-gray-700">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leaves.map((leave) => (
              <tr
                key={leave.id}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Employee */}
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">
                      {leave.user.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {leave.user.email}
                    </div>
                  </div>
                </td>

                {/* Type */}
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(leave.status)}`}>
                    {leave.status}
                  </span>
                </td>

                {/* Date */}
                <td className="px-6 py-4 text-gray-700">
                  {formatDate(leave.date)}
                </td>

                {/* Reason */}
                <td className="px-6 py-4">
                  <p className="text-gray-700 truncate max-w-xs" title={leave.leaveReason}>
                    {leave.leaveReason}
                  </p>
                </td>

                {/* Approval Status */}
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(leave.leaveStatus)}`}>
                    {leave.leaveStatus}
                  </span>
                </td>

                {/* Document */}
                <td className="px-6 py-4 text-center">
                  {leave.leaveFileUrl ? (
                    <a
                      href={leave.leaveFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                      title="Lihat dokumen"
                    >
                      <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {/* View Details */}
                    <button
                      onClick={() => onViewDetails?.(leave)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Lihat Detail"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onEdit?.(leave)}
                      className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                      title="Edit Leave"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    {/* View History */}
                    <button
                      onClick={() => onViewHistory?.(leave)}
                      className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                      title="Lihat History"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDelete?.(leave)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Hapus Leave"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
