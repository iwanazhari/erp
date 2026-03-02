import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAuditLogs,
  getEntityAuditLogs,
  addAuditLog,
  getRecentActivity,
} from "./api";
import type { AuditLog, AuditQueryParams } from "./types";

// Query key factory
export const auditKeys = {
  all: ["audit"] as const,
  lists: () => [...auditKeys.all, "list"] as const,
  list: (params: AuditQueryParams) => [...auditKeys.lists(), params] as const,
  entity: (entityType: string, entityId: string) =>
    [...auditKeys.all, "entity", entityType, entityId] as const,
  recent: (limit: number) => [...auditKeys.all, "recent", limit] as const,
};

/**
 * Query: Get audit logs with pagination/filtering
 */
export function useAuditLogs(params: AuditQueryParams = {}) {
  return useQuery<AuditLog[], Error>({
    queryKey: ["audit-feed", params],
    queryFn: () => getAuditLogs(params).then((res) => res.data),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Query: Get audit logs for specific entity
 */
export function useEntityAuditLogs(entityType: string, entityId: string | null) {
  return useQuery<AuditLog[], Error>({
    queryKey: auditKeys.entity(entityType, entityId!),
    queryFn: () => getEntityAuditLogs(entityType, entityId!),
    enabled: !!entityId,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Query: Get recent activity for dashboard
 */
export function useRecentActivity(limit: number = 10) {
  return useQuery<AuditLog[], Error>({
    queryKey: auditKeys.recent(limit),
    queryFn: () => getRecentActivity(limit),
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Mutation: Add audit log entry
 */
export function useAddAuditLog() {
  const queryClient = useQueryClient();

  return useMutation<AuditLog, Error, Omit<AuditLog, "id">>({
    mutationFn: addAuditLog,
    onSettled: () => {
      // Invalidate all audit queries
      queryClient.invalidateQueries({ queryKey: auditKeys.all });
    },
  });
}
