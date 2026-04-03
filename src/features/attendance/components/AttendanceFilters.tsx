import { useState } from 'react';
import type { AttendanceRecordsFilters } from '@/shared/types/attendance';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface AttendanceFiltersProps {
  filters: AttendanceRecordsFilters;
  onFilterChange: (filters: AttendanceRecordsFilters) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

export function AttendanceFilters({
  filters,
  onFilterChange,
  onSearch,
  isLoading,
}: AttendanceFiltersProps) {
  const [localFilters, setLocalFilters] = useState<AttendanceRecordsFilters>({ ...filters });

  const handleInputChange = (key: keyof AttendanceRecordsFilters, value: string) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onFilterChange(localFilters);
    onSearch();
  };

  const handleReset = () => {
    const emptyFilters: AttendanceRecordsFilters = {};
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <Card padding="sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="app-label mb-1">Tanggal mulai</label>
          <input
            type="date"
            value={localFilters.startDate || ''}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className="app-input"
          />
        </div>

        <div>
          <label className="app-label mb-1">Tanggal akhir</label>
          <input
            type="date"
            value={localFilters.endDate || ''}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            className="app-input"
          />
        </div>

        <div>
          <label className="app-label mb-1">Status</label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="app-select"
          >
            <option value="">Semua status</option>
            <option value="present">Hadir</option>
            <option value="late">Terlambat</option>
            <option value="leave">Cuti/izin</option>
            <option value="absent">Tidak hadir</option>
          </select>
        </div>

        <div>
          <label className="app-label mb-1">Status clock out</label>
          <select
            value={localFilters.clockOutStatus || ''}
            onChange={(e) => handleInputChange('clockOutStatus', e.target.value)}
            className="app-select"
          >
            <option value="">Semua status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="flex items-end gap-2">
          <Button
            type="button"
            variant="primary"
            className="flex-1"
            onClick={handleSearch}
            disabled={isLoading}
            leftIcon={
              isLoading ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              )
            }
          >
            {isLoading ? 'Memuat…' : 'Cari'}
          </Button>

          <Button type="button" variant="outline" onClick={handleReset} disabled={isLoading}>
            Reset
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default AttendanceFilters;
