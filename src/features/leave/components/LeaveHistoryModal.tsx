import type { LeaveEditHistoryData } from '@/shared/types/leave';

type Props = {
  history: LeaveEditHistoryData | null;
  isOpen: boolean;
  onClose: () => void;
};

/**
 * Leave Edit History Modal Component
 *
 * Displays audit trail of leave request changes
 */
export default function LeaveHistoryModal({
  history,
  isOpen,
  onClose,
}: Props) {
  // Format datetime to Indonesian format
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format field name for display
  const formatFieldName = (field: string) => {
    const labels: Record<string, string> = {
      status: 'Tipe Cuti',
      leaveReason: 'Alasan Cuti',
      leaveFileUrl: 'Dokumen',
      leaveStatus: 'Status Approval',
      date: 'Tanggal',
      approvedBy: 'Disetujui Oleh',
      approvedAt: 'Disetujui Pada',
    };
    return labels[field] || field;
  };

  if (!isOpen || !history) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Edit History</h2>
              <p className="text-sm text-purple-100 mt-1">
                Audit trail perubahan leave request
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Leave Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Karyawan</p>
                <p className="text-base font-semibold text-gray-900">{history.user.name}</p>
                <p className="text-sm text-gray-600">{history.user.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Leave ID</p>
                <p className="text-xs font-mono text-gray-700">{history.leaveId}</p>
              </div>
            </div>
          </div>

          {/* Current Edit Info */}
          {history.currentEditInfo && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-2">Edit Terakhir</p>
              <div className="space-y-1 text-sm text-blue-800">
                <p>Diedit oleh: <span className="font-medium">{history.currentEditInfo.editedBy}</span></p>
                <p>Alasan: <span className="italic">{history.currentEditInfo.editReason}</span></p>
              </div>
            </div>
          )}

          {/* Edit History Timeline */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Perubahan</h3>
            
            {history.editHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Belum ada riwayat perubahan</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.editHistory.map((edit, index) => (
                  <div key={index} className="relative pl-8 border-l-2 border-purple-300">
                    {/* Timeline dot */}
                    <div className="absolute -left-2 top-0 w-4 h-4 bg-purple-600 rounded-full border-2 border-white" />
                    
                    {/* Edit info */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold text-gray-900">
                          {edit.editedBy.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDateTime(edit.editedAt)}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-600 mb-2">
                        <span className="font-medium">Role:</span> {edit.editedBy.role}
                      </div>
                      
                      <div className="text-sm text-gray-700 mb-3">
                        <span className="font-medium">Alasan:</span> {edit.reason}
                      </div>
                      
                      {/* Changes */}
                      {Object.entries(edit.changes).map(([field, change]) => (
                        <div key={field} className="text-sm bg-white rounded p-2 mb-2 border border-gray-200">
                          <div className="font-medium text-gray-700 mb-1">
                            {formatFieldName(field)}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-red-600 bg-red-50 px-2 py-1 rounded">
                              {change.old || '(none)'}
                            </span>
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                            <span className="text-green-600 bg-green-50 px-2 py-1 rounded">
                              {change.new || '(none)'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
