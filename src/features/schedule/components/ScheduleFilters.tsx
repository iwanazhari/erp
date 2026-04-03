import type { ScheduleStatus, ScheduleFilters } from '@/shared/types/schedule';

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
    onFilterChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Technician Filter */}
      <div>
        <label className="app-label mb-1 text-xs font-medium text-slate-600">
          Teknisi
        </label>
        <select
          value={filters.technicianId || ''}
          onChange={(e) => handleChange('technicianId', e.target.value)}
          className="app-select"
        >
          <option value="">Semua Teknisi</option>
          {technicians.map((tech) => (
            <option key={tech.id} value={tech.id}>
              {tech.name}
            </option>
          ))}
        </select>
      </div>

      {/* Location Filter */}
      <div>
        <label className="app-label mb-1 text-xs font-medium text-slate-600">
          Lokasi
        </label>
        <select
          value={filters.locationId || ''}
          onChange={(e) => handleChange('locationId', e.target.value)}
          className="app-select"
        >
          <option value="">Semua Lokasi</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div>
        <label className="app-label mb-1 text-xs font-medium text-slate-600">
          Status
        </label>
        <select
          value={filters.status || ''}
          onChange={(e) => handleChange('status', e.target.value)}
          className="app-select"
        >
          <option value="">Semua Status</option>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Date Range Filter */}
      <div>
        <label className="app-label mb-1 text-xs font-medium text-slate-600">
          Dari tanggal
        </label>
        <input
          type="date"
          value={filters.dateFrom?.split('T')[0] || ''}
          onChange={(e) => handleChange('dateFrom', e.target.value)}
          className="app-input"
        />
      </div>

      <div>
        <label className="app-label mb-1 text-xs font-medium text-slate-600">
          Sampai tanggal
        </label>
        <input
          type="date"
          value={filters.dateTo?.split('T')[0] || ''}
          onChange={(e) => handleChange('dateTo', e.target.value)}
          className="app-input"
        />
      </div>
    </div>
  );
}
