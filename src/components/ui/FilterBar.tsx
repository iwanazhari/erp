import { Search, Download } from 'lucide-react';

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  onExport: () => void;
};

export default function FilterBar({
  search,
  onSearchChange,
  date,
  onDateChange,
  status,
  onStatusChange,
  onExport,
}: Props) {
  return (
    <div
      className="rounded-xl bg-card border border-border shadow-sm p-4
        flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
    >
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search technician..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full sm:w-64 rounded-lg border border-border bg-background px-4 py-2 pl-10 text-sm text-foreground
              placeholder:text-muted-foreground/50
              focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15
              transition-all duration-200"
          />
        </div>

        <div className="flex gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="flex-1 sm:flex-none rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground
              focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15
              transition-all duration-200"
          />

          <div className="relative flex-1 sm:flex-none">
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 pr-8 text-sm text-foreground
                focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15
                transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="">ALL STATUS</option>
              <option value="Present">PRESENT</option>
              <option value="Late">LATE</option>
              <option value="Absent">ABSENT</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="h-3 w-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onExport}
        className="inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-xl
          gradient-bg text-white shadow-[var(--shadow-accent)]
          px-4 py-2.5 min-h-[44px]
          hover:-translate-y-0.5 hover:shadow-[var(--shadow-accent-lg)] hover:brightness-110
          active:scale-[0.98]
          transition-all duration-200 focus:outline-none"
      >
        <Download className="h-4 w-4" />
        EXPORT
      </button>
    </div>
  );
}
