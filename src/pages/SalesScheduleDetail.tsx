import { useParams, useNavigate } from '@tanstack/react-router';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useSalesScheduleById, useCancelSalesSchedule } from '@/features/schedule/hooks/useSalesSchedules';
import { useToast } from '@/components/ui/ToastContext';
import { useState } from 'react';
import type { Schedule } from '@/shared/types/schedule';

/**
 * Sales Schedule Detail Page
 * Shows complete schedule information with attendance records
 */
export default function SalesScheduleDetail() {
  const { id } = useParams({ from: '/sales-schedules/$id' });
  const navigate = useNavigate();
  const toast = useToast();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const { data: scheduleData, isLoading, refetch } = useSalesScheduleById(id);
  const cancelMutation = useCancelSalesSchedule();

  const schedule: Schedule | null = scheduleData?.data || null;

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync({ scheduleId: id, reason: cancelReason });
      toast.success('Jadwal berhasil dibatalkan!');
      refetch();
      setCancelModalOpen(false);
      setCancelReason('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Gagal membatalkan jadwal');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-lg text-slate-600 mb-4">Jadwal tidak ditemukan</p>
        <Button onClick={() => navigate({ to: '/sales-schedules' })}>
          Kembali ke Daftar
        </Button>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ASSIGNED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
      COMPLETED: 'bg-emerald-100 text-emerald-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Detail Jadwal Sales</h1>
          <p className="text-sm text-slate-600 mt-1">ID: {schedule.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate({ to: '/sales-schedules' })}>
            Kembali
          </Button>
          {schedule.status !== 'CANCELLED' && schedule.status !== 'COMPLETED' && (
            <Button
              variant="danger"
              onClick={() => setCancelModalOpen(true)}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? 'Membatalkan...' : 'Batalkan Jadwal'}
            </Button>
          )}
        </div>
      </div>

      {/* Schedule Info */}
      <Card padding="md">
        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700">Status:</span>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusBadge(schedule.status)}`}>
              {schedule.status}
            </span>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-medium text-slate-500">Tanggal</h3>
              <p className="mt-1 text-base text-slate-900">{formatDate(schedule.date)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">Waktu Mulai</h3>
              <p className="mt-1 text-base text-slate-900">{formatTime(schedule.startTime)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">Waktu Selesai</h3>
              <p className="mt-1 text-base text-slate-900">{formatTime(schedule.endTime)}</p>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-2">Lokasi</h3>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="font-medium text-slate-900">{schedule.location.name}</p>
              <p className="text-sm text-slate-600 mt-1">{schedule.location.address}</p>
              <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                <span>Lat: {schedule.location.latitude}</span>
                <span>Lng: {schedule.location.longitude}</span>
                {schedule.location.radius && <span>Radius: {schedule.location.radius}m</span>}
              </div>
              <a
                href={`https://www.google.com/maps?q=${schedule.location.latitude},${schedule.location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-800"
              >
                Buka di Google Maps →
              </a>
            </div>
          </div>

          {/* Participants */}
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-2">
              Sales Terlibat ({schedule.participants?.length || 0})
            </h3>
            <div className="space-y-2">
              {schedule.participants?.map((participant, idx) => (
                <div key={idx} className="rounded-lg border border-slate-200 p-3">
                  <p className="font-medium text-slate-900">{participant.user?.name}</p>
                  <p className="text-sm text-slate-600">{participant.user?.email}</p>
                  <p className="text-xs text-slate-500 mt-1">Role: {participant.user?.role || participant.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description & Notes */}
          {(schedule.description || schedule.notes) && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {schedule.description && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Deskripsi</h3>
                  <p className="text-sm text-slate-900 whitespace-pre-wrap">{schedule.description}</p>
                </div>
              )}
              {schedule.notes && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Catatan</h3>
                  <p className="text-sm text-slate-900 whitespace-pre-wrap">{schedule.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Cancellation Info */}
          {schedule.status === 'CANCELLED' && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="text-sm font-medium text-red-800 mb-2">Informasi Pembatalan</h3>
              {schedule.cancellationReason && (
                <p className="text-sm text-red-700">
                  <span className="font-medium">Alasan:</span> {schedule.cancellationReason}
                </p>
              )}
              {schedule.cancelledAt && (
                <p className="text-sm text-red-700 mt-1">
                  <span className="font-medium">Dibatalkan pada:</span> {formatDate(schedule.cancelledAt)}
                </p>
              )}
              {schedule.cancelledBy && (
                <p className="text-sm text-red-700 mt-1">
                  <span className="font-medium">Dibatalkan oleh:</span> {schedule.cancelledBy}
                </p>
              )}
            </div>
          )}

          {/* Timestamps */}
          <div className="border-t pt-4 text-xs text-slate-500">
            <p>Dibuat: {new Date(schedule.createdAt).toLocaleString('id-ID')}</p>
            <p className="mt-1">Diperbarui: {new Date(schedule.updatedAt).toLocaleString('id-ID')}</p>
          </div>
        </div>
      </Card>

      {/* Attendance Records */}
      {schedule.attendances && schedule.attendances.length > 0 && (
        <Card padding="md">
          <h3 className="mb-4 text-lg font-semibold">Catatan Kehadiran</h3>
          <div className="space-y-3">
            {schedule.attendances.map((attendance) => (
              <div key={attendance.id} className="rounded-lg border border-slate-200 p-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs text-slate-500">Tanggal</p>
                    <p className="text-sm font-medium">{formatDate(attendance.date)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Clock In</p>
                    <p className="text-sm font-medium">
                      {attendance.clockIn ? formatTime(attendance.clockIn) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Clock Out</p>
                    <p className="text-sm font-medium">
                      {attendance.clockOut ? formatTime(attendance.clockOut) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Status</p>
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800">
                      {attendance.status}
                    </span>
                  </div>
                </div>
                {(attendance.latitudeIn || attendance.longitudeIn) && (
                  <div className="mt-3 border-t pt-3">
                    <p className="text-xs text-slate-500 mb-1">Koordinat Clock In</p>
                    <p className="text-sm">
                      Lat: {attendance.latitudeIn}, Lng: {attendance.longitudeIn}
                    </p>
                    {attendance.selfieUrlIn && (
                      <a
                        href={attendance.selfieUrlIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        Lihat Foto Selfie In →
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Cancel Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">Batalkan Jadwal</h3>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Alasan pembatalan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="app-input w-full"
                placeholder="Jelaskan alasan pembatalan..."
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setCancelModalOpen(false)}>
                Kembali
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleCancel}
                disabled={!cancelReason.trim() || cancelMutation.isPending}
              >
                {cancelMutation.isPending ? 'Membatalkan...' : 'Batalkan Jadwal'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
