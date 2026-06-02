import React, { useState } from 'react';
import Button from '@/components/ui/Button';

interface AttendanceRecord {
  id: string;
  clockIn: string;
  clockOut: string | null;
  status: string;
  clockOutStatus: string | null;
  latitudeIn: number | null;
  longitudeIn: number | null;
  latitudeOut: number | null;
  longitudeOut: number | null;
  jobLatitude: number | null;
  jobLongitude: number | null;
  selfieUrlIn: string | null;
  selfieUrlOut: string | null;
  jobCompletionPhotos: string[] | null;
  customerSignature: string | null;
  airWaterPhoto: string | null;
  workReport: string | null;
  leaveReason?: string | null;
  paymentAmount?: number | null;
  paymentStatus?: string | null;
}

interface ScheduleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: any;
  attendances: AttendanceRecord[];
}

type TabType = 'attendance' | 'work-result';

const ScheduleDetailModal: React.FC<ScheduleDetailModalProps> = ({
  isOpen,
  onClose,
  schedule,
  attendances,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('attendance');

  if (!isOpen || !schedule) return null;

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Jakarta',
    });
  };

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ASSIGNED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Detail Jadwal</h2>
            <p className="text-sm text-gray-500 mt-1">
              {formatDate(schedule.date)} • {schedule.location?.name || 'N/A'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'attendance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Catatan Kehadiran
            </button>
            <button
              onClick={() => setActiveTab('work-result')}
              className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'work-result'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📝 Hasil Kerja
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Schedule Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(schedule.status)}`}>
                {schedule.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Waktu Jadwal</p>
              <p className="text-sm font-medium text-gray-900">
                {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Lokasi</p>
              <p className="text-sm font-medium text-gray-900">{schedule.location?.name || '-'}</p>
              <p className="text-xs text-gray-500">{schedule.location?.address || ''}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Teknisi</p>
              <p className="text-sm font-medium text-gray-900">
                {schedule.technician?.name || schedule.participants?.find((p: any) => p.role === 'TECHNICIAN')?.user?.name || '-'}
              </p>
            </div>
          </div>

          {/* Attendance Tab Content */}
          {activeTab === 'attendance' && attendances && attendances.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Catatan Kehadiran</h3>
              <div className="space-y-4">
                {attendances.map((attendance, index) => (
                  <div key={attendance.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Sesi #{index + 1}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        attendance.status === 'HADIR' ? 'bg-green-100 text-green-800' :
                        attendance.status === 'TERLAMBAT' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {attendance.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Clock In</p>
                        <p className="text-sm font-medium text-gray-900">{formatTime(attendance.clockIn)}</p>
                        {attendance.latitudeIn && attendance.longitudeIn && (
                          <p className="text-xs text-gray-500 mt-1">
                            📍 {attendance.latitudeIn.toFixed(6)}, {attendance.longitudeIn.toFixed(6)}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Clock Out</p>
                        <p className="text-sm font-medium text-gray-900">{formatTime(attendance.clockOut)}</p>
                        {attendance.clockOutStatus && (
                          <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 mt-1 inline-block">
                            {attendance.clockOutStatus}
                          </span>
                        )}
                        {attendance.latitudeOut && attendance.longitudeOut && (
                          <p className="text-xs text-gray-500 mt-1">
                            📍 {attendance.latitudeOut.toFixed(6)}, {attendance.longitudeOut.toFixed(6)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Photos Grid */}
                    {(attendance.selfieUrlIn || attendance.selfieUrlOut || attendance.jobCompletionPhotos?.length || attendance.customerSignature || attendance.airWaterPhoto) && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-2">Foto Dokumentasi</p>
                        <div className="grid grid-cols-4 gap-2">
                          {attendance.selfieUrlIn && (
                            <div className="relative aspect-square">
                              <img
                                src={attendance.selfieUrlIn}
                                alt="Selfie In"
                                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                                onClick={() => attendance.selfieUrlIn && window.open(attendance.selfieUrlIn, '_blank')}
                              />
                              <span className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                                Selfie In
                              </span>
                            </div>
                          )}
                          {attendance.selfieUrlOut && (
                            <div className="relative aspect-square">
                              <img
                                src={attendance.selfieUrlOut}
                                alt="Selfie Out"
                                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                                onClick={() => attendance.selfieUrlOut && window.open(attendance.selfieUrlOut, '_blank')}
                              />
                              <span className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                                Selfie Out
                              </span>
                            </div>
                          )}
                          {attendance.jobCompletionPhotos?.map((photo, idx) => (
                            <div key={idx} className="relative aspect-square">
                              <img
                                src={photo}
                                alt={`Completion ${idx + 1}`}
                                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                                onClick={() => window.open(photo, '_blank')}
                              />
                              <span className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                                Kerja {idx + 1}
                              </span>
                            </div>
                          ))}
                          {attendance.customerSignature && (
                            <div className="relative aspect-square">
                              <img
                                src={attendance.customerSignature}
                                alt="Signature"
                                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                                onClick={() => attendance.customerSignature && window.open(attendance.customerSignature, '_blank')}
                              />
                              <span className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                                Tanda Tangan
                              </span>
                            </div>
                          )}
                          {attendance.airWaterPhoto && (
                            <div className="relative aspect-square">
                              <img
                                src={attendance.airWaterPhoto}
                                alt="Air Water"
                                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                                onClick={() => attendance.airWaterPhoto && window.open(attendance.airWaterPhoto, '_blank')}
                              />
                              <span className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                                Air
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work Result Tab Content */}
          {activeTab === 'work-result' && attendances && attendances.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hasil Kerja Teknisi</h3>
              <div className="space-y-4">
                {attendances.map((attendance, index) => (
                  <div key={attendance.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Sesi #{index + 1} - {formatTime(attendance.clockIn)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        attendance.status === 'HADIR' ? 'bg-green-100 text-green-800' :
                        attendance.status === 'TERLAMBAT' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {attendance.status}
                      </span>
                    </div>

                    {/* Work Report */}
                    {attendance.workReport ? (
                      <div className="mb-4 p-3 bg-white rounded border border-gray-200">
                        <p className="text-sm font-medium text-gray-700">📝 Laporan Kerja:</p>
                        <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{attendance.workReport}</p>
                      </div>
                    ) : (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                        ⚠️ Tidak ada laporan kerja
                      </div>
                    )}

                    {/* Payment Info */}
                    {(attendance.paymentAmount || attendance.paymentStatus) && (
                      <div className="mb-4 grid grid-cols-2 gap-4">
                        {attendance.paymentAmount && (
                          <div className="p-3 bg-white rounded border border-gray-200">
                            <p className="text-xs text-gray-500">💰 Pembayaran</p>
                            <p className="text-sm font-medium text-gray-900">
                              Rp {new Intl.NumberFormat('id-ID').format(attendance.paymentAmount)}
                            </p>
                          </div>
                        )}
                        {attendance.paymentStatus && (
                          <div className="p-3 bg-white rounded border border-gray-200">
                            <p className="text-xs text-gray-500">Status Pembayaran</p>
                            <span className={`text-sm font-medium ${
                              attendance.paymentStatus === 'PAID' ? 'text-green-600' :
                              attendance.paymentStatus === 'PENDING' ? 'text-yellow-600' :
                              'text-gray-600'
                            }`}>
                              {attendance.paymentStatus}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Photos Grid - Work Results Only */}
                    {(attendance.jobCompletionPhotos?.length || attendance.customerSignature || attendance.airWaterPhoto) && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">📸 Dokumentasi Hasil Kerja</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {attendance.jobCompletionPhotos?.map((photo, idx) => (
                            <div key={idx} className="relative aspect-square">
                              <img
                                src={photo}
                                alt={`Completion ${idx + 1}`}
                                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                                onClick={() => window.open(photo, '_blank')}
                              />
                              <span className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                                Foto {idx + 1}
                              </span>
                            </div>
                          ))}
                          {attendance.customerSignature && (
                            <div className="relative aspect-square">
                              <img
                                src={attendance.customerSignature}
                                alt="Customer Signature"
                                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                                onClick={() => attendance.customerSignature && window.open(attendance.customerSignature, '_blank')}
                              />
                              <span className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                                Tanda Tangan
                              </span>
                            </div>
                          )}
                          {attendance.airWaterPhoto && (
                            <div className="relative aspect-square">
                              <img
                                src={attendance.airWaterPhoto}
                                alt="Air Water Photo"
                                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                                onClick={() => attendance.airWaterPhoto && window.open(attendance.airWaterPhoto, '_blank')}
                              />
                              <span className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                                Air & Water
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Location Info */}
                    {(attendance.latitudeIn && attendance.longitudeIn) || (attendance.latitudeOut && attendance.longitudeOut) ? (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm font-medium text-blue-900">📍 Lokasi Kerja</p>
                        <div className="mt-2 text-xs text-blue-700 space-y-1">
                          {attendance.latitudeIn && attendance.longitudeIn && (
                            <p>Clock In: {attendance.latitudeIn.toFixed(6)}, {attendance.longitudeIn.toFixed(6)}</p>
                          )}
                          {attendance.latitudeOut && attendance.longitudeOut && (
                            <p>Clock Out: {attendance.latitudeOut.toFixed(6)}, {attendance.longitudeOut.toFixed(6)}</p>
                          )}
                          {attendance.jobLatitude && attendance.jobLongitude && (
                            <p>Lokasi Jadwal: {attendance.jobLatitude.toFixed(6)}, {attendance.jobLongitude.toFixed(6)}</p>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No attendance message */}
          {(!attendances || attendances.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Belum ada data kehadiran untuk jadwal ini</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetailModal;
