import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleApi, locationApi, userApi } from '@/services/scheduleApi';
import type {
  ScheduleFilters,
  LocationFilters,
  CreateScheduleInput,
  UpdateScheduleInput,
  CreateLocationInput,
  UpdateLocationInput,
} from '@/shared/types/schedule';

// Query keys
export const scheduleKeys = {
  all: ['schedules'] as const,
  lists: () => [...scheduleKeys.all, 'list'] as const,
  list: (filters: ScheduleFilters) => [...scheduleKeys.lists(), filters] as const,
  details: () => [...scheduleKeys.all, 'detail'] as const,
  detail: (id: string) => [...scheduleKeys.details(), id] as const,
  availability: (technicianId: string, date: string) =>
    [...scheduleKeys.all, 'availability', technicianId, date] as const,
};

export const locationKeys = {
  all: ['locations'] as const,
  lists: () => [...locationKeys.all, 'list'] as const,
  list: (filters: LocationFilters) => [...locationKeys.lists(), filters] as const,
  details: () => [...locationKeys.all, 'detail'] as const,
  detail: (id: string) => [...locationKeys.details(), id] as const,
};

// Schedule Hooks
export function useSchedules(filters: ScheduleFilters = {}) {
  return useQuery({
    queryKey: scheduleKeys.list(filters),
    queryFn: () => scheduleApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSchedule(scheduleId: string) {
  return useQuery({
    queryKey: scheduleKeys.detail(scheduleId),
    queryFn: () => scheduleApi.getById(scheduleId),
    enabled: !!scheduleId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateScheduleInput) => scheduleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      queryClient.invalidateQueries({ queryKey: locationKeys.all });
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scheduleId, data }: { scheduleId: string; data: UpdateScheduleInput }) =>
      scheduleApi.update(scheduleId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(data.data.id) });
      queryClient.invalidateQueries({ queryKey: locationKeys.all });
    },
  });
}

export function useCancelSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleId: string) => scheduleApi.cancel(scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleId: string) => scheduleApi.delete(scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
}

export function useBulkCreateSchedules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schedules: CreateScheduleInput[]) => scheduleApi.bulkCreate(schedules),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
}

export function useTechnicianAvailability(technicianId: string | undefined, date: string | undefined) {
  return useQuery({
    queryKey: scheduleKeys.availability(technicianId || '', date || ''),
    queryFn: () => scheduleApi.checkAvailability(technicianId!, date!),
    enabled: !!technicianId && !!date,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useTechnicianSchedules(technicianId: string | undefined) {
  return useQuery({
    queryKey: [...scheduleKeys.all, 'technician', technicianId],
    queryFn: () => scheduleApi.getTechnicianSchedules(technicianId!),
    enabled: !!technicianId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLocationSchedules(locationId: string | undefined) {
  return useQuery({
    queryKey: [...scheduleKeys.all, 'location', locationId],
    queryFn: () => scheduleApi.getLocationSchedules(locationId!),
    enabled: !!locationId,
    staleTime: 5 * 60 * 1000,
  });
}

// Location Hooks
export function useLocations(filters: LocationFilters = {}) {
  return useQuery({
    queryKey: locationKeys.list(filters),
    queryFn: () => locationApi.getAll(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLocation(locationId: string) {
  return useQuery({
    queryKey: locationKeys.detail(locationId),
    queryFn: () => locationApi.getById(locationId),
    enabled: !!locationId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLocationInput) => locationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.all });
    },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ locationId, data }: { locationId: string; data: UpdateLocationInput }) =>
      locationApi.update(locationId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: locationKeys.all });
      queryClient.invalidateQueries({ queryKey: locationKeys.detail(data.data.id) });
    },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (locationId: string) => locationApi.delete(locationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.all });
    },
  });
}

// User/Technician Hooks
export function useTechnicians() {
  return useQuery({
    queryKey: ['technicians'],
    queryFn: () => userApi.getTechnicians(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSales() {
  return useQuery({
    queryKey: ['sales'],
    queryFn: () => userApi.getSales(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
