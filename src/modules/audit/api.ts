import { privateApi } from '@/services/authApi';
import type { AuditLog, AuditLogResponse, AuditQueryParams, EntityType } from './types';

// ================================================================
// BACKEND AUDIT LOG API
// ================================================================
// Memanggil backend API untuk audit log.
// Fallback ke mock in-memory jika backend tidak tersedia.
// ================================================================

// Fallback in-memory store (development / API unavailable)
let fallbackLogs: AuditLog[] = [];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const FALLBACK_ENABLED = import.meta.env.VITE_AUDIT_FALLBACK === 'true';

/**
 * Tentukan apakah akan menggunakan backend API atau fallback
 */
function shouldUseFallback(): boolean {
  if (FALLBACK_ENABLED) return true;
  // Jika tidak ada token, gunakan fallback
  return !localStorage.getItem('accessToken');
}

/**
 * Get audit logs with pagination and filtering
 * GET /api/audit?page=1&limit=20&entityType=attendance&entityId=xxx&userId=xxx
 */
export async function getAuditLogs(
  params: AuditQueryParams = {}
): Promise<AuditLogResponse> {
  if (shouldUseFallback()) {
    return getFallbackAuditLogs(params);
  }

  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', String(params.page));
    if (params.limit) queryParams.append('limit', String(params.limit));
    if (params.entityType) queryParams.append('entityType', params.entityType);
    if (params.entityId) queryParams.append('entityId', params.entityId);
    if (params.userId) queryParams.append('userId', params.userId);

    const response = await privateApi.get<{
      success: boolean;
      message?: string;
      data: AuditLog[];
      total: number;
      page: number;
      limit: number;
    }>(`/audit?${queryParams}`);

    // Backend sendResponse() spreads data at root level
    const body = response.data;
    return {
      data: body.data || [],
      total: body.total || 0,
      page: body.page || 1,
      limit: body.limit || 20,
    };
  } catch (error) {
    console.warn('[AUDIT] Backend unavailable, using fallback:', error);
    return getFallbackAuditLogs(params);
  }
}

/**
 * Get audit logs for a specific entity
 * GET /api/audit?entityType=xx&entityId=yy
 */
export async function getEntityAuditLogs(
  entityType: EntityType,
  entityId: string
): Promise<AuditLog[]> {
  const result = await getAuditLogs({ entityType, entityId, limit: 50 });
  return result.data;
}

/**
 * Create a new audit log entry
 * POST /api/audit
 */
export async function addAuditLog(
  log: Omit<AuditLog, 'id'>
): Promise<AuditLog> {
  if (shouldUseFallback()) {
    return addFallbackAuditLog(log);
  }

  try {
    const response = await privateApi.post<{
      success: boolean;
      message?: string;
      log: AuditLog;
    }>('/audit', {
      entityType: log.entityType,
      entityId: log.entityId,
      entityName: log.entityName,
      action: log.action,
      changes: log.changes,
    });

    const body = response.data;
    if (body.success && body.log) {
      return body.log;
    }
    throw new Error(body.message || 'Failed to create audit log');
  } catch (error) {
    console.warn('[AUDIT] Backend unavailable for create, using fallback:', error);
    return addFallbackAuditLog(log);
  }
}

/**
 * Clear all audit logs (development only)
 */
export function clearAuditLogs(): void {
  fallbackLogs = [];
}

/**
 * Get recent activity for dashboard
 * GET /api/audit/recent?limit=10
 */
export async function getRecentActivity(limit: number = 10): Promise<AuditLog[]> {
  if (shouldUseFallback()) {
    await delay(100);
    return fallbackLogs.slice(0, limit);
  }

  try {
    const response = await privateApi.get<{
      success: boolean;
      message?: string;
      logs: AuditLog[];
    }>(`/audit/recent?limit=${limit}`);

    const body = response.data;
    if (body.success && body.logs) {
      return body.logs;
    }
    return [];
  } catch (error) {
    console.warn('[AUDIT] Backend unavailable for recent activity, using fallback:', error);
    await delay(100);
    return fallbackLogs.slice(0, limit);
  }
}

// ================================================================
// FALLBACK: In-memory mock (development only)
// ================================================================

function getFallbackAuditLogs(params: AuditQueryParams = {}): AuditLogResponse {
  let filtered = [...fallbackLogs];

  if (params.entityType) {
    filtered = filtered.filter((log) => log.entityType === params.entityType);
  }
  if (params.entityId) {
    filtered = filtered.filter((log) => log.entityId === params.entityId);
  }
  if (params.userId) {
    filtered = filtered.filter((log) => log.userId === params.userId);
  }

  filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const total = filtered.length;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return { data, total, page, limit };
}

function addFallbackAuditLog(log: Omit<AuditLog, 'id'>): AuditLog {
  const id = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const newLog: AuditLog = { ...log, id };
  fallbackLogs = [newLog, ...fallbackLogs];
  return newLog;
}
