import { useQuery } from '@tanstack/react-query';
import { calendarApi, customHolidayApi } from '@/services/calendarApi';

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Hook to fetch Indonesian holidays for a specific year
 * Includes both API holidays and custom user-defined holidays
 * @param year - Year to fetch holidays for (default: current year)
 */
export function useHolidays(year: number = CURRENT_YEAR) {
  return useQuery({
    queryKey: ['holidays', year],
    queryFn: async () => {
      // Fetch API holidays
      const apiResponse = await calendarApi.getHolidaysByYear(year);
      
      // Merge with custom holidays from backend
      const mergedHolidays = await customHolidayApi.mergeWithApiHolidays(
        apiResponse.holidays,
        year
      );
      
      return {
        ...apiResponse,
        holidays: mergedHolidays,
      };
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - holidays don't change frequently
    retry: 2,
  });
}

/**
 * Hook to fetch Indonesian holidays for multiple years
 * @param years - Array of years to fetch
 */
export function useHolidaysMultiYear(years: number[]) {
  return useQuery({
    queryKey: ['holidays', 'multi', years],
    queryFn: () => calendarApi.getHolidaysByYears(years),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
  });
}

/**
 * Hook to get all available years from API
 */
export function useAvailableYears() {
  return useQuery({
    queryKey: ['holidays', 'available-years'],
    queryFn: () => calendarApi.getAvailableYears(),
    staleTime: 1000 * 60 * 60 * 24 * 7, // 1 week
    retry: 1,
  });
}
