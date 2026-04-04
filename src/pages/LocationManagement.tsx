import { useState } from 'react';
import PageContainer from '@/components/ui/PageContainer';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastContext';
import {
  useLocations,
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation,
} from '@/features/schedule/hooks/useSchedules';
import LocationForm from '@/features/schedule/components/LocationForm';
import type { Location, CreateLocationInput, UpdateLocationInput } from '@/shared/types/schedule';

/**
 * Location Management Page
 * Allows ADMIN/HR to manage locations for sales schedules
 */
export default function LocationManagementPage() {
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    isActive: true,
    page: 1,
    pageSize: 20,
  });

  const { data: locationsData, isLoading, refetch } = useLocations({
    page: filters.page,
    limit: filters.pageSize,
    isActive: filters.isActive,
  });

  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();
  const deleteMutation = useDeleteLocation();

  const locations = Array.isArray(locationsData?.data) ? locationsData.data : [];
  const pagination = locationsData?.pagination;

  const resetForm = () => {
    setEditingLocation(null);
    setShowForm(false);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setShowForm(true);
  };

  const handleSubmit = async (data: CreateLocationInput | UpdateLocationInput) => {
    try {
      if (editingLocation) {
        await updateMutation.mutateAsync({
          locationId: editingLocation.id,
          data: data as UpdateLocationInput,
        });
        toast.success('Lokasi berhasil diperbarui!');
      } else {
        await createMutation.mutateAsync(data as CreateLocationInput);
        toast.success('Lokasi berhasil dibuat!');
      }
      resetForm();
      refetch();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Terjadi kesalahan';
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus lokasi ini? Pastikan tidak ada jadwal yang menggunakan lokasi ini.')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Lokasi dihapus!');
      refetch();
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Gagal menghapus lokasi';
      toast.error(message);
    }
  };

  const handleFilterReset = () => {
    setFilters({
      search: '',
      isActive: true,
      page: 1,
      pageSize: 20,
    });
  };

  return (
    <PageContainer title="Manajemen Lokasi">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <p className="text-slate-600">Kelola lokasi untuk jadwal sales</p>
          <Button type="button" variant={showForm ? 'outline' : 'primary'} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Tutup form' : '+ Lokasi baru'}
          </Button>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Cari Lokasi</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                placeholder="Nama atau alamat lokasi..."
                className="app-input w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
              <select
                value={filters.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFilters({ ...filters, isActive: e.target.value === 'active', page: 1 })}
                className="app-input w-full"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>
          {(filters.search) && (
            <div className="mt-3 flex justify-end">
              <Button type="button" variant="secondary" onClick={handleFilterReset} size="sm">
                Reset Filter
              </Button>
            </div>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">
              {editingLocation ? 'Edit Lokasi' : 'Buat Lokasi Baru'}
            </h3>
            <LocationForm
              initialData={editingLocation || undefined}
              onSubmit={handleSubmit}
              onCancel={resetForm}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
            />
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-700">Daftar Lokasi</h3>
            {pagination && (
              <p className="text-xs text-slate-500">
                Halaman {pagination.page || filters.page} dari {pagination.totalPages || 1} - Total {pagination.total || 0} lokasi
              </p>
            )}
          </div>
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Nama Lokasi</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Alamat</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Koordinat</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Radius</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Belum ada lokasi
                  </td>
                </tr>
              ) : (
                locations.map((location: Location) => (
                  <tr key={location.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">{location.name}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="max-w-[250px] truncate" title={location.address}>
                        {location.address}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <div>Lat: {location.latitude}</div>
                      <div>Lng: {location.longitude}</div>
                      <a
                        href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 mt-1 inline-block"
                      >
                        Maps →
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm">{location.radius || 50}m</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          location.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {location.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(location)}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                          title="Edit lokasi"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(location.id)}
                          className="text-sm font-medium text-red-600 hover:text-red-800"
                          title="Hapus lokasi"
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
