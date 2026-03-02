import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import PageContainer from "@/components/ui/PageContainer";
import AttendanceTable from "@/components/attendance/AttendanceTable";
import AttendanceDrawer from "@/components/attendance/AttendanceDrawer";
import FilterBar from "@/components/ui/FilterBar";
import {
  useAttendanceList,
  useAttendanceSummary,
  useUpdateAttendance,
  useAttendanceById,
} from "@/modules/attendance/hooks";
import type { Attendance, AttendanceQueryParams } from "@/modules/attendance/types";
import { useUser } from "@/shared/UserContext";

interface AttendancePageProps {
  initialPage?: number;
  initialSearch?: string;
  initialDate?: string;
  initialStatus?: string;
  initialSort?: string;
  initialOpenId?: string | null;
  onParamsChange?: (params: Record<string, unknown>) => void;
}

export default function AttendancePage({
  initialPage = 1,
  initialSearch = "",
  initialDate = "",
  initialStatus = "",
  initialSort = "date_desc",
  initialOpenId,
  onParamsChange,
}: AttendancePageProps) {
  const navigate = useNavigate();
  const { user, canEdit, canViewAudit, canQuickEditStatus, switchRole } = useUser();

  // Client-side state for filters
  const [search, setSearch] = useState(initialSearch);
  const [date, setDate] = useState(initialDate);
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(initialPage);
  const [sort, setSort] = useState(initialSort);

  // Unified query params
  const queryParams: AttendanceQueryParams = useMemo(
    () => ({
      page,
      limit: 10,
      search: search || undefined,
      date: date || undefined,
      status: status || undefined,
      sort,
    }),
    [page, search, date, status, sort]
  );

  // Server-state hooks
  const {
    data: attendanceData,
    isFetching,
  } = useAttendanceList(queryParams);

  const { data: summary } = useAttendanceSummary();
  const updateMutation = useUpdateAttendance();
  
  // Fetch attendance detail by ID when deep-linking
  const { data: attendanceDetail, isLoading: isLoadingDetail } = useAttendanceById(initialOpenId ?? null);

  // UI state
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [notFound, setNotFound] = useState(false);

  // Auto-open drawer when detail is loaded
  useEffect(() => {
    if (attendanceDetail) {
      setSelectedAttendance(attendanceDetail);
      setMode("view");
      setNotFound(false);
    } else if (initialOpenId && !isLoadingDetail) {
      // Record not found - show not found state
      setNotFound(true);
    }
  }, [attendanceDetail, initialOpenId, isLoadingDetail]);

  // Sync URL params
  useEffect(() => {
    onParamsChange?.({
      page,
      search,
      date,
      status,
      sort,
    });
  }, [page, search, date, status, sort, onParamsChange]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, date, status]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedAttendance) {
        setSelectedAttendance(null);
        setMode("view");
      }
      if (e.key === "e" && selectedAttendance && mode === "view" && canEdit) {
        setMode("edit");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s" && mode === "edit") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("attendance-save"));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedAttendance, mode, canEdit]);

  const handleRowClick = (item: Attendance) => {
    setSelectedAttendance(item);
    setMode("view");
  };

  const handleQuickStatusChange = (id: string, statusValue: "Present" | "Late" | "Absent") => {
    if (!canQuickEditStatus) return;
    updateMutation.mutate({ id, updates: { status: statusValue } });
  };

  const handleSave = (updated: Attendance) => {
    updateMutation.mutate(
      { id: updated.id, updates: updated },
      {
        onSuccess: () => {
          setSelectedAttendance(null);
          setMode("view");
        },
      }
    );
  };

  const handleClose = () => {
    setSelectedAttendance(null);
    setMode("view");
    // Clean URL when drawer closes
    navigate({
      to: "/attendance",
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        open: undefined,
      }),
    });
  };

  const handleExport = () => {
    console.log("Export Excel", attendanceData?.data);
  };

  const paginatedData = attendanceData?.data ?? [];
  const totalPages = attendanceData?.totalPages ?? 1;
  const totalRecords = attendanceData?.total ?? 0;
  const isSaving = updateMutation.isPending;

  // Handle sort click - toggle direction or change column
  const handleSort = (column: string) => {
    const [currentKey, currentDir] = sort.split("_");
    if (currentKey === column) {
      // Toggle direction
      setSort(`${column}_${currentDir === "asc" ? "desc" : "asc"}`);
    } else {
      // New column, default to desc
      setSort(`${column}_desc`);
    }
  };

  return (
    <PageContainer title="Attendance">
      {/* Role Switcher for Demo */}
      <div className="mb-4 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
        <span>Role:</span>
        <select
          value={user?.role}
          onChange={(e) =>
            switchRole(e.target.value as "admin" | "supervisor" | "technician")
          }
          className="border border-slate-200 rounded px-2 py-1"
        >
          <option value="admin">Admin</option>
          <option value="supervisor">Supervisor</option>
          <option value="technician">Technician</option>
        </select>
        <span className={canEdit ? "text-emerald-600" : "text-red-600"}>
          {canEdit ? "✓ Edit" : "✕ Edit"}
        </span>
        <span className={canQuickEditStatus ? "text-emerald-600" : "text-red-600"}>
          {canQuickEditStatus ? "✓ Quick" : "✕ Quick"}
        </span>
        <span className={canViewAudit ? "text-emerald-600" : "text-red-600"}>
          {canViewAudit ? "✓ Audit" : "✕ Audit"}
        </span>
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        date={date}
        onDateChange={setDate}
        status={status}
        onStatusChange={setStatus}
        onExport={handleExport}
      />

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <p className="text-sm text-emerald-600 font-medium">Present</p>
          <p className="text-2xl font-bold text-emerald-700">{summary?.present ?? 0}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <p className="text-sm text-amber-600 font-medium">Late</p>
          <p className="text-2xl font-bold text-amber-700">{summary?.late ?? 0}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <p className="text-sm text-red-600 font-medium">Absent</p>
          <p className="text-2xl font-bold text-red-700">{summary?.absent ?? 0}</p>
        </div>
      </div>

      <div className="mt-4">
        <AttendanceTable
          data={paginatedData}
          selectedId={selectedAttendance?.id ?? null}
          onRowClick={handleRowClick}
          onQuickStatusChange={canEdit ? handleQuickStatusChange : undefined}
          isFetching={isFetching}
          savingId={updateMutation.isPending ? updateMutation.variables.id : null}
          sort={sort}
          onSort={handleSort}
          canQuickEdit={canQuickEditStatus}
          openId={initialOpenId}
        />

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-slate-600">
            Showing {paginatedData.length} of {totalRecords} results
            {totalPages > 1 && ` (Page ${page} of ${totalPages})`}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1 || isFetching}
              className="px-4 py-2 text-sm border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages || isFetching}
              className="px-4 py-2 text-sm border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <AttendanceDrawer
        selectedAttendance={selectedAttendance}
        mode={mode}
        onClose={handleClose}
        onEdit={() => setMode("edit")}
        onSave={handleSave}
        isSaving={isSaving}
        canEdit={canEdit}
        notFound={notFound}
      />
    </PageContainer>
  );
}
