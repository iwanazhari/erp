import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { attendanceApi } from "./api";
import type {
  Attendance,
  AttendanceQueryParams,
  AttendanceResponse,
  AttendanceSummary,
} from "./types";
import type { AuditLog } from "@/modules/audit/types";
import { useUser } from "@/shared/UserContext";

// Query key factory - type safe and consistent
export const attendanceKeys = {
  all: ["attendance"] as const,
  lists: () => [...attendanceKeys.all, "list"] as const,
  list: (params: AttendanceQueryParams) =>
    [
      ...attendanceKeys.lists(),
      params.page,
      params.limit,
      params.search ?? "",
      params.date ?? "",
      params.status ?? "",
      params.sort ?? "",
    ] as const,
  summary: () => [...attendanceKeys.all, "summary"] as const,
};

/**
 * Query: Get attendance list with server-side pagination
 * Uses primitive values in queryKey for stability
 */
export function useAttendanceList(params: AttendanceQueryParams) {
  const { user } = useUser();
  const companyId = user?.companyId ?? "";

  return useQuery<AttendanceResponse, Error>({
    queryKey: attendanceKeys.list(params),
    queryFn: () => attendanceApi.getAttendance(params, companyId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: keepPreviousData, // Smooth pagination - keep old data while fetching
  });
}

function keepPreviousData<T>(previousData: T | undefined): T {
  return previousData ?? (undefined as unknown as T);
}

/**
 * Query: Get summary stats
 */
export function useAttendanceSummary() {
  const { user } = useUser();
  const companyId = user?.companyId ?? "";

  return useQuery<AttendanceSummary, Error>({
    queryKey: attendanceKeys.summary(),
    queryFn: () => attendanceApi.getSummary(companyId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Mutation: Update attendance with optimistic update + audit trail
 * - Instant UI feedback
 * - Rollback on error
 * - Auto invalidate on settle
 * - Audit logging
 */
export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const companyId = user?.companyId ?? "";
  const userId = user?.id ?? "";
  const userName = user?.name ?? "";

  return useMutation<Attendance, Error, { id: string; updates: Partial<Attendance> }>({
    mutationFn: ({ id, updates }) =>
      attendanceApi.updateAttendance(id, updates, companyId, userId, userName),

    // Optimistic update: instant UI feedback
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({
        queryKey: attendanceKeys.lists(),
      });
      await queryClient.cancelQueries({
        queryKey: ["attendance", "detail", id],
      });

      // Snapshot previous values for rollback (list + detail)
      const previousListQueries = new Map<string, Attendance[]>();
      let previousDetailQuery: Attendance | null = null;

      // Snapshot and update list queries
      const listQueries = queryClient.getQueriesData<{ data: Attendance[] }>({
        queryKey: attendanceKeys.lists(),
      });

      listQueries.forEach(([queryKey, data]) => {
        if (data && typeof data === "object" && "data" in data) {
          previousListQueries.set(String(queryKey), data.data);

          // Optimistically update the list cache
          queryClient.setQueryData(queryKey, (old: any) => {
            if (!old?.data) return old;
            return {
              ...old,
              data: old.data.map((item: Attendance) =>
                item.id === id ? { ...item, ...updates } : item
              ),
            };
          });
        }
      });

      // Snapshot and update detail query
      const detailQueryKey = ["attendance", "detail", id];
      const previousDetail = queryClient.getQueryData<Attendance | null>(detailQueryKey);
      if (previousDetail) {
        previousDetailQuery = previousDetail;
        queryClient.setQueryData(detailQueryKey, {
          ...previousDetail,
          ...updates,
        });
      }

      return { previousListQueries, previousDetailQuery };
    },

    // Rollback on error
    onError: (
      _err: Error,
      _variables: { id: string; updates: Partial<Attendance> },
      context: unknown
    ) => {
      const typedContext = context as { 
        previousListQueries: Map<string, Attendance[]>;
        previousDetailQuery: Attendance | null;
      } | undefined;
      
      if (typedContext?.previousListQueries) {
        typedContext.previousListQueries.forEach((data, _queryKeyStr) => {
          queryClient.setQueriesData<{ data: Attendance[] }>(
            { queryKey: attendanceKeys.lists() },
            (old) => {
              if (!old) return old;
              return { ...old, data };
            }
          );
        });
      }

      // Rollback detail query
      if (typedContext?.previousDetailQuery) {
        const detailQueryKey = ["attendance", "detail", _variables.id];
        queryClient.setQueryData(detailQueryKey, typedContext.previousDetailQuery);
      }
    },

    // Always refetch after mutation settles (success or error)
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.summary(),
      });
    },
  });
}

/**
 * Query: Get single attendance by ID
 */
export function useAttendanceById(id: string | null) {
  const { user } = useUser();
  const companyId = user?.companyId ?? "";

  return useQuery<Attendance | null, Error>({
    queryKey: ["attendance", "detail", id],
    queryFn: () => attendanceApi.getAttendanceById(id!, companyId),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Query: Get audit logs for specific attendance record
 */
export function useAuditLogs(entityId: string | null) {
  return useQuery<AuditLog[], Error>({
    queryKey: ["attendance", "audit", entityId],
    queryFn: () => attendanceApi.getAuditLogs(entityId!),
    enabled: !!entityId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}