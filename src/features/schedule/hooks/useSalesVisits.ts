import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesVisitApi } from '@/services/salesVisitApi';
import type { SalesVisitInput, SalesVisitUpdateInput, SalesVisitFilters } from '@/services/salesVisitApi';

const QUERY_KEY = ['sales-visits'] as const;

export const scheduleKeys = {
  all: QUERY_KEY,
  lists: () => [...QUERY_KEY, 'list'] as const,
  list: (filters: SalesVisitFilters) => [...QUERY_KEY, 'list', filters] as const,
  details: () => [...QUERY_KEY, 'detail'] as const,
  detail: (id: string) => [...QUERY_KEY, 'detail', id] as const,
};

/**
 * Get all sales visits for current user with pagination & filters
 */
export function useSalesVisits(filters?: SalesVisitFilters) {
  return useQuery({
    queryKey: scheduleKeys.list(filters || {}),
    queryFn: () => salesVisitApi.getAll(filters),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Get a single sales visit by ID
 */
export function useSalesVisitById(visitId: string) {
  return useQuery({
    queryKey: scheduleKeys.detail(visitId),
    queryFn: () => salesVisitApi.getById(visitId),
    enabled: !!visitId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Create a new sales visit
 */
export function useCreateSalesVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SalesVisitInput) => salesVisitApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
}

/**
 * Update an existing sales visit
 */
export function useUpdateSalesVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ visitId, data }: { visitId: string; data: SalesVisitUpdateInput }) =>
      salesVisitApi.update(visitId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
}

/**
 * Cancel a sales visit
 */
export function useCancelSalesVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ visitId, reason }: { visitId: string; reason?: string }) =>
      salesVisitApi.cancel(visitId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
}

/**
 * Delete a sales visit (PENDING only)
 */
export function useDeleteSalesVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (visitId: string) => salesVisitApi.delete(visitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
}
