import type {
  LeaveFilters as LeaveFiltersType,
  AttendanceStatus,
  LeaveApprovalStatus,
} from '@/shared/types/leave';
import Card from '@/components/ui/Card';

type Props = {
  filters: LeaveFiltersType;
  onFilterChange: (filters: LeaveFiltersType) => void;
  isLoading?: boolean;
};

export default function LeaveFilters({
  filters,
  onFilterChange,
  isLoading = false,
}: Props) {
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as AttendanceStatus | '';
    onFilterChange({
      ...filters,
      type: value || undefined,
      page: 1,
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as LeaveApprovalStatus | '';
    onFilterChange({
      ...filters,
      status: value || undefined,
      page: 1,
    });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      startDate: e.target.value || undefined,
      page: 1,
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      endDate: e.target.value || undefined,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      page: 1,
      pageSize: filters.pageSize || 20,
    });
  };

  const hasActiveFilters = filters.type || filters.status || filters.startDate || filters.endDate;

  return (
    <Card>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label htmlFor="leave-filter-type" className="app-label mb-1.5">
            Tipe
          </label>
          <select
            id="leave-filter-type"
            value={filters.type || ''}
            onChange={handleTypeChange}
            disabled={isLoading}
            className="app-select"
          >
            <option value="">Semua</option>
            <option value="IZIN">Izin</option>
            <option value="SAKIT">Sakit</option>
          </select>
        </div>

        <div>
          <label htmlFor="leave-filter-approval" className="app-label mb-1.5">
            Keputusan
          </label>
          <select
            id="leave-filter-approval"
            value={filters.status || ''}
            onChange={handleStatusChange}
            disabled={isLoading}
            className="app-select"
          >
            <option value="">Semua</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Disetujui</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>

        <div>
          <label htmlFor="leave-filter-start" className="app-label mb-1.5">
            Tanggal mulai
          </label>
          <input
            id="leave-filter-start"
            type="date"
            value={filters.startDate || ''}
            onChange={handleStartDateChange}
            disabled={isLoading}
            className="app-input"
          />
        </div>

        <div>
          <label htmlFor="leave-filter-end" className="app-label mb-1.5">
            Tanggal akhir
          </label>
          <input
            id="leave-filter-end"
            type="date"
            value={filters.endDate || ''}
            onChange={handleEndDateChange}
            disabled={isLoading}
            className="app-input"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={handleClearFilters}
            disabled={isLoading}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
          >
            Reset filter
          </button>
        </div>
      )}
    </Card>
  );
}
