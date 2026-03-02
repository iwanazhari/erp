import type { Attendance, AttendanceFilters } from "@/modules/attendance/types";

export function filterAttendance(
  data: Attendance[],
  filters: AttendanceFilters
): Attendance[] {
  return data.filter((item) => {
    // Search filter
    if (
      filters.search &&
      !item.name.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    // Date filter
    if (filters.date && item.date !== filters.date) {
      return false;
    }

    // Status filter
    if (filters.status && item.status !== filters.status) {
      return false;
    }

    return true;
  });
}

export function calculateSummary(data: Attendance[]) {
  return {
    present: data.filter((item) => item.status === "Present").length,
    late: data.filter((item) => item.status === "Late").length,
    absent: data.filter((item) => item.status === "Absent").length,
    total: data.length,
  };
}
