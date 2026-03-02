import type { AuditLog, AuditLogResponse, AuditQueryParams } from "./types";

// Central audit log store - mock database
let auditLogs: AuditLog[] = [];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get audit logs with pagination and filtering
 */
export async function getAuditLogs(
  params: AuditQueryParams = {}
): Promise<AuditLogResponse> {
  await delay(100);

  let filtered = [...auditLogs];

  // Filter by entity type
  if (params.entityType) {
    filtered = filtered.filter((log) => log.entityType === params.entityType);
  }

  // Filter by entity ID
  if (params.entityId) {
    filtered = filtered.filter((log) => log.entityId === params.entityId);
  }

  // Filter by user ID
  if (params.userId) {
    filtered = filtered.filter((log) => log.userId === params.userId);
  }

  // Sort by createdAt descending (newest first)
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Pagination
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const total = filtered.length;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return {
    data,
    total,
    page,
    limit,
  };
}

/**
 * Get audit logs for specific entity
 */
export async function getEntityAuditLogs(
  entityType: string,
  entityId: string
): Promise<AuditLog[]> {
  await delay(100);
  return auditLogs
    .filter((log) => log.entityType === entityType && log.entityId === entityId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Add new audit log entry
 */
export async function addAuditLog(log: Omit<AuditLog, "id">): Promise<AuditLog> {
  await delay(50);

  const id = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const newLog: AuditLog = { ...log, id };

  // Add to beginning of array (newest first)
  auditLogs = [newLog, ...auditLogs];

  return newLog;
}

/**
 * Clear all audit logs (for demo reset)
 */
export function clearAuditLogs(): void {
  auditLogs = [];
}

/**
 * Get recent activity (for dashboard)
 */
export async function getRecentActivity(limit: number = 10): Promise<AuditLog[]> {
  await delay(100);
  return auditLogs.slice(0, limit);
}
