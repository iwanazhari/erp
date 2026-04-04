import { useState } from 'react';
import PageContainer from '@/components/ui/PageContainer';
import Button from '@/components/ui/Button';
import SalesScheduleForm, {
  type SalesScheduleFormData,
} from '@/features/schedule/components/SalesScheduleForm';
import { useToast } from '@/components/ui/ToastContext';
import {
  useSalesSchedules,
  useCreateSalesSchedule,
  useUpdateSalesSchedule,
  useCancelSalesSchedule,
  useDeleteSalesSchedule,
} from '@/features/schedule/hooks/useSalesSchedules';
import { locationApi } from '@/services/scheduleApi';
import type { Schedule, CreateScheduleInput, UpdateScheduleInput, ScheduleStatus } from '@/shared/types/schedule';
import {
  getScheduleAssigneeDisplay,
  getStatusBadgeClasses,
} from '@/features/schedule/utils/scheduleHelpers';
import { useUser } from '@/shared/UserContext';
import { canEditSchedule, canDeleteSchedule } from '@/modules/auth/permissions';
import type { Role } from '@/modules/auth/types';

/**
 * Sales Schedule Management Page
 * Allows ADMIN/HR to manage sales schedules with filters and pagination
 * API: POST/GET `/api/sales/schedules`
 */
