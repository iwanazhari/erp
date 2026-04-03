import axios from 'axios';
import type {
  CustomHoliday,
  CreateCustomHolidayInputFull,
  UpdateCustomHolidayInput,
  Holiday,
  HolidaysResponse,
} from '@/shared/types/customHoliday';

// API instance for custom holidays (backend)
const privateApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_PUBLIC_URL || 'https://worksy-production.up.railway.app'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
privateApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Translate holiday names to Indonesian
 */
const translateHolidayName = (name: string): string => {
  const translations: Record<string, string> = {
    "New Year's Day": 'Tahun Baru Masehi',
    'Eid al-Fitr': 'Hari Raya Idul Fitri',
    'Eid al-Adha': 'Hari Raya Idul Adha',
    'Islamic New Year': 'Tahun Baru Islam',
    'Prophet Muhammad\'s Birthday': 'Maulid Nabi Muhammad',
    'Ascension of the Prophet Muhammad': 'Isra Mi\'raj Nabi Muhammad',
    'Good Friday': 'Wafat Isa Al Masih',
    'Christmas Day': 'Hari Raya Natal',
    'Ascension Day': 'Kenaikan Isa Al Masih',
    'Vesak Day': 'Hari Raya Waisak',
    'Day of Silence': 'Hari Raya Nyepi',
    'Chinese New Year': 'Tahun Baru Imlek',
    'Tomb Sweeping Day': 'Hari Raya Qingming',
    'Labour Day': 'Hari Buruh Internasional',
    'Pancasila Day': 'Hari Lahir Pancasila',
    'Independence Day': 'Hari Kemerdekaan RI',
    'International Women\'s Day': 'Hari Perempuan Internasional',
    'International Children\'s Day': 'Hari Anak Internasional',
    'Mother\'s Day': 'Hari Ibu',
    'Heroes\' Day': 'Hari Pahlawan',
    'Youth Pledge Day': 'Hari Sumpah Pemuda',
    'Joint Leave': 'Cuti Bersama',
    'Collective Leave': 'Cuti Bersama',
  };
  
  // Check for exact match
  if (translations[name]) {
    return translations[name];
  }
  
  // Check for partial match
  for (const [en, id] of Object.entries(translations)) {
    if (name.toLowerCase().includes(en.toLowerCase())) {
      return id;
    }
  }
  
  // Return original if no translation found
  return name;
};

/**
 * Translate holiday descriptions to Indonesian
 */
const translateHolidayDescription = (description: string | undefined): string | undefined => {
  if (!description) return undefined;
  
  const translations: Record<string, string> = {
    'International Workers\'s Day': 'Hari Buruh Internasional',
    'Celebrates Buddha\'s birth, enlightenment, and death': 'Merayakan kelahiran, pencerahan, dan kematian Buddha',
    'Commemorates Jesus Christ\'s ascension to heaven': 'Memperingati kenaikan Yesus Kristus ke surga',
    'Festival of Sacrifice': 'Hari Raya Kurban',
    'Eid al-Adha': 'Hari Raya Idul Adha',
    '1447 Hijri': '1447 Hijriah',
    '1448 Hijri': '1448 Hijriah',
    'Saka New Year': 'Tahun Baru Saka',
    'Chinese New Year': 'Tahun Baru Imlek',
    'Year of the Horse': 'Tahun Kuda',
    'Year of the Goat': 'Tahun Kambing',
    'Year of the Monkey': 'Tahun Monyet',
    'Year of the Rooster': 'Tahun Ayam',
    'Year of the Dog': 'Tahun Anjing',
    'Year of the Pig': 'Tahun Babi',
    'Year of the Rat': 'Tahun Tikus',
    'Year of the Ox': 'Tahun Kerbau',
    'Year of the Tiger': 'Tahun Macan',
    'Year of the Rabbit': 'Tahun Kelinci',
    'Year of the Dragon': 'Tahun Naga',
    'Year of the Snake': 'Tahun Ular',
    'New Year': 'Tahun Baru',
    'Birthday of Prophet Muhammad': 'Hari Lahir Nabi Muhammad',
    'Birth of Buddha': 'Kelahiran Buddha',
    'Jesus Christ\'s ascension': 'Kenaikan Yesus Kristus',
    'Workers\'s Day': 'Hari Buruh',
    'Independence': 'Kemerdekaan',
    'Christmas': 'Natal',
    'Eid': 'Idul',
  };
  
  // Check for exact match
  if (translations[description]) {
    return translations[description];
  }
  
  // Check for partial match and translate
  let translatedDesc = description;
  for (const [en, id] of Object.entries(translations)) {
    const regex = new RegExp(en, 'gi');
    translatedDesc = translatedDesc.replace(regex, id);
  }
  
  return translatedDesc;
};

/**
 * Calendar API - Fetch Indonesian holidays from Tallyfy API
 * FREE API - No authentication required
 * Source: https://tallyfy.com/national-holidays/
 */
