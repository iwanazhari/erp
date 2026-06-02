import { useQuery } from '@tanstack/react-query';
import { liburDenoApi } from '@/services/liburDenoApi';
import { customHolidayApi } from '@/services/calendarApi';

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Hook to fetch Indonesian holidays for a specific year using libur.deno.dev API
 * Includes both national holidays and custom user-defined holidays
 * @param year - Year to fetch holidays for (default: current year)
 */
export function useHolidays(year: number = CURRENT_YEAR) {
  return useQuery({
    queryKey: ['holidays', year],
    queryFn: async () => {
      console.log('[useHolidays] Fetching holidays for year:', year);
      
      // Fetch national holidays from libur.deno.dev API
      const nationalHolidays = await liburDenoApi.getHolidays(year);
      
      console.log('[useHolidays] National holidays from libur.deno.dev:', nationalHolidays.length);
      console.log('[useHolidays] Sample national holidays:', nationalHolidays.slice(0, 3));

      // Fetch custom holidays from backend
      const customHolidays = await customHolidayApi.getAll(year);
      
      console.log('[useHolidays] Custom holidays from backend:', customHolidays.length);
      console.log('[useHolidays] Custom holidays raw:', customHolidays);

      // Convert custom holidays to Holiday format
      const customAsHolidays = customHolidays.map(custom => {
        const converted = {
          date: custom.date.split('T')[0], // Ensure YYYY-MM-DD format
          name: custom.name,
          nameId: custom.name_id ?? custom.name,
          description: custom.description,
          descriptionId: custom.description_id ?? custom.description,
          type: custom.override_national_holiday ? 'Working Day Override' : 'Custom',
          isCustom: true,
          id: custom.id,
          overrideNationalHoliday: custom.override_national_holiday || false,
        };
        console.log('[useHolidays] Converted custom holiday:', converted);
        return converted;
      });

      // Merge and remove duplicates
      // Working day overrides REMOVE the national holiday from the list
      // Regular custom holidays REPLACE the national holiday
      const merged = [...nationalHolidays];
      console.log('[useHolidays] Before merge - national holidays:', nationalHolidays.length);
      console.log('[useHolidays] Before merge - custom holidays:', customAsHolidays.length);
      
      customAsHolidays.forEach(custom => {
        // Normalize dates for comparison (remove time component)
        const customDate = custom.date.split('T')[0];
        const existingIndex = merged.findIndex(h => {
          const holidayDate = h.date.split('T')[0];
          return holidayDate === customDate;
        });
        
        console.log('[useHolidays] Processing custom:', { 
          date: customDate, 
          override: custom.overrideNationalHoliday,
          existingIndex 
        });
        
        if (custom.overrideNationalHoliday) {
          // Working day override: REMOVE the national holiday (make it a working day)
          if (existingIndex >= 0) {
            console.log('[useHolidays] ✅ Removing national holiday (working day override):', customDate);
            merged.splice(existingIndex, 1);
          } else {
            console.log('[useHolidays] ⚠️ Working day override but no national holiday found:', customDate);
          }
          // Don't add the override to the list - it's not a holiday!
        } else {
          // Regular custom holiday: REPLACE national holiday or ADD new
          if (existingIndex >= 0) {
            console.log('[useHolidays] 🔄 Replacing national holiday with custom:', customDate);
            merged[existingIndex] = custom;
          } else {
            console.log('[useHolidays] ➕ Adding new custom holiday:', customDate);
            merged.push(custom);
          }
        }
      });

      console.log('[useHolidays] After merge - total holidays:', merged.length);

      // Sort by date
      const sortedHolidays = merged.sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      console.log('[useHolidays] Total merged holidays:', sortedHolidays.length);

      return {
        holidays: sortedHolidays,
        year,
        country: 'Indonesia',
      };
    },
    staleTime: 0, // Always fetch fresh data - important for working day overrides
    retry: 2,
  });
}
