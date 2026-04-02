// Custom Holiday Types

export type CustomHolidayType = 'CUTI_BERSAMA' | 'LIBUR_PERUSAHAAN' | 'LIBUR_LAINNYA';

export type CustomHolidayTypeLabel = 'Cuti Bersama' | 'Libur Perusahaan' | 'Libur Lainnya';

// Mapping dari type ke label display
export const CUSTOM_HOLIDAY_TYPE_LABELS: Record<CustomHolidayType, CustomHolidayTypeLabel> = {
  'CUTI_BERSAMA': 'Cuti Bersama',
  'LIBUR_PERUSAHAAN': 'Libur Perusahaan',
  'LIBUR_LAINNYA': 'Libur Lainnya',
};

// Mapping dari label ke type
export const CUSTOM_HOLIDAY_TYPE_VALUES: Record<CustomHolidayTypeLabel, CustomHolidayType> = {
  'Cuti Bersama': 'CUTI_BERSAMA',
  'Libur Perusahaan': 'LIBUR_PERUSAHAAN',
  'Libur Lainnya': 'LIBUR_LAINNYA',
};

export interface Holiday {
  date: string;
  name: string;
  nameId: string; // Indonesian name
  description?: string;
  descriptionId?: string; // Indonesian description
  type: 'National' | 'Observance' | 'Bank Holiday' | 'Custom' | string;
  isCustom?: boolean; // Flag untuk custom holiday
  id?: string; // ID untuk custom holiday
}

export interface CustomHoliday {
  id: string;
  user_id: string;
  company_id: string | null;
  date: string; // ISO 8601 date (YYYY-MM-DD)
  name: string;
  name_id: string | null;
  description: string;
  description_id: string | null;
  type: CustomHolidayType;
  is_active: boolean;
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
  deleted_at: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  company?: {
    id: string;
    name: string;
  };
}

export interface CustomHolidayResponse {
  success: boolean;
  message: string;
  data: CustomHoliday | CustomHoliday[] | null;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateCustomHolidayInputFull {
  date: string; // YYYY-MM-DD
  name: string;
  name_id: string;
  description: string;
  description_id: string;
  type: CustomHolidayType;
}

export interface UpdateCustomHolidayInput {
  date?: string; // YYYY-MM-DD
  name?: string;
  name_id?: string;
  description?: string;
  description_id?: string;
  type?: CustomHolidayType;
  is_active?: boolean;
}

export interface GetHolidaysFilters {
  year?: number;
  month?: number;
  type?: CustomHolidayType;
  page?: number;
  limit?: number;
}

export interface HolidaysResponse {
  holidays: Holiday[];
  year: number;
  country: string;
}
