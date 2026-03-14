import type { AttendanceRecord } from '@/shared/types/attendance';

interface AttendanceDetailsModalProps {
  record: AttendanceRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AttendanceDetailsModal({
  record,
  isOpen,
  onClose,
}: AttendanceDetailsModalProps) {
  if (!isOpen || !record) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      present: 'bg-green-100 text-green-800 border-green-200',
      late: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      leave: 'bg-blue-100 text-blue-800 border-blue-200',
      absent: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      present: 'Hadir',
      late: 'Terlambat',
      leave: 'Cuti',
      absent: 'Tidak Hadir',
    };
    return labels[status] || status;
  };

  const googleMapsUrlIn = record.latitudeIn && record.longitudeIn
    ? `https://www.google.com/maps?q=${record.latitudeIn},${record.longitudeIn}`
    : null;

  const googleMapsUrlOut = record.latitudeOut && record.longitudeOut
    ? `https://www.google.com/maps?q=${record.latitudeOut},${record.longitudeOut}`
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Detail Attendance
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-4">
            {/* Employee Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Informasi Karyawan</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Nama:</span>
                  <p className="font-medium text-gray-900">{record.user.name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <p className="font-medium text-gray-900">{record.user.email}</p>
                </div>
                <div>
                  <span className="text-gray-500">Role:</span>
                  <p className="font-medium text-gray-900">{record.user.role}</p>
                </div>
              </div>
            </div>

            {/* Attendance Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Informasi Attendance</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Tanggal:</span>
                  <p className="font-medium text-gray-900">{formatDate(record.clockIn)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                    {getStatusLabel(record.status)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Clock In:</span>
                  <p className="font-medium text-gray-900">{formatTime(record.clockIn)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Clock Out:</span>
                  <p className="font-medium text-gray-900">
                    {record.clockOut ? formatTime(record.clockOut) : 'Belum clock out'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Clock Out Status:</span>
                  <p className="font-medium text-gray-900 capitalize">{record.clockOutStatus}</p>
                </div>
              </div>
            </div>

            {/* Office Info */}
            {record.office && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Informasi Kantor</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Nama Kantor:</span>
                    <p className="font-medium text-gray-900">{record.office.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Alamat:</span>
                    <p className="font-medium text-gray-900">{record.office.address}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Shift Start:</span>
                    <p className="font-medium text-gray-900">{record.office.shiftStart}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Toleransi Terlambat:</span>
                    <p className="font-medium text-gray-900">{record.office.lateToleranceMinutes} menit</p>
                  </div>
                </div>
              </div>
            )}

            {/* Location Info */}
            {(googleMapsUrlIn || googleMapsUrlOut) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Lokasi</h4>
                <div className="space-y-2 text-sm">
                  {googleMapsUrlIn && (
                    <div>
                      <span className="text-gray-500">Clock In Location:</span>
                      <a
                        href={googleMapsUrlIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-600 hover:text-blue-800 mt-1"
                      >
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Lihat di Google Maps
                        </div>
                      </a>
                    </div>
                  )}
                  {googleMapsUrlOut && (
                    <div>
                      <span className="text-gray-500">Clock Out Location:</span>
                      <a
                        href={googleMapsUrlOut}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-600 hover:text-blue-800 mt-1"
                      >
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Lihat di Google Maps
                        </div>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Selfie Photos */}
            {(record.selfieUrlIn || record.selfieUrlOut) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Foto Selfie</h4>
                <div className="grid grid-cols-2 gap-4">
                  {record.selfieUrlIn && (
                    <div>
                      <span className="text-gray-500 text-xs">Clock In</span>
                      <img
                        src={record.selfieUrlIn}
                        alt="Selfie Clock In"
                        className="mt-1 w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                  {record.selfieUrlOut && (
                    <div>
                      <span className="text-gray-500 text-xs">Clock Out</span>
                      <img
                        src={record.selfieUrlOut}
                        alt="Selfie Clock Out"
                        className="mt-1 w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Transaction (if exists) */}
            {record.paymentTransaction && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Transaction</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Transaction ID:</span>
                    <p className="font-medium text-gray-900">{record.paymentTransaction.transactionId}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <p className="font-medium text-gray-900 capitalize">{record.paymentTransaction.status}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttendanceDetailsModal;
