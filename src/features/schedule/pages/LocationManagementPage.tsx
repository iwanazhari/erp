import { useState, useMemo } from 'react';
import PageContainer from '@/components/ui/PageContainer';
import { useToast } from '@/components/ui/ToastContext';
import EmptyState from '@/components/ui/EmptyState';
import { exportLocationsToCSV } from '@/utils/exportToCsv';
import {
  useLocations,
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation,
} from '@/features/schedule/hooks/useSchedules';
import { LocationForm } from '@/features/schedule/components';
import { handleScheduleError } from '@/features/schedule/utils/scheduleHelpers';
import type { Location, CreateLocationInput, UpdateLocationInput, LocationFilters } from '@/shared/types/schedule';

export default function LocationManagementPage() {
  const toast = useToast();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filters, setFilters] = useState<LocationFilters>({
    isActive: true,
    page: 1,
    limit: 20,
  });

  const { data: locationsData, isLoading } = useLocations(filters);
  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();
  const deleteMutation = useDeleteLocation();

  const locations = useMemo(() => locationsData?.data || [], [locationsData]);

  const handleCreateClick = () => {
    setSelectedLocation(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditClick = (location: Location) => {
    setSelectedLocation(location);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (location: Location) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus lokasi "${location.name}"? Lokasi dengan jadwal aktif tidak dapat dihapus.`
    );
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(location.id);
      toast.success('Lokasi berhasil dihapus!');
    } catch (error) {
      toast.error(handleScheduleError(error));
    }
  };

  const handleSubmit = async (data: CreateLocationInput | UpdateLocationInput) => {
    try {
      if (isEditMode && selectedLocation) {
        await updateMutation.mutateAsync({
          locationId: selectedLocation.id,
          data: data as UpdateLocationInput,
        });
        toast.success('Lokasi berhasil diperbarui!');
        setIsModalOpen(false);
      } else {
        await createMutation.mutateAsync(data as CreateLocationInput);
        toast.success('Lokasi berhasil dibuat!');
        setIsModalOpen(false);
      }
    } catch (error) {
      toast.error(handleScheduleError(error));
      throw error;
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLocation(null);
    setIsEditMode(false);
  };

  const handleExport = () => {
    if (locations.length === 0) {
      toast.warning('Tidak ada lokasi untuk diekspor');
      return;
    }
    exportLocationsToCSV(locations, 'locations');
    toast.success(`${locations.length} lokasi diekspor ke CSV`);
  };

  return (
    <PageContainer title="Manajemen Lokasi">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <p className="text-slate-600">
            Kelola lokasi kerja (kantor, toko, site customer)
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={handleCreateClick}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              + Tambah Lokasi
            </button>
          </div>
        </div>

        {/* Location List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-100 rounded-lg h-24" />
            ))}
          </div>
        ) : locations.length === 0 ? (
          <EmptyState
            icon="location"
            title="Tidak ada lokasi"
            description='Belum ada lokasi yang dibuat. Klik tombol "Tambah Lokasi" untuk memulai.'
            action={
              <button
                onClick={handleCreateClick}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                + Tambah Lokasi
              </button>
            }
          />
        ) : (
          <div className="grid gap-4">
            {locations.map((location) => (
              <div
                key={location.id}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-800">
                        {location.name}
                      </h3>
                      {location.isActive ? (
                        <span className="px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-600 rounded-full">
                          Aktif
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                          Tidak Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{location.address}</p>
                    {location.description && (
                      <p className="text-sm text-slate-500 mt-2">{location.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      <span>
                        Koordinat: {location.latitude}, {location.longitude}
                      </span>
                      {location.radius && <span>Radius: {location.radius}m</span>}
                      {location._count?.schedules !== undefined && (
                        <span>{location._count.schedules} jadwal</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(location)}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(location)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Info */}
        {locationsData?.pagination && (
          <div className="flex items-center justify-between text-sm text-slate-600">
            <p>
              Menampilkan {locations.length} dari {locationsData.pagination.total} lokasi
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
                disabled={!filters.page || filters.page <= 1}
                className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span>
                Page {filters.page || 1} of {locationsData.pagination.totalPages}
              </span>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
                disabled={!filters.page || filters.page >= locationsData.pagination.totalPages}
                className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={handleCloseModal}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg transform transition-all">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-slate-800">
                  {isEditMode ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <LocationForm
                  initialData={selectedLocation || undefined}
                  onSubmit={handleSubmit}
                  onCancel={handleCloseModal}
                  isSubmitting={createMutation.isPending || updateMutation.isPending}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
