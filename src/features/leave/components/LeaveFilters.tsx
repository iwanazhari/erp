import type {
  LeaveFilters as LeaveFiltersType,
  AttendanceStatus,
  LeaveApprovalStatus,
} from '@/shared/types/leave';
import { Filter, RotateCcw } from 'lucide-react';

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
    onFilterChange({ ...filters, type: value || undefined, page: 1 });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as LeaveApprovalStatus | '';
    onFilterChange({ ...filters, status: value || undefined, page: 1 });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, startDate: e.target.value || undefined, page: 1 });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, endDate: e.target.value || undefined, page: 1 });
  };

  const handleClearFilters = () => {
    onFilterChange({ page: 1, pageSize: filters.pageSize || 20 });
  };

  const hasActiveFilters = filters.type || filters.status || filters.startDate || filters.endDate;

  const fieldClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground " +
    "focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 " +
    "transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="rounded-xl bg-card border border-border shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-[var(--color-accent)]" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Filters
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label htmlFor="leave-filter-type" className="text-xs font-medium text-foreground mb-1.5 block">
            Type
          </label>
          <div className="relative">
            <select
              id="leave-filter-type"
              value={filters.type || ''}
              onChange={handleTypeChange}
              disabled={isLoading}
              className={`${fieldClass} appearance-none cursor-pointer pr-8`}
            >
              <option value="">All</option>
              <option value="IZIN">Izin</option>
              <option value="SAKIT">Sakit</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="h-3 w-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="leave-filter-approval" className="text-xs font-medium text-foreground mb-1.5 block">
            Status
          </label>
          <div className="relative">
            <select
              id="leave-filter-approval"
              value={filters.status || ''}
              onChange={handleStatusChange}
              disabled={isLoading}
              className={`${fieldClass} appearance-none cursor-pointer pr-8`}
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="h-3 w-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="leave-filter-start" className="text-xs font-medium text-foreground mb-1.5 block">
            Start Date
          </label>
          <input
            id="leave-filter-start"
            type="date"
            value={filters.startDate || ''}
            onChange={handleStartDateChange}
            disabled={isLoading}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="leave-filter-end" className="text-xs font-medium text-foreground mb-1.5 block">
            End Date
          </label>
          <input
            id="leave-filter-end"
            type="date"
            value={filters.endDate || ''}
            onChange={handleEndDateChange}
            disabled={isLoading}
            className={fieldClass}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex justify-end border-t border-border pt-4">
          <button
            type="button"
            onClick={handleClearFilters}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RotateCcw className="h-3 w-3" />
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
