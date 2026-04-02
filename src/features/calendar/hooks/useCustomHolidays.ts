import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customHolidayApi } from '@/services/calendarApi';
import type { CreateCustomHolidayInputFull } from '@/shared/types/customHoliday';
import { useToast } from '@/components/ui/ToastContext';

/**
 * Hook to fetch all custom holidays
 */
export function useCustomHolidays(year?: number) {
  return useQuery({
    queryKey: ['custom-holidays', year],
    queryFn: () => customHolidayApi.getAll(year),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to create a new custom holiday
 */
export function useCreateCustomHoliday() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: CreateCustomHolidayInputFull) => customHolidayApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-holidays'] });
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      toast.success('Hari libur berhasil ditambahkan!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Gagal menambahkan hari libur';
      toast.error(message);
    },
  });
}

/**
 * Hook to update a custom holiday
 */
export function useUpdateCustomHoliday() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCustomHolidayInputFull> }) =>
      customHolidayApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-holidays'] });
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      toast.success('Hari libur berhasil diperbarui!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Gagal memperbarui hari libur';
      toast.error(message);
    },
  });
}

/**
 * Hook to delete a custom holiday
 */
export function useDeleteCustomHoliday() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => customHolidayApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-holidays'] });
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      toast.success('Hari libur berhasil dihapus!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Gagal menghapus hari libur';
      toast.error(message);
    },
  });
}
