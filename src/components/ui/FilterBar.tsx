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
    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search technician..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />

        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
        />

        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="">All Status</option>
          <option value="Present">Present</option>
          <option value="Late">Late</option>
          <option value="Absent">Absent</option>
        </select>
      </div>

      <button
        onClick={onExport}
        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-800 transition"
      >
        Export Excel
      </button>
    </div>
  );
}
