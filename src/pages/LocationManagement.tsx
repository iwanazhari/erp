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
          <p className="text-muted-foreground">Kelola lokasi untuk jadwal sales</p>
          <Button type="button" variant={showForm ? 'outline' : 'primary'} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Tutup form' : '+ Lokasi baru'}
          </Button>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
           <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
             <div>
               <label className="mb-1 block text-sm font-medium text-muted-foreground">Cari Lokasi</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                placeholder="Nama atau alamat lokasi..."
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15"
               />
             </div>
             <div>
               <label className="mb-1 block text-sm font-medium text-muted-foreground">Status</label>
               <select
                 value={filters.isActive ? 'active' : 'inactive'}
                 onChange={(e) => setFilters({ ...filters, isActive: e.target.value === 'active', page: 1 })}
                 className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%2364748B%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
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
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
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
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
           <div className="px-4 py-3 bg-muted border-b border-border flex justify-between items-center">
             <h3 className="text-sm font-semibold text-muted-foreground">Daftar Lokasi</h3>
             {pagination && (
               <p className="text-xs text-muted-foreground">
                Halaman {pagination.page || filters.page} dari {pagination.totalPages || 1} - Total {pagination.total || 0} lokasi
              </p>
            )}
          </div>
          <table className="w-full">
            <thead className="bg-muted border-b">
               <tr>
                 <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Nama Lokasi</th>
                 <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Alamat</th>
                 <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Koordinat</th>
                 <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Radius</th>
                 <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                 <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                     Loading...
                   </td>
                 </tr>
               ) : locations.length === 0 ? (
                 <tr>
                   <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Belum ada lokasi
                  </td>
                </tr>
              ) : (
                locations.map((location: Location) => (
                  <tr key={location.id} className="hover:bg-muted">
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">{location.name}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="max-w-[250px] truncate" title={location.address}>
                        {location.address}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <div>Lat: {location.latitude}</div>
                      <div>Lng: {location.longitude}</div>
                      <a
                        href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-[var(--color-accent-secondary)] mt-1 inline-block"
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
                             : 'bg-muted text-foreground'
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
                          className="text-sm font-medium text-accent hover:text-[var(--color-accent-secondary)]"
                          title="Edit lokasi"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(location.id)}
                          className="text-sm font-medium text-red-500 hover:text-red-700"
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
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
               <div className="flex items-center gap-2">
                 <span className="text-sm text-muted-foreground">Tampilkan:</span>
                 <select
                   value={filters.pageSize}
                   onChange={(e) => setFilters({ ...filters, pageSize: Number(e.target.value), page: 1 })}
                   className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%2364748B%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
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
                <span className="text-sm text-muted-foreground">
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
