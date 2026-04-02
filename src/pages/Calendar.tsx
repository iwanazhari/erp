import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import PageContainer from '@/components/ui/PageContainer';
import { useToast } from '@/components/ui/ToastContext';
import { useHolidays } from '@/features/calendar/hooks/useHolidays';
import {
  useCreateCustomHoliday,
  useDeleteCustomHoliday,
} from '@/features/calendar/hooks/useCustomHolidays';
import type { Holiday, CreateCustomHolidayInputFull, CustomHolidayTypeLabel } from '@/shared/types/customHoliday';
import { CUSTOM_HOLIDAY_TYPE_LABELS, CUSTOM_HOLIDAY_TYPE_VALUES } from '@/shared/types/customHoliday';

// Tile content component to show holiday indicator
function HolidayTile({ date, holidays }: { date: Date; holidays: Holiday[] }) {
  const dateStr = date.toISOString().split('T')[0];
  const holiday = holidays.find(h => h.date === dateStr);

  if (!holiday) return null;

  const isCustom = holiday.isCustom || holiday.type === 'Custom';

  return (
    <div
      className={`text-xs mt-1 font-semibold truncate w-full px-1 cursor-help ${
        isCustom ? 'text-amber-600' : 'text-red-600'
      }`}
      title={holiday.descriptionId ? `${holiday.nameId} - ${holiday.descriptionId}` : holiday.nameId}
    >
      {holiday.nameId}
    </div>
  );
}

