import type { LeaveFilters as LeaveFiltersType, LeaveStatus, LeaveApprovalStatus } from '@/shared/types/leave';

type Props = {
  filters: LeaveFiltersType;
  onFilterChange: (filters: LeaveFiltersType) => void;
  isLoading?: boolean;
};

/**
 * Leave Filters Component
 *
 * Provides filter controls for leave list:
 * - Search by employee name
 * - Leave type (IZIN, SAKIT, ALPA)
 * - Approval status (PENDING, APPROVED, REJECTED)
 * - Date range
 */
export default function LeaveFilters({
  filters,
  onFilterChange,
  isLoading = false,
}: Props) {
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as LeaveStatus | '';
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Leave Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipe Cuti
          </label>
          <select
            value={filters.type || ''}
            onChange={handleTypeChange}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
          >
            <option value="">Semua Tipe</option>
            <option value="IZIN">Izin</option>
            <option value="SAKIT">Sakit</option>
            <option value="ALPA">Alpa</option>
          </select>
        </div>

        {/* Approval Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status Approval
          </label>
          <select
            value={filters.status || ''}
            onChange={handleStatusChange}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
          >
            <option value="">Semua Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Start Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Mulai
          </label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={handleStartDateChange}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
          />
        </div>

        {/* End Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Akhir
          </label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={handleEndDateChange}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
          />
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleClearFilters}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