export const calendarApi = {
  /**
   * Fetch holidays for a specific year
   * @param year - Year to fetch (2026-2030)
   */
  getHolidaysByYear: async (year: number): Promise<HolidaysResponse> => {
    const url = `https://tallyfy.com/national-holidays/api/ID/${year}.json`;
    const response = await axios.get(url);
    
    // Translate holiday names and descriptions to Indonesian
    const translatedHolidays = (response.data.holidays || []).map((holiday: any) => ({
      ...holiday,
      nameId: translateHolidayName(holiday.name),
      descriptionId: translateHolidayDescription(holiday.description),
      isCustom: false,
    }));
    
    return {
      holidays: translatedHolidays,
      year,
      country: 'Indonesia',
    };
  },

  /**
   * Fetch holidays for multiple years
   * @param years - Array of years to fetch
   */
  getHolidaysByYears: async (years: number[]): Promise<Holiday[]> => {
    const requests = years.map(year => calendarApi.getHolidaysByYear(year));
    const results = await Promise.all(requests);
    return results.flatMap(result => result.holidays);
  },

  /**
   * Get all available years (index)
   */
  getAvailableYears: async (): Promise<number[]> => {
    const url = `https://tallyfy.com/national-holidays/api/ID/index.json`;
    const response = await axios.get(url);
    // Extract years from available years list
    return response.data.availableYears || [];
  },

  /**
   * Check if a specific date is a holiday
   * @param date - Date to check (YYYY-MM-DD format)
   * @param holidays - Array of holidays to check against
   */
  isHoliday: (date: string, holidays: Holiday[]): Holiday | undefined => {
    return holidays.find(holiday => holiday.date === date);
  },

  /**
   * Get holidays for a specific month
   * @param year - Year
   * @param month - Month (0-11, where 0 is January)
   * @param holidays - Array of all holidays
   */
  getHolidaysInMonth: (year: number, month: number, holidays: Holiday[]): Holiday[] => {
    const monthStr = (month + 1).toString().padStart(2, '0');
    const prefix = `${year}-${monthStr}`;
    return holidays.filter(holiday => holiday.date.startsWith(prefix));
  },
};

/**
 * Custom Holidays API - Backend integration
 * For user-defined holidays with reasons
 */
export const customHolidayApi = {
  /**
   * Get all custom holidays for a year
   */
  getAll: async (year?: number): Promise<CustomHoliday[]> => {
    const params: Record<string, string> = {};
    if (year) params.year = year.toString();
    
    const response = await privateApi.get('/custom-holidays', { params });
    const data = response.data.data || response.data;
    
    // Handle nested structure { customHolidays: [...] }
    const holidays = data.customHolidays || data || [];
    
    console.log('Custom holidays raw:', holidays);
    
    // Convert camelCase to snake_case for consistency
    const converted = holidays.map((h: any) => ({
      ...h,
      user_id: h.userId || h.user_id,
      company_id: h.companyId || h.company_id,
      name_id: h.nameId || h.name_id,
      description_id: h.descriptionId || h.description_id,
      is_active: h.isActive || h.is_active,
      created_at: h.createdAt || h.created_at,
      updated_at: h.updatedAt || h.updated_at,
      deleted_at: h.deletedAt || h.deleted_at,
    }));
    
    console.log('Custom holidays converted:', converted);
    
    return converted;
  },

  /**
   * Create a new custom holiday
   */
  create: async (data: CreateCustomHolidayInputFull): Promise<CustomHoliday> => {
    const response = await privateApi.post('/custom-holidays', data);
    return response.data.data || response.data;
  },

  /**
   * Update a custom holiday
   */
  update: async (id: string, data: UpdateCustomHolidayInput): Promise<CustomHoliday> => {
    const response = await privateApi.put(`/custom-holidays/${id}`, data);
    return response.data.data || response.data;
  },

  /**
   * Delete a custom holiday
   */
  delete: async (id: string): Promise<void> => {
    await privateApi.delete(`/custom-holidays/${id}`);
  },

  /**
   * Merge custom holidays with API holidays
   */
  mergeWithApiHolidays: async (apiHolidays: Holiday[], year?: number): Promise<Holiday[]> => {
    try {
      const customHolidays = await customHolidayApi.getAll(year);
      
      console.log('API holidays:', apiHolidays.length);
      console.log('Custom holidays:', customHolidays.length);
      
      // Convert custom holidays to Holiday format (handle both camelCase and snake_case)
      const customAsHolidays: Holiday[] = customHolidays.map(custom => ({
        date: custom.date.split('T')[0], // Ensure YYYY-MM-DD format
        name: custom.name,
        nameId: custom.name_id ?? custom.name,
        description: custom.description,
        descriptionId: custom.description_id ?? custom.description,
        type: 'Custom',
        isCustom: true,
        id: custom.id,
      }));
      
      console.log('Custom as holidays:', customAsHolidays);
      
      // Merge and remove duplicates (custom holidays take precedence)
      const merged = [...apiHolidays];
      customAsHolidays.forEach(custom => {
        const existingIndex = merged.findIndex(h => h.date.startsWith(custom.date));
        console.log('Checking date:', custom.date, 'found at:', existingIndex);
        if (existingIndex >= 0) {
          console.log('Replacing holiday at', custom.date);
          merged[existingIndex] = custom; // Replace with custom
        } else {
          console.log('Adding new holiday at', custom.date);
          merged.push(custom); // Add new
        }
      });
      
      // Sort by date
      return merged.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
      console.error('Failed to fetch custom holidays:', error);
      return apiHolidays; // Return only API holidays if custom fetch fails
    }
  },
};
