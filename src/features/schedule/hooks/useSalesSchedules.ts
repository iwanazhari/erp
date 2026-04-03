import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleApi } from '@/services/scheduleApi';
import type { CreateScheduleInput, UpdateScheduleInput, ScheduleFilters } from '@/shared/types/schedule';
import { scheduleKeys } from './useSchedules';

const QUERY_KEY = ['sales-schedules'] as const;

function salesListFilters(filters?: ScheduleFilters): ScheduleFilters {
  return { ...filters, scheduleKind: 'SALES' };
}

/**
 * Daftar jadwal sales — memakai GET `/api/schedules?scheduleKind=SALES` (bukan router sales terpisah).
 */
export function useSalesSchedules(filters?: ScheduleFilters) {
  const merged = salesListFilters(filters);
  return useQuery({
    queryKey: [...QUERY_KEY, merged],
    queryFn: () => scheduleApi.getAll(merged),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useSalesScheduleById(scheduleId: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', scheduleId],
    queryFn: () => scheduleApi.getById(scheduleId),
    enabled: !!scheduleId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSalesSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateScheduleInput) => scheduleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
}

export function useUpdateSalesSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scheduleId, data }: { scheduleId: string; data: UpdateScheduleInput }) =>
      scheduleApi.update(scheduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
}

export function useCancelSalesSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleId: string) => scheduleApi.cancel(scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
}

export function useDeleteSalesSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleId: string) => scheduleApi.delete(scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
}

/**
 * Ketersediaan teknisi — tetap endpoint utama `/schedules/availability/...`.
 */
export function useCheckTechnicianAvailability(technicianId: string, date: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'availability', technicianId, date],
    queryFn: () => scheduleApi.checkAvailability(technicianId, date),
    enabled: !!technicianId && !!date,
    staleTime: 2 * 60 * 1000,
  });
}
