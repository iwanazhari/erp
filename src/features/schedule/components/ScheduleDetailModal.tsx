import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import ModalShell from '@/components/ui/ModalShell';
import { resolveBackendUrl } from '@/utils/resolveBackendUrl';
import WorkResultEditModal from './WorkResultEditModal';
import WorkResultCreateModal from './WorkResultCreateModal';
import TechnicianScheduleForm from './TechnicianScheduleForm';
import DeleteScheduleModal from './DeleteScheduleModal';
import CancelScheduleModal from './CancelScheduleModal';
import { useUser } from '@/shared/UserContext';
import { useUpdateSchedule, useDeleteSchedule, useCancelSchedule } from '../hooks/useSchedules';
import { useToast } from '@/components/ui/ToastContext';
import { handleScheduleError } from '../utils/scheduleHelpers';
import { scheduleApi } from '@/services/scheduleApi';
import type { UpdateScheduleInput } from '@/shared/types/schedule';

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
  jobCompletionPhotos: string | string[] | null;
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
  onAttendanceUpdated?: () => void;
  onScheduleUpdated?: () => void;
}

type TabType = 'attendance' | 'work-result';

const parseJobCompletionPhotos = (photos: string | string[] | null | undefined): string[] => {
  if (!photos) return [];
  if (Array.isArray(photos)) return photos;
  if (typeof photos === 'string') {
    try {
      const parsed = JSON.parse(photos);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [photos];
    }
  }
  return [];
};