export default function SalesSchedule() {
  const toast = useToast();
  const { user } = useUser();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    search: '',
    page: 1,
    pageSize: 20,
  });

  // Get current time in Indonesia timezone (WIB - UTC+7)
  const getCurrentTime = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta'
    };
    const timeStr = new Intl.DateTimeFormat('id-ID', options).format(now);
    return timeStr;
  };

  const [formData, setFormData] = useState<SalesScheduleFormData>({
    salesIds: [],
    locationId: '',
    locationName: '',
    locationAddress: '',
    latitude: undefined,
    longitude: undefined,
    date: new Date().toISOString().split('T')[0],
    startTime: getCurrentTime(),
    endTime: '17:00',
    description: '',
    notes: '',
  });

  // Check user permissions
  const role = (user?.role?.toLowerCase() || 'sales') as Role;
  const canEdit = canEditSchedule(role);
  const canDelete = canDeleteSchedule(role);

  // Filter schedules with pagination
  const { data: schedulesData, isLoading, refetch } = useSalesSchedules({
    page: filters.page,
    pageSize: filters.pageSize,
    status: (filters.status as ScheduleStatus) || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    search: filters.search || undefined,
  });

  const createMutation = useCreateSalesSchedule();
  const updateMutation = useUpdateSalesSchedule();
  const cancelMutation = useCancelSalesSchedule();
  const deleteMutation = useDeleteSalesSchedule();

  const schedules = Array.isArray(schedulesData?.data) ? schedulesData.data : [];
  const pagination = schedulesData?.pagination;

  const resetForm = () => {
    setFormData({
      salesIds: [],
      locationId: '',
      locationName: '',
      locationAddress: '',
      latitude: undefined,
      longitude: undefined,
      date: new Date().toISOString().split('T')[0],
      startTime: getCurrentTime(),
      endTime: '17:00',
      description: '',
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingId(schedule.id);
    const salesIds = schedule.participants
      ?.filter((p) => p.role === 'SALES')
      .map((p) => p.userId || p.user?.id)
      .filter((id): id is string => Boolean(id)) || [];

    setFormData({
      salesIds,
      locationId: schedule.location.id,
      locationName: schedule.location.name,
      locationAddress: schedule.location.address,
      latitude: schedule.location.latitude,
      longitude: schedule.location.longitude,
      date: schedule.date.split('T')[0],
      startTime: schedule.startTime.split('T')[1].slice(0, 5),
      endTime: schedule.endTime.split('T')[1].slice(0, 5),
      description: schedule.description || '',
      notes: schedule.notes || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.salesIds.length === 0) {
      toast.error('Pilih minimal satu sales yang dijadwalkan.');
      return;
    }

    if (!formData.locationId && (!formData.latitude || !formData.longitude)) {
      toast.error('Pilih lokasi atau ambil koordinat dari link Google Maps terlebih dahulu.');
      return;
    }

    try {
      let locationId = formData.locationId;

      // Step 1: Create new location if doesn't exist and coordinates provided
      if (!locationId && formData.latitude && formData.longitude) {
        const locationData = {
          name: formData.locationName,
          address: formData.locationAddress,
          latitude: formData.latitude,
          longitude: formData.longitude,
          isActive: true,
        };

        const locationResponse = await locationApi.create(locationData);
        locationId = locationResponse.data.id;
        toast.success('Lokasi berhasil dibuat!');
      }

      if (!locationId) {
        toast.error('Lokasi tidak valid.');
        return;
      }

      // Step 2: Create/Update schedule with locationId
      // Backend expects: date (YYYY-MM-DD), startTime (HH:mm), endTime (HH:mm)
      const payload: CreateScheduleInput | UpdateScheduleInput = {
        salesIds: formData.salesIds,
        locationId: locationId,
        date: formData.date, // YYYY-MM-DD format
        startTime: formData.startTime, // HH:mm format
        endTime: formData.endTime, // HH:mm format
        description: formData.description,
        notes: formData.notes,
      };

      if (editingId) {
        await updateMutation.mutateAsync({ scheduleId: editingId, data: payload });
        toast.success('Jadwal berhasil diperbarui!');
      } else {
        await createMutation.mutateAsync(payload as CreateScheduleInput);
        toast.success('Jadwal berhasil dibuat!');
      }
      resetForm();
      refetch();
    } catch (error: any) {
      console.error('Submit error:', error);
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || error.message || 'Terjadi kesalahan';
      
      // Handle specific error codes per API spec
      if (statusCode === 400) {
        // Backend returns 400 for validation errors including time overlap
        toast.error(message);
      } else if (statusCode === 403) {
        toast.error('Anda tidak memiliki akses untuk membuat jadwal');
      } else {
        toast.error(message);
      }
    }
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    try {
      await cancelMutation.mutateAsync({ scheduleId: cancelId, reason: cancelReason });
      toast.success('Jadwal berhasil dibatalkan!');
      setCancelModalOpen(false);
      setCancelId(null);
      setCancelReason('');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Gagal membatalkan jadwal');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus jadwal ini? Hanya jadwal dengan status PENDING yang dapat dihapus.')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Jadwal dihapus!');
      refetch();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Gagal menghapus jadwal';
      toast.error(message);
    }
  };

  const handleFilterReset = () => {
    setFilters({
      status: '',
      dateFrom: '',
      dateTo: '',
      search: '',
      page: 1,
      pageSize: 20,
    });
  };

  return (
    <PageContainer title="Jadwal Sales">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <p className="text-slate-600">Kelola jadwal kunjungan sales</p>
          <Button type="button" variant={showForm ? 'outline' : 'primary'} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Tutup form' : '+ Jadwal baru'}
          </Button>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                className="app-input w-full"
              >
                <option value="">Semua</option>
                <option value="PENDING">Pending</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Tanggal Dari</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value, page: 1 })}
                className="app-input w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Tanggal Sampai</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value, page: 1 })}
                className="app-input w-full"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Cari</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                placeholder="Deskripsi, catatan, atau nama lokasi..."
                className="app-input w-full"
              />
            </div>
          </div>
          {(filters.status || filters.dateFrom || filters.dateTo || filters.search) && (
            <div className="mt-3 flex justify-end">
              <Button type="button" variant="secondary" onClick={handleFilterReset} size="sm">
                Reset Filter
              </Button>
            </div>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <SalesScheduleForm
            formData={formData}
            setFormData={setFormData}
            user={user}
            editingId={editingId}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            isSaving={createMutation.isPending || updateMutation.isPending}
          />
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
                  disabled={!cancelReason.trim()}
                >
                  Batalkan Jadwal
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-700">Daftar Jadwal Sales</h3>
            {pagination && (
              <p className="text-xs text-slate-500">
                Halaman {pagination.page || filters.page} dari {pagination.totalPages || 1} - Total {pagination.total || 0} jadwal
              </p>
            )}
          </div>
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Sales</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Lokasi</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Tanggal & Waktu</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Belum ada jadwal
                  </td>
                </tr>
              ) : (
                schedules.map((schedule: any) => (
                  <tr key={schedule.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">{getScheduleAssigneeDisplay(schedule).name}</div>
                      {schedule.participants?.length > 1 && (
                        <div className="text-xs text-slate-500">
                          +{schedule.participants.length - 1} sales lainnya
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">{schedule.location.name}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]">
                        {schedule.location.address}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>{new Date(schedule.date).toLocaleDateString('id-ID', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                      <div className="text-slate-500 text-xs">
                        {schedule.startTime.split('T')[1].slice(0, 5)} - {schedule.endTime.split('T')[1].slice(0, 5)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClasses(schedule.status)}`}
                      >
                        {schedule.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {canEdit && schedule.status !== 'CANCELLED' && schedule.status !== 'COMPLETED' && (
                          <button
                            type="button"
                            onClick={() => handleEdit(schedule)}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                            title="Edit jadwal"
                          >
                            Edit
                          </button>
                        )}
                        {canEdit && schedule.status !== 'CANCELLED' && schedule.status !== 'COMPLETED' && (
                          <button
                            type="button"
                            onClick={() => {
                              setCancelId(schedule.id);
                              setCancelModalOpen(true);
                            }}
                            className="text-sm font-medium text-amber-600 hover:text-amber-800"
                            title="Batal jadwal"
                          >
                            Batal
                          </button>
                        )}
                        {canDelete && schedule.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => handleDelete(schedule.id)}
                            className="text-sm font-medium text-red-600 hover:text-red-800"
                            title="Hapus jadwal"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Tampilkan:</span>
                <select
                  value={filters.pageSize}
                  onChange={(e) => setFilters({ ...filters, pageSize: Number(e.target.value), page: 1 })}
                  className="app-input"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={filters.page === 1}
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                >
                  Prev
                </Button>
                <span className="text-sm text-slate-600">
                  {filters.page} / {pagination.totalPages}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={filters.page >= pagination.totalPages}
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
