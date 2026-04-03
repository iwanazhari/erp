import { useState, useEffect } from 'react';
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
import type { Schedule, CreateScheduleInput, UpdateScheduleInput } from '@/shared/types/schedule';
import {
  getPrimarySalesUserIdFromSchedule,
  getScheduleAssigneeDisplay,
  getStatusBadgeClasses,
} from '@/features/schedule/utils/scheduleHelpers';
import { useUser } from '@/shared/UserContext';
import { canEditSchedule, canDeleteSchedule } from '@/modules/auth/permissions';
import type { Role } from '@/modules/auth/types';

/**
 * Sales Schedule Management Page
 * Allows users with SALES role to manage their schedules
 * API: POST/GET `/api/schedules` dengan body `salesIds` dan `?scheduleKind=SALES`.
 */
export default function SalesSchedule() {
  const toast = useToast();
  const { user } = useUser();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

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
    technicianId: user?.role?.toLowerCase() === 'sales' ? user?.id || '' : '',
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

  useEffect(() => {
    if (user?.role?.toLowerCase() !== 'sales' || editingId) return;
    setFormData((prev) => ({ ...prev, technicianId: user.id }));
  }, [user?.id, user?.role, editingId]);

  // Check user permissions
  const role = (user?.role?.toLowerCase() || 'technician') as Role;
  const canEdit = canEditSchedule(role);
  const canDelete = canDeleteSchedule(role);

  // Filter schedules for current user (SALES role)
  const { data: schedulesData, isLoading, refetch } = useSalesSchedules({
    page: 1,
    limit: 50,
  });

  const createMutation = useCreateSalesSchedule();
  const updateMutation = useUpdateSalesSchedule();
  const cancelMutation = useCancelSalesSchedule();
  const deleteMutation = useDeleteSalesSchedule();

  const schedules = Array.isArray(schedulesData?.data) ? schedulesData.data : [];
  const pagination = schedulesData?.pagination;

  const resetForm = () => {
    setFormData({
      technicianId: user?.role?.toLowerCase() === 'sales' ? user?.id || '' : '',
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
    setFormData({
      technicianId: getPrimarySalesUserIdFromSchedule(schedule) || user?.id || '',
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

    if (!formData.latitude || !formData.longitude) {
      toast.error('Ambil koordinat dari link Google Maps terlebih dahulu.');
      return;
    }

    const isSalesSelf = user?.role?.toLowerCase() === 'sales';
    const salesUserId = isSalesSelf ? formData.technicianId || user?.id : formData.technicianId;
    if (!salesUserId) {
      toast.error('Pilih user sales yang dijadwalkan.');
      return;
    }

    try {
      let locationId = '';

      // Step 1: Create new location if doesn't exist
      if (!formData.locationId) {
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
      } else {
        locationId = formData.locationId;
      }

      // Step 2: Create/Update schedule with locationId
      const payload: CreateScheduleInput | UpdateScheduleInput = {
        salesIds: [salesUserId],
        locationId: locationId,
        date: new Date(formData.date!).toISOString(),
        startTime: new Date(`${formData.date}T${formData.startTime}`).toISOString(),
        endTime: new Date(`${formData.date}T${formData.endTime}`).toISOString(),
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
      const message = error.response?.data?.message || error.message || 'Terjadi kesalahan';
      toast.error(message);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Batal jadwal ini?')) return;
    try {
      await cancelMutation.mutateAsync(id);
      toast.success('Jadwal dibatalkan!');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Gagal membatalkan jadwal');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus jadwal ini?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Jadwal dihapus!');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus jadwal');
    }
  };

  return (
    <PageContainer title="Jadwal Sales">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <p className="text-slate-600">Kelola jadwal sales Anda dengan mudah</p>
          <Button type="button" variant={showForm ? 'outline' : 'primary'} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Tutup form' : '+ Jadwal baru'}
          </Button>
        </div>

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

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-700">Daftar Jadwal Sales</h3>
            {pagination && (
              <p className="text-xs text-slate-500">
                Halaman {pagination.page} dari {pagination.totalPages} - Total {pagination.total} jadwal
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
                    <td className="px-4 py-3 text-sm">{getScheduleAssigneeDisplay(schedule).name}</td>
                    <td className="px-4 py-3 text-sm">{schedule.location.name}</td>
                    <td className="px-4 py-3 text-sm">
                      <div>{new Date(schedule.date).toLocaleDateString('id-ID')}</div>
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
                        {canEdit && schedule.status === 'ASSIGNED' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleEdit(schedule)}
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                              title="Edit jadwal"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleCancel(schedule.id)}
                              className="text-amber-600 hover:text-amber-800 text-sm"
                              title="Batal jadwal"
                            >
                              Batal
                            </button>
                          </>
                        )}
                        {canDelete && schedule.status === 'PENDING' && (
                          <button
                            onClick={() => handleDelete(schedule.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
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
        </div>
      </div>
    </PageContainer>
  );
}