const ScheduleDetailModal: React.FC<ScheduleDetailModalProps> = ({
  isOpen,
  onClose,
  schedule,
  attendances,
  onAttendanceUpdated,
  onScheduleUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('attendance');
  const [editAttendance, setEditAttendance] = useState<AttendanceRecord | null>(null);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeletingModal, setIsDeletingModal] = useState(false);
  const [isCreatingWorkResult, setIsCreatingWorkResult] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const { canEditSchedule, canDeleteSchedule } = useUser();
  const toast = useToast();
  const updateMutation = useUpdateSchedule();
  const deleteMutation = useDeleteSchedule();
  const cancelMutation = useCancelSchedule();

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

  const isCompleted = schedule.status === 'COMPLETED';

  const canModify = schedule.status !== 'COMPLETED' && schedule.status !== 'CANCELLED';

  const handleSubmitEdit = async (data: UpdateScheduleInput) => {
    try {
      await updateMutation.mutateAsync({ scheduleId: schedule.id, data });
      toast.success('Jadwal berhasil diperbarui!');
      setMode('view');
      onScheduleUpdated?.();
    } catch (error) {
      toast.error(handleScheduleError(error));
      throw error;
    }
  };

  const handleConfirmCancel = async () => {
    try {
      await cancelMutation.mutateAsync(schedule.id);
      toast.success('Jadwal dibatalkan!');
      setIsCancelling(false);
      onScheduleUpdated?.();
    } catch (error) {
      toast.error(handleScheduleError(error));
    }
  };

  const handleConfirmDelete = async (reason: string) => {
    try {
      await deleteMutation.mutateAsync({ scheduleId: schedule.id, reason });
      toast.success('Jadwal berhasil dihapus!');
      setIsDeletingModal(false);
      onClose();
      onScheduleUpdated?.();
    } catch (error) {
      toast.error(handleScheduleError(error));
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      await scheduleApi.downloadReportPdf(schedule.id);
      toast.success('Laporan PDF berhasil diunduh!');
    } catch (error) {
      console.error('Failed to download report PDF:', error);
      toast.error('Gagal mengunduh laporan PDF.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit jadwal teknisi' : 'Detail jadwal teknisi'}
      subtitle={
        mode === 'edit'
          ? undefined
          : `${formatDate(schedule.date)} • ${schedule.location?.name || 'N/A'}`
      }
      size="xl"
      contentClassName="max-h-[min(92vh,960px)]"
      footer={
        mode === 'edit'
          ? undefined
          : (
            <>
              {canEditSchedule && canModify && (
                <Button type="button" variant="outline" size="sm" onClick={() => setMode('edit')}>
                  Edit
                </Button>
              )}
              {canEditSchedule && isCompleted && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                >
                  {isDownloadingPdf ? 'Menyiapkan...' : 'Download Laporan PDF'}
                </Button>
              )}
              {canEditSchedule && canModify && (
                <Button type="button" variant="secondary" size="sm" onClick={() => setIsCancelling(true)}>
                  Batalkan
                </Button>
              )}
              {canDeleteSchedule && (
                <Button type="button" variant="danger" size="sm" onClick={() => setIsDeletingModal(true)}>
                  Hapus
                </Button>
              )}
            </>
          )
      }
    >
      {mode === 'edit' ? (
        <TechnicianScheduleForm
          initialData={schedule}
          onSubmit={handleSubmitEdit}
          onCancel={() => setMode('view')}
          isSubmitting={updateMutation.isPending}
        />
      ) : (
        <>
          {/* Tabs */}
          <div className="border-b border-gray-200 -mx-6 -mt-4 px-6">
            <nav className="flex gap-4">
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
              <div className="flex flex-wrap gap-1 mt-1">
                {(schedule.participants?.filter((p: any) => p.role === 'TECHNICIAN') || []).length > 0 ? (
                  schedule.participants
                    .filter((p: any) => p.role === 'TECHNICIAN')
                    .map((p: any) => (
                      <span key={p.user?.id || p.userId} className="inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-800">
                        {p.user?.name || '—'}
                      </span>
                    ))
                ) : schedule.technician?.name ? (
                  <span className="inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-800">
                    {schedule.technician.name}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">—</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Sales (Laporan)</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {schedule.participants?.filter((p: any) => p.role === 'SALES_OBSERVER').length > 0 ? (
                  schedule.participants
                    .filter((p: any) => p.role === 'SALES_OBSERVER')
                    .map((p: any) => (
                      <span key={p.user?.id || p.userId} className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">
                        {p.user?.name || '—'}
                      </span>
                    ))
                ) : (
                  <span className="text-sm text-gray-500">—</span>
                )}
              </div>
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

                    {/* Photos Grid — hanya untuk jadwal COMPLETED — CATATAN KEHADIRAN (selfie only) */}
                    {isCompleted && (attendance.selfieUrlIn || attendance.selfieUrlOut) && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-2">Foto Dokumentasi</p>
                        <div className="grid grid-cols-4 gap-2">
                          {attendance.selfieUrlIn && (
                            <div className="relative aspect-square">
                              <img
                                src={resolveBackendUrl(attendance.selfieUrlIn)}
                                alt="Selfie In"
                                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                                onClick={() => attendance.selfieUrlIn && window.open(resolveBackendUrl(attendance.selfieUrlIn), '_blank')}
                              />
                              <span className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                                Selfie In
                              </span>
                            </div>
                          )}
                          {attendance.selfieUrlOut && (
                            <div className="relative aspect-square">
                              <img
                                src={resolveBackendUrl(attendance.selfieUrlOut)}
                                alt="Selfie Out"
                                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                                onClick={() => attendance.selfieUrlOut && window.open(resolveBackendUrl(attendance.selfieUrlOut), '_blank')}
                              />
                              <span className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                                Selfie Out
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
          {activeTab === 'work-result' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Hasil Kerja Teknisi</h3>
                <button
                  onClick={() => setIsCreatingWorkResult(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 text-white text-xs font-medium px-3 py-1.5 hover:bg-green-700 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Buat Hasil Kerja
                </button>
              </div>

              {attendances && attendances.length > 0 ? (
                <div className="space-y-4">
                  {attendances.map((attendance, index) => (
                    <div key={attendance.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Sesi #{index + 1} - {formatTime(attendance.clockIn)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            attendance.status === 'HADIR' ? 'bg-green-100 text-green-800' :
                            attendance.status === 'TERLAMBAT' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {attendance.status}
                          </span>
                          <button
                            onClick={() => setEditAttendance(attendance)}
                            className="inline-flex items-center gap-1 rounded-lg border border-blue-300 text-blue-700 text-xs px-2 py-1 hover:bg-blue-50 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Hasil Kerja
                          </button>
                        </div>
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

                      {/* Photos Grid - Work Results Only — hanya untuk jadwal COMPLETED */}
                      {isCompleted && (parseJobCompletionPhotos(attendance.jobCompletionPhotos).length || attendance.airWaterPhoto) && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-3">📸 Dokumentasi Hasil Kerja</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {parseJobCompletionPhotos(attendance.jobCompletionPhotos).map((photo, idx) => (
                              <div key={idx} className="relative aspect-square">
                                <img
                                  src={resolveBackendUrl(photo)}
                                  alt={`Completion ${idx + 1}`}
                                  className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                                  onClick={() => window.open(resolveBackendUrl(photo), '_blank')}
                                />
                                <span className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                                  Foto {idx + 1}
                                </span>
                              </div>
                            ))}
                            {attendance.airWaterPhoto && (
                              <div className="relative aspect-square">
                                <img
                                  src={resolveBackendUrl(attendance.airWaterPhoto)}
                                  alt="Air Water Photo"
                                  className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                                  onClick={() => attendance.airWaterPhoto && window.open(resolveBackendUrl(attendance.airWaterPhoto), '_blank')}
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
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Belum ada hasil kerja untuk jadwal ini</p>
                    <button
                      onClick={() => setIsCreatingWorkResult(true)}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-green-600 text-white text-sm font-medium px-4 py-2 hover:bg-green-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Buat Hasil Kerja
                    </button>
                </div>
              )}
            </div>
          )}

{/* No attendance message */}
          {(!attendances || attendances.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Belum ada data kehadiran untuk jadwal ini</p>
              <button
                onClick={() => setIsCreatingWorkResult(true)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-green-600 text-white text-sm font-medium px-4 py-2 hover:bg-green-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Buat Hasil Kerja
              </button>
            </div>
          )}
        </div>
        </>
      )}

      {editAttendance && (
        <WorkResultEditModal
          isOpen={!!editAttendance}
          onClose={() => setEditAttendance(null)}
          attendance={editAttendance}
          onSaved={onAttendanceUpdated}
        />
      )}

      {isCreatingWorkResult && (
        <WorkResultCreateModal
          isOpen={isCreatingWorkResult}
          onClose={() => setIsCreatingWorkResult(false)}
          scheduleId={schedule.id}
          onSaved={onAttendanceUpdated}
        />
      )}

      {isDeletingModal && (
        <DeleteScheduleModal
          scheduleLabel={`${formatDate(schedule.date)} • ${schedule.location?.name || 'N/A'}`}
          isDeleting={deleteMutation.isPending}
          onConfirm={handleConfirmDelete}
          onClose={() => setIsDeletingModal(false)}
        />
      )}

      {isCancelling && (
        <CancelScheduleModal
          scheduleLabel={`${formatDate(schedule.date)} • ${schedule.location?.name || 'N/A'}`}
          isCancelling={cancelMutation.isPending}
          onConfirm={handleConfirmCancel}
          onClose={() => setIsCancelling(false)}
        />
      )}
    </ModalShell>
  );
};

export default ScheduleDetailModal;
