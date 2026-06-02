import axios from 'axios';
import type { Holiday } from '@/shared/types/customHoliday';

/**
 * Libur.deno.dev API - Indonesian National Holidays
 * FREE API - No authentication required
 * Source: https://libur.deno.dev/
 * 
 * Data sourced from tanggalan.com - Official Indonesian government holiday data
 */
export const liburDenoApi = {
  /**
   * Base URL for libur.deno.dev API
   */
  baseUrl: 'https://libur.deno.dev/api',

  /**
   * Fetch holidays for a specific year and/or month
   * @param year - Year to fetch (optional, defaults to current year)
   * @param month - Month to fetch (1-12, optional)
   */
  getHolidays: async (year?: number, month?: number): Promise<Holiday[]> => {
    const params = new URLSearchParams();
    
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    
    const url = params.toString() 
      ? `${liburDenoApi.baseUrl}?${params}`
      : liburDenoApi.baseUrl;
    
    const response = await axios.get(url);
    
    // Convert API response to Holiday format
    // IMPORTANT: Append T00:00:00 to ensure date is interpreted in local timezone
    const holidays: Holiday[] = (response.data || []).map((holiday: any) => ({
      date: holiday.date + 'T00:00:00', // Ensure date is in local timezone
      name: holiday.name,
      nameId: holiday.name, // Use same name (already in Indonesian)
      description: holiday.name, // Use name as description if not provided
      descriptionId: holiday.name,
      type: 'Nasional',
      isCustom: false,
    }));

    return holidays;
  },

  /**
   * Check if a specific date is a holiday
   * @param date - Date to check (YYYY-MM-DD format or Date object)
   */
  checkDate: async (date: string | Date): Promise<{
    date: string;
    is_holiday: boolean;
    holiday_list: string[];
  }> => {
    const dateStr = date instanceof Date 
      ? date.toISOString().split('T')[0]
      : date;
    
    const [year, month, day] = dateStr.split('-');
    
    const response = await axios.get(
      `${liburDenoApi.baseUrl}?year=${year}&month=${month}&day=${day}`
    );
    
    return response.data;
  },

  /**
   * Check if today is a holiday
   */
  checkToday: async (): Promise<{
    date: string;
    is_holiday: boolean;
    holiday_list: string[];
  }> => {
    const response = await axios.get(`${liburDenoApi.baseUrl}/today`);
    return response.data;
  },

  /**
   * Check if tomorrow is a holiday
   */
  checkTomorrow: async (): Promise<{
    date: string;
    is_holiday: boolean;
    holiday_list: string[];
  }> => {
    const response = await axios.get(`${liburDenoApi.baseUrl}/tomorrow`);
    return response.data;
  },
};

export default liburDenoApi;
