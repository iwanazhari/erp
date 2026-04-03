import { useState } from 'react';
import PageContainer from '@/components/ui/PageContainer';
import { useToast } from '@/components/ui/ToastContext';
import {
  useSchedules,
  useCreateSchedule,
  useUpdateSchedule,
  useCancelSchedule,
  useDeleteSchedule,
  useSales,
} from '@/features/schedule/hooks/useSchedules';
import { locationApi } from '@/services/scheduleApi';
import type { Schedule, CreateScheduleInput, UpdateScheduleInput } from '@/shared/types/schedule';
import { getPrimarySalesUserIdFromSchedule, getScheduleAssigneeDisplay } from '@/features/schedule/utils/scheduleHelpers';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';
import TimePicker24 from '@/components/ui/TimePicker24';

type FormData = {
  technicianId: string;
  locationId?: string;
  locationName: string;
  locationAddress: string;
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  notes: string;
};

export default function SimpleSchedule() {
  const toast = useToast();
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
  
  const [formData, setFormData] = useState<FormData>({
    technicianId: '',
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

  const { data: schedulesData, isLoading, refetch } = useSchedules({
    page: 1,
    limit: 50,
    scheduleKind: 'SALES',
  });
  const { data: salesData } = useSales();

  const createMutation = useCreateSchedule();
  const updateMutation = useUpdateSchedule();
  const cancelMutation = useCancelSchedule();
  const deleteMutation = useDeleteSchedule();

  const schedules = schedulesData?.data || [];
  const sales = salesData?.data || [];

  const resetForm = () => {
    setFormData({
      technicianId: '',
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
      technicianId: getPrimarySalesUserIdFromSchedule(schedule),
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
      toast.error('Pilih lokasi di peta untuk mengirim koordinat');
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
        salesIds: [formData.technicianId!],
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SCHEDULED: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <PageContainer title="Jadwal Sales">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <p className="text-slate-600">Kelola jadwal sales dengan mudah</p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Tutup Form' : '+ Jadwal Baru'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? 'Edit Jadwal' : 'Jadwal Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sales</label>
                  <select
                    value={formData.technicianId}
                    onChange={(e) => setFormData({ ...formData, technicianId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Pilih Sales</option>
                    {sales.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lokasi</label>
                <input
                  type="text"
                  value={formData.locationName}
                  onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                  placeholder="Contoh: Kantor Pusat, Cabang Jakarta, Toko ABC"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Cari Alamat Lokasi <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Ketik alamat di Indonesia, pilih dari saran, atau gunakan lokasi saat ini
                </p>
                <AddressAutocomplete
                  onLocationSelect={(lat, lon, address, accuracy) => {
                    setFormData({
                      ...formData,
                      latitude: lat,
                      longitude: lon,
                      locationAddress: address,
                      locationAccuracy: accuracy,
                    });
                  }}
                  initialAddress={formData.locationAddress}
                />
                {formData.latitude && formData.longitude && (
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between gap-2 text-xs text-green-600 mb-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-medium">Koordinat asli (tanpa rounding):</span>
                      </div>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                        ✓ Akurat
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">Latitude:</span>
                        <span className="ml-2 font-mono text-slate-700 break-all">{formData.latitude}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Longitude:</span>
                        <span className="ml-2 font-mono text-slate-700 break-all">{formData.longitude}</span>
                      </div>
                    </div>
                    {formData.locationAccuracy && (
                      <div className="mt-2 text-xs text-slate-500">
                        Akurasi GPS: ±{Math.round(formData.locationAccuracy)} meter
                      </div>
                    )}
                    {!formData.locationAccuracy && (
                      <div className="mt-2 text-xs text-blue-600">
                        💡 Koordinat asli dari Google Maps - akurasi tertinggi
                      </div>
                    )}
                    <a
                      href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Lihat di Google Maps
                    </a>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <TimePicker24
                  label="Waktu Mulai"
                  value={formData.startTime}
                  onChange={(time) => setFormData({ ...formData, startTime: time })}
                />
                <TimePicker24
                  label="Waktu Selesai"
                  value={formData.endTime}
                  onChange={(time) => setFormData({ ...formData, endTime: time })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Deskripsi pekerjaan..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : (editingId ? 'Perbarui' : 'Simpan')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
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
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(schedule.status)}`}>
                        {schedule.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {schedule.status === 'SCHEDULED' && (
                          <>
                            <button
                              onClick={() => handleEdit(schedule)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleCancel(schedule.id)}
                              className="text-amber-600 hover:text-amber-800 text-sm"
                            >
                              Batal
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Hapus
                        </button>
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
