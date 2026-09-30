import type { ScheduleStatus, ScheduleFilters } from '@/shared/types/schedule';
import { Filter } from 'lucide-react';

type Props = {
  filters: ScheduleFilters;
  onFilterChange: (filters: ScheduleFilters) => void;
  technicians?: Array<{ id: string; name: string }>;
  locations?: Array<{ id: string; name: string }>;
};

const statusOptions: Array<{ value: ScheduleStatus; label: string }> = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function ScheduleFilters({
  filters,
  onFilterChange,
  technicians = [],
  locations = [],
}: Props) {
  const handleChange = (key: keyof ScheduleFilters, value: string) => {
    onFilterChange({ ...filters, [key]: value || undefined });
  };

  const fieldClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground " +
    "focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 " +
    "transition-all duration-200";

  return (
    <div className="rounded-xl bg-card border border-border shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-[var(--color-accent)]" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Filters
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">
            Technician
          </label>
          <div className="relative">
            <select
              value={filters.technicianId || ''}
              onChange={(e) => handleChange('technicianId', e.target.value)}
              className={`${fieldClass} appearance-none cursor-pointer pr-8`}
            >
              <option value="">All Technicians</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>{tech.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="h-3 w-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">
            Location
          </label>
          <div className="relative">
            <select
              value={filters.locationId || ''}
              onChange={(e) => handleChange('locationId', e.target.value)}
              className={`${fieldClass} appearance-none cursor-pointer pr-8`}
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="h-3 w-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">
            Status
          </label>
          <div className="relative">
            <select
              value={filters.status || ''}
              onChange={(e) => handleChange('status', e.target.value)}
              className={`${fieldClass} appearance-none cursor-pointer pr-8`}
            >
              <option value="">All Status</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="h-3 w-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">
            From Date
          </label>
          <input
            type="date"
            value={filters.dateFrom?.split('T')[0] || ''}
            onChange={(e) => handleChange('dateFrom', e.target.value)}
            className={fieldClass}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">
            To Date
          </label>
          <input
            type="date"
            value={filters.dateTo?.split('T')[0] || ''}
            onChange={(e) => handleChange('dateTo', e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>
    </div>
  );
}
