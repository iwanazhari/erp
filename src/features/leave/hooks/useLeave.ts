import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveApi } from '@/services/leaveApi';
import type { CreateLeaveInput } from '@/shared/types/leave';

export const leaveKeys = {
  all: ['leave'] as const,
  list: () => [...leaveKeys.all, 'list'] as const,
};

/**
 * GET /api/leave — daftar izin (filtering & paginasi dilakukan di klien).
 */
export function useLeaveList() {
  return useQuery({
    queryKey: leaveKeys.list(),
    queryFn: () => leaveApi.getList(),
  });
}

/** Daftar user untuk pemilihan pemohon (HR/Admin mengajukan untuk karyawan lain). */
export function useLeaveTargetUsers(enabled: boolean) {
  return useQuery({
    queryKey: [...leaveKeys.all, 'targetUsers'] as const,
    queryFn: () => leaveApi.getUsersForLeaveTarget(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLeaveInput) => leaveApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
    },
  });
}

export function useApproveLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leaveApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
    },
  });
}

export function useRejectLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leaveApi.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.all });
    },
  });
}

/** @deprecated gunakan useLeaveList */
export function useLeaves() {
  return useLeaveList();
}
