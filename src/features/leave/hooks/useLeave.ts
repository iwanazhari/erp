import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveApi } from '@/services/leaveApi';
import type { LeaveFilters, UpdateLeaveData } from '@/shared/types/leave';

/**
 * Leave Query Keys Factory
 *
 * Provides type-safe query keys for React Query caching
 */
export const leaveKeys = {
  all: ['leave'] as const,
  /** Leave list query key with filters */
  list: (filters: LeaveFilters) => [...leaveKeys.all, 'list', filters] as const,
  /** Edit history query key */
  editHistory: (leaveId: string) => [...leaveKeys.all, 'edit-history', leaveId] as const,
};

/**
 * Hook to fetch all leave requests with filters
 *
 * Uses GET /api/leave endpoint
 *
 * @param filters - Query parameters (page, pageSize, status, type, userId, startDate, endDate)
 * @returns Query result with leave data
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useLeaves({
 *   page: 1,
 *   pageSize: 20,
 *   status: 'PENDING',
 * });
 *
 * // data.leaves - Array of leave records
 * // data.pagination - Pagination info
 * ```
 */
export function useLeaves(filters: LeaveFilters = {}) {
  return useQuery({
    queryKey: leaveKeys.list(filters),
    queryFn: async () => {
      const response = await leaveApi.getAll(filters);
      return response.data;
    },
    select: (data) => {
      // Handle nested response structure
      if (data && 'leaves' in data && 'pagination' in data) {
        return data;
      }
      // If data is nested inside another data object
      if (data && (data as any).data) {
        return (data as any).data;
      }
      return data;
    },
  });
}

/**
 * Hook to update leave request
 *
 * Uses PUT /api/leave/:id endpoint
 *
 * @returns Mutation object with update function
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useUpdateLeave();
 *
 * mutate({
 *   leaveId: 'leave-uuid-123',
 *   updateData: {
 *     leaveStatus: 'APPROVED',
 *     editReason: 'Approved by manager',
 *   },
 * });
 * ```
 */
export function useUpdateLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { leaveId: string; updateData: UpdateLeaveData }) => {
      const response = await leaveApi.update(data.leaveId, data.updateData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate leave queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['leave'] });
    },
  });
}

/**
 * Hook to delete leave request
 *
 * Uses DELETE /api/leave/:id endpoint
 *
 * @returns Mutation object with delete function
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useDeleteLeave();
 *
 * mutate({
 *   leaveId: 'leave-uuid-123',
 * });
 * ```
 */
export function useDeleteLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leaveId: string) => {
      const response = await leaveApi.delete(leaveId);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate leave queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['leave'] });
    },
  });
}

/**
 * Hook to fetch leave edit history
 *
 * Uses GET /api/leave/:id/edit-history endpoint
 *
 * @param leaveId - Leave ID
 * @returns Query result with edit history
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useLeaveEditHistory('leave-uuid-123');
 *
 * // data.editHistory - Array of edit history entries
 * ```
 */
export function useLeaveEditHistory(leaveId: string) {
  return useQuery({
    queryKey: leaveKeys.editHistory(leaveId),
    queryFn: async () => {
      const response = await leaveApi.getEditHistory(leaveId);
      return response.data;
    },
    select: (data) => {
      // Handle nested response structure
      if (data && 'editHistory' in data) {
        return data;
      }
      // If data is nested inside another data object
      if (data && (data as any).data) {
        return (data as any).data;
      }
      return data;
    },
    enabled: !!leaveId,
  });
}
