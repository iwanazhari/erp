import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import QuickStatusEdit from "@/components/ui/QuickStatusEdit";
import type { Attendance } from "@/modules/attendance/types";

type Props = {
  data: Attendance[];
  selectedId: string | null;
  onRowClick: (item: Attendance) => void;
  onQuickStatusChange?: (id: string, status: "Present" | "Late" | "Absent") => void;
  isFetching?: boolean;
  savingId?: string | null;
  sort?: string;
  onSort?: (column: string) => void;
  canQuickEdit?: boolean;
  openId?: string | null; // For highlighting deep-linked record
};

export default function AttendanceTable({
  data,
  selectedId,
  onRowClick,
  onQuickStatusChange,
  isFetching = false,
  savingId = null,
  sort = "date_desc",
  onSort,
  canQuickEdit = true,
  openId,
}: Props) {
  // Loading state - show skeleton on first load
  if (!data || data.length === 0) {
    if (isFetching) {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 p-4 border-b border-slate-100">
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-4 bg-slate-200 rounded w-1/6" />
                <div className="h-4 bg-slate-200 rounded w-1/6" />
                <div className="h-4 bg-slate-200 rounded w-1/6" />
                <div className="h-4 bg-slate-200 rounded w-1/6" />
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <EmptyState
        title="No attendance found"
        description="Try adjusting your filters to find what you're looking for."
        customIcon={
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        }
      />
    );
  }

  const [sortKey, sortDir] = sort.split("_");

  const SortIcon = ({ column }: { column: string }) => {
    if (sortKey !== column)
      return <span className="w-4 h-4 inline-block ml-1 opacity-30">↕</span>;
    return (
      <span className="w-4 h-4 inline-block ml-1">
        {sortDir === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
      {/* Fetching indicator */}
      {isFetching && (
        <div className="absolute top-2 right-2 text-xs text-slate-400 flex items-center gap-1">
          <div className="animate-spin h-3 w-3 border-2 border-slate-300 border-t-slate-600 rounded-full" />
          Updating...
        </div>
      )}

      <table className="min-w-full text-sm text-left">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th
              className="px-4 py-3 font-medium text-slate-600 cursor-pointer hover:bg-slate-100 transition select-none"
              onClick={() => onSort?.("name")}
            >
              Name <SortIcon column="name" />
            </th>
            <th
              className="px-4 py-3 font-medium text-slate-600 cursor-pointer hover:bg-slate-100 transition select-none"
              onClick={() => onSort?.("date")}
            >
              Date <SortIcon column="date" />
            </th>
            <th
              className="px-4 py-3 font-medium text-slate-600 cursor-pointer hover:bg-slate-100 transition select-none"
              onClick={() => onSort?.("checkIn")}
            >
              Check In <SortIcon column="checkIn" />
            </th>
            <th
              className="px-4 py-3 font-medium text-slate-600 cursor-pointer hover:bg-slate-100 transition select-none"
              onClick={() => onSort?.("checkOut")}
            >
              Check Out <SortIcon column="checkOut" />
            </th>
            <th
              className="px-4 py-3 font-medium text-slate-600 cursor-pointer hover:bg-slate-100 transition select-none"
              onClick={() => onSort?.("status")}
            >
              Status <SortIcon column="status" />
            </th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => {
            const isSaving = savingId === item.id;
            const isOpened = openId === item.id;
            return (
              <tr
                key={item.id}
                onClick={() => !isSaving && onRowClick(item)}
                className={`border-b border-slate-100 transition-all duration-150 cursor-pointer group ${
                  selectedId === item.id
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : "hover:bg-slate-50 border-l-4 border-l-transparent"
                } ${isSaving ? "opacity-50 pointer-events-none" : ""} ${
                  isOpened ? "ring-2 ring-indigo-500 ring-inset" : ""
                }`}
              >
                <td className="px-4 py-3 text-slate-700 group-hover:text-slate-900">
                  <div className="flex items-center gap-2">
                    {item.name}
                    {isSaving && (
                      <div className="animate-spin h-3 w-3 border-2 border-slate-400 border-t-slate-600 rounded-full" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-700 group-hover:text-slate-900">
                  {item.date}
                </td>
                <td className="px-4 py-3 text-slate-700 group-hover:text-slate-900">
                  {item.checkIn}
                </td>
                <td className="px-4 py-3 text-slate-700 group-hover:text-slate-900">
                  {item.checkOut}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {canQuickEdit && onQuickStatusChange && !isSaving ? (
                    <QuickStatusEdit
                      status={item.status}
                      onChange={(newStatus) => {
                        onQuickStatusChange(item.id, newStatus);
                      }}
                    />
                  ) : (
                    <StatusBadge status={item.status} />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