export default function CalendarPage() {
  const toast = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewYear, setViewYear] = useState<number>(new Date().getFullYear());
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [customDate, setCustomDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customName, setCustomName] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [customTypeLabel, setCustomTypeLabel] = useState<CustomHolidayTypeLabel>('Cuti Bersama');

  const { data: holidaysData, isLoading, error } = useHolidays(viewYear);
  const holidays = holidaysData?.holidays || [];

  const createMutation = useCreateCustomHoliday();
  const deleteMutation = useDeleteCustomHoliday();

  // Get holiday for a specific date
  const getHolidayForDate = (date: Date): Holiday | undefined => {
    const dateStr = date.toISOString().split('T')[0];
    return holidays.find(h => h.date === dateStr);
  };

  // Check if date is a holiday
  const isHoliday = (date: Date): boolean => {
    return getHolidayForDate(date) !== undefined;
  };

  // Check if holiday is custom
  const isCustomHoliday = (date: Date): boolean => {
    const holiday = getHolidayForDate(date);
    return holiday?.isCustom || holiday?.type === 'Custom' || false;
  };

  // Handle add custom holiday
  const handleAddCustomHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customName.trim() || !customDescription.trim()) {
      toast.error('Nama dan alasan hari libur wajib diisi');
      return;
    }

    const holidayData: CreateCustomHolidayInputFull = {
      date: customDate,
      name: customName,
      name_id: customName, // Use same name for Indonesian
      description: customDescription,
      description_id: customDescription, // Use same description for Indonesian
      type: CUSTOM_HOLIDAY_TYPE_VALUES[customTypeLabel],
    };

    createMutation.mutate(holidayData, {
      onSuccess: () => {
        resetForm();
        setShowAddForm(false);
      },
    });
  };

  // Handle delete custom holiday
  const handleDeleteCustomHoliday = async (holiday: Holiday) => {
    if (!holiday.id) return;
    
    if (!confirm(`Hapus hari libur "${holiday.nameId}"?`)) return;
    
    deleteMutation.mutate(holiday.id);
  };

  // Reset form
  const resetForm = () => {
    setCustomDate(new Date().toISOString().split('T')[0]);
    setCustomName('');
    setCustomDescription('');
    setCustomTypeLabel('Cuti Bersama');
    setShowAddForm(false);
  };

  // Custom class name for tiles
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const holiday = getHolidayForDate(date);
      if (holiday) {
        const isCustom = holiday.isCustom || holiday.type === 'Custom';
        return isCustom ? 'custom-holiday-tile' : 'holiday-tile';
      }
      // Check if it's a weekend
      const day = date.getDay();
      if (day === 0 || day === 6) {
        return 'weekend-tile';
      }
    }
    return undefined;
  };

  // Format date to Indonesian locale
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get holidays in current month view
  const getHolidaysInMonth = (year: number, month: number) => {
    const monthStr = (month + 1).toString().padStart(2, '0');
    const prefix = `${year}-${monthStr}`;
    return holidays.filter(h => h.date.startsWith(prefix));
  };

  return (
    <PageContainer title="Kalender Hari Libur">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-800">
                {formatDate(selectedDate)}
              </h2>
              {isHoliday(selectedDate) && (
                <div className="mt-3 space-y-2">
                  <div className={`flex items-center gap-3 ${isCustomHoliday(selectedDate) ? 'text-amber-600' : 'text-red-600'}`}>
                    <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-bold text-lg">
                      {getHolidayForDate(selectedDate)?.nameId}
                    </span>
                  </div>
                  {getHolidayForDate(selectedDate)?.descriptionId && (
                    <p className="text-sm text-slate-600 italic ml-9">
                      {getHolidayForDate(selectedDate)?.descriptionId}
                    </p>
                  )}
                  {getHolidayForDate(selectedDate)?.type && (
                    <div className="ml-9 flex items-center gap-2">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        isCustomHoliday(selectedDate)
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {getHolidayForDate(selectedDate)?.type}
                      </span>
                      {isCustomHoliday(selectedDate) && (
                        <button
                          onClick={() => handleDeleteCustomHoliday(getHolidayForDate(selectedDate)!)}
                          disabled={deleteMutation.isPending}
                          className="text-amber-600 hover:text-amber-800 text-xs font-medium"
                          title="Hapus hari libur custom"
                        >
                          🗑️ Hapus
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-base font-medium text-slate-600">Tahun {viewYear}</p>
              <p className="text-sm text-slate-500">{holidays.length} hari libur</p>
            </div>
          </div>

          {/* Add Holiday Button */}
          <div className="border-t pt-4">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {showAddForm ? 'Batal' : 'Tambah Hari Libur'}
            </button>
          </div>
        </div>

        {/* Add Holiday Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Tambah Hari Libur Custom</h3>
            <form onSubmit={handleAddCustomHoliday} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tipe <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={customTypeLabel}
                    onChange={(e) => setCustomTypeLabel(e.target.value as CustomHolidayTypeLabel)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  >
                    {Object.entries(CUSTOM_HOLIDAY_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={label}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama Hari Libur <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Contoh: Libur Akhir Tahun, Cuti Bersama Lebaran"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Alasan / Deskripsi <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Jelaskan alasan hari libur ini (contoh: Mengganti tanggal libur yang jatuh pada akhir pekan)"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? 'Menyimpan...' : 'Simpan Hari Libur'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Calendar */}
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              <p className="font-bold text-lg">Gagal memuat data hari libur</p>
              <p className="text-base mt-2">Silakan coba lagi nanti</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Calendar
                onChange={(value) => {
                  if (value instanceof Date) {
                    setSelectedDate(value);
                    setViewYear(value.getFullYear());
                  }
                }}
                value={selectedDate}
                view="month"
                locale="id-ID"
                tileClassName={tileClassName}
                tileContent={({ date, view }) => {
                  if (view === 'month') {
                    return <HolidayTile date={date} holidays={holidays} />;
                  }
                  return null;
                }}
                formatMonthYear={(_locale, date) =>
                  date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
                }
                formatShortWeekday={(_locale, date) =>
                  date.toLocaleDateString('id-ID', { weekday: 'short' })
                }
                prev2Label={null}
                next2Label={null}
                className="w-full max-w-3xl"
              />

              {/* Legend */}
              <div className="mt-8 flex flex-wrap gap-8 text-base">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-100 border-2 border-red-300 rounded"></div>
                  <span className="text-slate-700 font-medium">Hari Libur Nasional</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-amber-100 border-2 border-amber-300 rounded"></div>
                  <span className="text-slate-700 font-medium">Custom (User)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-50 border-2 border-gray-200 rounded"></div>
                  <span className="text-slate-700 font-medium">Akhir Pekan</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-600 rounded"></div>
                  <span className="text-slate-700 font-medium">Tanggal Dipilih</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Holidays List for Selected Month */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-800">
              Hari Libur Bulan Ini
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {getHolidaysInMonth(
              selectedDate.getFullYear(),
              selectedDate.getMonth()
            ).length === 0 ? (
              <div className="px-6 py-10 text-center text-slate-500">
                <p className="font-medium">Tidak ada hari libur bulan ini</p>
              </div>
            ) : (
              getHolidaysInMonth(
                selectedDate.getFullYear(),
                selectedDate.getMonth()
              ).map((holiday, index) => {
                const isCustom = holiday.isCustom || holiday.type === 'Custom';
                return (
                  <div
                    key={holiday.id || index}
                    className={`px-6 py-4 flex items-start gap-4 transition-colors ${
                      isCustom ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${
                      isCustom ? 'bg-amber-500' : 'bg-red-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className={`font-bold text-base ${
                          isCustom ? 'text-amber-800' : 'text-slate-800'
                        }`}>
                          {holiday.nameId}
                        </p>
                        {holiday.descriptionId && (
                          <span className="text-xs text-slate-500 italic">
                            ({holiday.descriptionId})
                          </span>
                        )}
                        {isCustom && (
                          <span className="text-xs font-semibold text-amber-600">
                            • Custom
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-1.5">
                        {new Date(holiday.date).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1.5 text-sm font-semibold rounded-full whitespace-nowrap ${
                        isCustom
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {holiday.type}
                      </span>
                      {isCustom && (
                        <button
                          onClick={() => handleDeleteCustomHoliday(holiday)}
                          disabled={deleteMutation.isPending}
                          className="text-amber-600 hover:text-amber-800 p-1"
                          title="Hapus hari libur custom"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Year Navigation */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => setViewYear(prev => prev - 1)}
            className="px-6 py-3 text-base font-semibold text-slate-700 bg-white border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-xl transition-all"
          >
            ← Tahun Sebelumnya
          </button>
          <span className="text-2xl font-bold text-slate-800 min-w-[120px] text-center">
            {viewYear}
          </span>
          <button
            onClick={() => setViewYear(prev => prev + 1)}
            className="px-6 py-3 text-base font-semibold text-slate-700 bg-white border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-xl transition-all"
          >
            Tahun Berikutnya →
          </button>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .react-calendar {
          width: 100% !important;
          max-width: 900px !important;
          font-family: inherit !important;
          border: none !important;
        }
        
        .react-calendar__navigation {
          margin-bottom: 16px !important;
        }
        
        .react-calendar__navigation button {
          font-size: 18px !important;
          font-weight: 600 !important;
          min-width: 44px !important;
          height: 44px !important;
        }
        
        .react-calendar__month-view__weekdays {
          font-size: 16px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
        }
        
        .react-calendar__tile {
          font-size: 16px !important;
          padding: 8px !important;
          height: 80px !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: flex-start !important;
        }
        
        .react-calendar__tile__label {
          font-size: 20px !important;
          font-weight: 500 !important;
        }

        .react-calendar__tile--now {
          background: #dbeafe !important;
          border-radius: 8px !important;
        }

        .react-calendar__tile--active {
          background: #2563eb !important;
          color: white !important;
          border-radius: 8px !important;
        }
        
        .react-calendar__tile--active .react-calendar__tile__label {
          color: white !important;
        }

        .holiday-tile {
          background-color: #fef2f2 !important;
          position: relative;
          border-radius: 8px !important;
        }

        .holiday-tile::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 10px;
          height: 10px;
          background-color: #dc2626;
          border-radius: 50%;
        }

        .custom-holiday-tile {
          background-color: #fef3c7 !important;
          position: relative;
          border-radius: 8px !important;
        }

        .custom-holiday-tile::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 10px;
          height: 10px;
          background-color: #d97706;
          border-radius: 50%;
        }

        .weekend-tile {
          background-color: #f9fafb !important;
          color: #dc2626 !important;
          border-radius: 8px !important;
        }
        
        .react-calendar__tile:enabled:hover {
          background-color: #f3f4f6 !important;
          border-radius: 8px !important;
        }
        
        .react-calendar__tile--active:enabled:hover {
          background-color: #1d4ed8 !important;
          border-radius: 8px !important;
        }
        
        .react-calendar__navigation button:enabled:hover {
          background-color: #f3f4f6 !important;
          border-radius: 8px !important;
        }
        
        .react-calendar__tile--hasActive {
          background: #2563eb !important;
          color: white !important;
        }
      `}</style>
    </PageContainer>
  );
}
