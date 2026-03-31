import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesScheduleApi } from '@/services/salesScheduleApi';
import type { CreateScheduleInput, UpdateScheduleInput, ScheduleFilters } from '@/shared/types/schedule';
import { useToast } from '@/components/ui/ToastContext';

const QUERY_KEY = ['sales-schedules'];

/**
 * Hook untuk fetch semua jadwal sales dengan pagination & filters
 */
export function useSalesSchedules(filters?: ScheduleFilters) {
  return useQuery({
    queryKey: [...QUERY_KEY, filters],
    queryFn: () => salesScheduleApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook untuk fetch detail jadwal by ID
 */
export function useSalesScheduleById(scheduleId: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', scheduleId],
    queryFn: () => salesScheduleApi.getById(scheduleId),
    enabled: !!scheduleId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook untuk create jadwal baru
 */
export function useCreateSalesSchedule() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: CreateScheduleInput) => salesScheduleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

/**
 * Hook untuk update jadwal
 */
export function useUpdateSalesSchedule() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ scheduleId, data }: { scheduleId: string; data: UpdateScheduleInput }) =>
      salesScheduleApi.update(scheduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

/**
 * Hook untuk cancel jadwal
 */
export function useCancelSalesSchedule() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ scheduleId, reason }: { scheduleId: string; reason?: string }) =>
      salesScheduleApi.cancel(scheduleId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

/**
 * Hook untuk delete jadwal
 */
export function useDeleteSalesSchedule() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (scheduleId: string) => salesScheduleApi.delete(scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

/**
 * Hook untuk cek ketersediaan technician
 */
export function useCheckTechnicianAvailability(technicianId: string, date: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'availability', technicianId, date],
    queryFn: () => salesScheduleApi.checkAvailability(technicianId, date),
    enabled: !!technicianId && !!date,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
