import type {
  Attendance,
  AttendanceResponse,
  AttendanceQueryParams,
  AttendanceSummary,
} from "./types";
import type { AuditLog } from "@/modules/audit/types";
import { getAttendanceChanges } from "@/utils/diffAttendance";
import { addAuditLog, getEntityAuditLogs } from "@/modules/audit/api";

// Mock data with multi-tenant support
const mockAttendance: Attendance[] = [
  {
    id: "1",
    companyId: "company-1",
    userId: "user-1",
    name: "John Doe",
    date: "2026-02-22",
    checkIn: "08:05",
    checkOut: "17:02",
    status: "Present",
  },
  {
    id: "2",
    companyId: "company-1",
    userId: "user-2",
    name: "Jane Smith",
    date: "2026-02-22",
    checkIn: "08:00",
    checkOut: "17:00",
    status: "Present",
  },
  {
    id: "3",
    companyId: "company-1",
    userId: "user-3",
    name: "Bob Wilson",
    date: "2026-02-22",
    checkIn: "08:15",
    checkOut: "17:10",
    status: "Late",
  },
  {
    id: "4",
    companyId: "company-1",
    userId: "user-4",
    name: "Alice Brown",
    date: "2026-02-22",
    checkIn: "07:55",
    checkOut: "17:05",
    status: "Present",
  },
  {
    id: "5",
    companyId: "company-1",
    userId: "user-5",
    name: "Charlie Davis",
    date: "2026-02-22",
    checkIn: "-",
    checkOut: "-",
    status: "Absent",
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Parse unified sort param (e.g., "date_desc" → { key: "date", dir: "desc" })
 */
function parseSort(sort?: string): { key: string; dir: "asc" | "desc" } {
  if (!sort) return { key: "date", dir: "desc" };
  const [key = "date", dir = "desc"] = sort.split("_");
  return { key, dir: dir as "asc" | "desc" };
}

export const attendanceApi = {
  /**
   * Get attendance list with server-side pagination, sorting, filtering
   * Single source of truth - ready for real API replacement
   */
  async getAttendance(
    params: AttendanceQueryParams,
    companyId: string
  ): Promise<AttendanceResponse> {
    await delay(300); // Simulate network delay

    // Filter by companyId (multi-tenant)
    let filtered = mockAttendance.filter((item) => item.companyId === companyId);

    // Apply filters
    if (params.search) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(params.search!.toLowerCase())
      );
    }
    if (params.date) {
      filtered = filtered.filter((item) => item.date === params.date);
    }
    if (params.status) {
      filtered = filtered.filter((item) => item.status === params.status);
    }

    // Apply sorting using unified param
    const { key: sortKey, dir: sortDir } = parseSort(params.sort);
    filtered.sort((a, b) => {
      const aVal = String(a[sortKey as keyof Attendance] ?? "");
      const bVal = String(b[sortKey as keyof Attendance] ?? "");
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    // Apply pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / params.limit);
    const start = (params.page - 1) * params.limit;
    const data = filtered.slice(start, start + params.limit);

    return {
      data,
      total,
      page: params.page,
      limit: params.limit,
      totalPages,
    };
  },

  /**
   * Update attendance - with audit trail
   */
  async updateAttendance(
    id: string,
    updates: Partial<Attendance>,
    companyId: string,
    userId: string,
    userName: string
  ): Promise<Attendance> {
    await delay(500); // Simulate network delay

    const index = mockAttendance.findIndex(
      (item) => item.id === id && item.companyId === companyId
    );

    if (index === -1) {
      throw new Error("Attendance not found");
    }

    const oldItem = mockAttendance[index];
    const updated = { ...oldItem, ...updates };
    mockAttendance[index] = updated;

    // Create audit log entry
    const changes = getAttendanceChanges(oldItem, updated);
    if (changes.length > 0) {
      await addAuditLog({
        entityType: "attendance",
        entityId: id,
        entityName: updated.name,
        action: "update",
        changes,
        userId,
        userName,
        createdAt: new Date().toISOString(),
      });
    }

    return updated;
  },

  /**
   * Get single attendance by ID
   */
  async getAttendanceById(id: string, companyId: string): Promise<Attendance | null> {
    await delay(200);
    
    const record = mockAttendance.find(
      (item) => item.id === id && item.companyId === companyId
    );
    
    return record ?? null;
  },

  /**
   * Get audit logs for attendance record
   */
  async getAuditLogs(entityId: string): Promise<AuditLog[]> {
    await delay(100);
    // Use central audit API - filter by entity
    return getEntityAuditLogs("attendance", entityId);
  },

  /**
   * Get summary stats
   */
  async getSummary(companyId: string): Promise<AttendanceSummary> {
    await delay(200);

    const filtered = mockAttendance.filter((item) => item.companyId === companyId);

    return {
      present: filtered.filter((item) => item.status === "Present").length,
      late: filtered.filter((item) => item.status === "Late").length,
      absent: filtered.filter((item) => item.status === "Absent").length,
      total: filtered.length,
    };
  },
};
