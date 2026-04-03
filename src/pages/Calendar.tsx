import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import PageContainer from '@/components/ui/PageContainer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
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
      className={`mt-1 w-full cursor-help truncate px-1 text-xs font-semibold ${
        isCustom ? 'text-slate-600' : 'text-indigo-700'
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
        <Card padding="md" className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-800">
                {formatDate(selectedDate)}
              </h2>
              {isHoliday(selectedDate) && (
                <div className="mt-3 space-y-2">
                  <div
                    className={`flex items-center gap-3 ${
                      isCustomHoliday(selectedDate) ? 'text-slate-700' : 'text-indigo-800'
                    }`}
                  >
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
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isCustomHoliday(selectedDate)
                            ? 'bg-slate-100 text-slate-800 ring-1 ring-slate-200/80'
                            : 'bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200/80'
                        }`}
                      >
                        {getHolidayForDate(selectedDate)?.type}
                      </span>
                      {isCustomHoliday(selectedDate) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomHoliday(getHolidayForDate(selectedDate)!)}
                          disabled={deleteMutation.isPending}
                          className="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                          title="Hapus hari libur custom"
                        >
                          Hapus
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
          <div className="border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant={showAddForm ? 'outline' : 'primary'}
              leftIcon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Batal' : 'Tambah hari libur'}
            </Button>
          </div>
        </Card>

        {/* Add Holiday Form */}
        {showAddForm && (
          <Card padding="md">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Tambah hari libur custom</h3>
            <form onSubmit={handleAddCustomHoliday} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="app-label mb-1">
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="app-input"
                    required
                  />
                </div>

                <div>
                  <label className="app-label mb-1">
                    Tipe <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={customTypeLabel}
                    onChange={(e) => setCustomTypeLabel(e.target.value as CustomHolidayTypeLabel)}
                    className="app-select"
                    required
                  >
                    {Object.entries(CUSTOM_HOLIDAY_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={label}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="app-label mb-1">
                  Nama hari libur <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Contoh: Libur akhir tahun, cuti bersama Lebaran"
                  className="app-input"
                  required
                />
              </div>

              <div>
                <label className="app-label mb-1">
                  Alasan / deskripsi <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Jelaskan alasan hari libur ini (contoh: mengganti tanggal libur yang jatuh pada akhir pekan)"
                  rows={3}
                  className="app-input min-h-[5rem]"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Menyimpan…' : 'Simpan hari libur'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Calendar */}
        <Card padding="lg" className="p-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
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
                  <div className="h-6 w-6 rounded border-2 border-indigo-200 bg-indigo-50" />
                  <span className="font-medium text-slate-700">Hari libur nasional</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded border-2 border-slate-200 bg-slate-50" />
                  <span className="font-medium text-slate-700">Custom (user)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded border-2 border-slate-200 bg-slate-50/80" />
                  <span className="font-medium text-slate-700">Akhir pekan</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded bg-indigo-600" />
                  <span className="font-medium text-slate-700">Tanggal dipilih</span>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Holidays List for Selected Month */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
                    className={`flex items-start gap-4 px-6 py-4 transition-colors ${
                      isCustom ? 'bg-slate-50/80 hover:bg-slate-100/90' : 'bg-indigo-50/30 hover:bg-indigo-50/50'
                    }`}
                  >
                    <div
                      className={`mt-1.5 h-3 w-3 flex-shrink-0 rounded-full ${
                        isCustom ? 'bg-slate-500' : 'bg-indigo-600'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <p
                          className={`text-base font-semibold ${
                            isCustom ? 'text-slate-900' : 'text-slate-900'
                          }`}
                        >
                          {holiday.nameId}
                        </p>
                        {holiday.descriptionId && (
                          <span className="text-xs text-slate-500 italic">
                            ({holiday.descriptionId})
                          </span>
                        )}
                        {isCustom && (
                          <span className="text-xs font-semibold text-slate-600">• Custom</span>
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
                      <span
                        className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold ${
                          isCustom
                            ? 'bg-slate-100 text-slate-800 ring-1 ring-slate-200/80'
                            : 'bg-indigo-50 text-indigo-900 ring-1 ring-indigo-200/80'
                        }`}
                      >
                        {holiday.type}
                      </span>
                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomHoliday(holiday)}
                          disabled={deleteMutation.isPending}
                          className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
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
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setViewYear((prev) => prev - 1)}
          >
            ← Tahun sebelumnya
          </Button>
          <span className="min-w-[120px] text-center text-2xl font-bold text-slate-800">{viewYear}</span>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setViewYear((prev) => prev + 1)}
          >
            Tahun berikutnya →
          </Button>
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
          background: #eef2ff !important;
          border-radius: 8px !important;
        }

        .react-calendar__tile--active {
          background: #4f46e5 !important;
          color: white !important;
          border-radius: 8px !important;
        }
        
        .react-calendar__tile--active .react-calendar__tile__label {
          color: white !important;
        }

        .holiday-tile {
          background-color: #eef2ff !important;
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
          background-color: #4f46e5;
          border-radius: 50%;
        }

        .custom-holiday-tile {
          background-color: #f8fafc !important;
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
          background-color: #64748b;
          border-radius: 50%;
        }

        .weekend-tile {
          background-color: #f9fafb !important;
          color: #64748b !important;
          border-radius: 8px !important;
        }
        
        .react-calendar__tile:enabled:hover {
          background-color: #f3f4f6 !important;
          border-radius: 8px !important;
        }
        
        .react-calendar__tile--active:enabled:hover {
          background-color: #4338ca !important;
          border-radius: 8px !important;
        }
        
        .react-calendar__navigation button:enabled:hover {
          background-color: #f3f4f6 !important;
          border-radius: 8px !important;
        }
        
        .react-calendar__tile--hasActive {
          background: #4f46e5 !important;
          color: white !important;
        }
      `}</style>
    </PageContainer>
  );
}
