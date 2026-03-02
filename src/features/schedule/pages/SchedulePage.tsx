import { useState, useMemo } from 'react';
import PageContainer from '@/components/ui/PageContainer';
import { useToast } from '@/components/ui/ToastContext';
import {
  useSchedules,
  useCreateSchedule,
  useUpdateSchedule,
  useCancelSchedule,
  useDeleteSchedule,
  useLocations,
} from '@/features/schedule/hooks/useSchedules';
import {
  ScheduleModal,
  ScheduleTable,
  ScheduleFilters,
} from '@/features/schedule/components';
import { handleScheduleError } from '@/features/schedule/utils/scheduleHelpers';
import { exportSchedulesToCSV } from '@/utils/exportToCsv';
import type { Schedule, CreateScheduleInput, UpdateScheduleInput, ScheduleFilters as ScheduleFilterType } from '@/shared/types/schedule';

export default function SchedulePage() {
  const toast = useToast();
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<ScheduleFilterType>({
    page: 1,
    limit: 20,
  });

  const { data: schedulesData, isLoading: isLoadingSchedules } = useSchedules(filters);
  const { data: locationsData } = useLocations({ isActive: true, limit: 100 });

  const createMutation = useCreateSchedule();
  const updateMutation = useUpdateSchedule();
  const cancelMutation = useCancelSchedule();
  const deleteMutation = useDeleteSchedule();

  const schedules = useMemo(() => schedulesData?.data || [], [schedulesData]);
  const locations = useMemo(() => locationsData?.data || [], [locationsData]);

  const handleCreateClick = () => {
    setSelectedSchedule(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleRowClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleCancelSchedule = async () => {
    if (!selectedSchedule) return;

    const confirmed = window.confirm(
      'Apakah Anda yakin ingin membatalkan jadwal ini?'
    );
    if (!confirmed) return;

    try {
      await cancelMutation.mutateAsync(selectedSchedule.id);
      toast.success('Jadwal berhasil dibatalkan!');
      setIsModalOpen(false);
    } catch (error) {
      toast.error(handleScheduleError(error));
    }
  };

  const handleDeleteSchedule = async () => {
    if (!selectedSchedule) return;

    const confirmed = window.confirm(
      'Apakah Anda yakin ingin menghapus jadwal ini? Aksi ini tidak dapat dibatalkan.'
    );
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(selectedSchedule.id);
      toast.success('Jadwal berhasil dihapus!');
      setIsModalOpen(false);
    } catch (error) {
      toast.error(handleScheduleError(error));
    }
  };

  const handleSubmit = async (data: CreateScheduleInput | UpdateScheduleInput) => {
    try {
      if (modalMode === 'create') {
        await createMutation.mutateAsync(data as CreateScheduleInput);
        toast.success('Jadwal berhasil dibuat!');
        setIsModalOpen(false);
      } else if (modalMode === 'edit' && selectedSchedule) {
        await updateMutation.mutateAsync({
          scheduleId: selectedSchedule.id,
          data: data as UpdateScheduleInput,
        });
        toast.success('Jadwal berhasil diperbarui!');
        setIsModalOpen(false);
      }
    } catch (error) {
      toast.error(handleScheduleError(error));
      throw error;
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSchedule(null);
  };

  const handleFilterChange = (newFilters: ScheduleFilterType) => {
    setFilters({
      ...newFilters,
      page: 1,
    });
  };

  const handleExport = () => {
    if (schedules.length === 0) {
      toast.warning('Tidak ada jadwal untuk diekspor');
      return;
    }
    exportSchedulesToCSV(schedules, 'schedules');
    toast.success(`${schedules.length} jadwal diekspor ke CSV`);
  };

  return (
    <PageContainer title="Jadwal Teknisi">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <p className="text-slate-600">
            Kelola penjadwalan teknisi di lokasi tertentu
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
              + Buat Jadwal
            </button>
          </div>
        </div>

        {/* Filters */}
        <ScheduleFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          locations={locations.map((loc) => ({ id: loc.id, name: loc.name }))}
        />

        {/* Schedule Table */}
        <ScheduleTable
          schedules={schedules}
          onRowClick={handleRowClick}
          isLoading={isLoadingSchedules}
        />

        {/* Pagination Info */}
        {schedulesData?.pagination && (
          <div className="flex items-center justify-between text-sm text-slate-600">
            <p>
              Menampilkan {schedules.length} dari {schedulesData.pagination.total} jadwal
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
                Page {filters.page || 1} of {schedulesData.pagination.totalPages}
              </span>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
                disabled={!filters.page || filters.page >= schedulesData.pagination.totalPages}
                className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        schedule={selectedSchedule || undefined}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        mode={modalMode}
        onEdit={() => {
          setModalMode('edit');
        }}
        onCancel={handleCancelSchedule}
        onDelete={handleDeleteSchedule}
      />
    </PageContainer>
  );
}
