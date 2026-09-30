import axios from 'axios';
import type { Holiday } from '@/shared/types/customHoliday';

const BACKEND_URL = import.meta.env.VITE_API_PUBLIC_URL || '';

export const liburDenoApi = {
  getHolidays: async (year?: number, month?: number): Promise<Holiday[]> => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());

    const url = params.toString()
      ? `${BACKEND_URL}/holidays/libur?${params.toString()}`
      : `${BACKEND_URL}/holidays/libur`;

    const response = await axios.get(url);

    const holidays: Holiday[] = (response.data || []).map((holiday: any) => ({
      date: holiday.date + 'T00:00:00',
      name: holiday.name,
      nameId: holiday.name,
      description: holiday.name,
      descriptionId: holiday.name,
      type: 'Nasional',
      isCustom: false,
    }));

    return holidays;
  },

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
      `${BACKEND_URL}/holidays/libur?year=${year}&month=${month}&day=${day}`
    );
    return response.data;
  },

  checkToday: async (): Promise<{
    date: string;
    is_holiday: boolean;
    holiday_list: string[];
  }> => {
    const today = new Date().toISOString().split('T')[0];
    return liburDenoApi.checkDate(today);
  },

  checkTomorrow: async (): Promise<{
    date: string;
    is_holiday: boolean;
    holiday_list: string[];
  }> => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    return liburDenoApi.checkDate(tomorrow);
  },
};

export default liburDenoApi;
