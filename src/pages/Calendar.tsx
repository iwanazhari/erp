import { useState } from 'react';
import { motion } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import PageContainer from '@/components/ui/PageContainer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/ToastContext';
import { useHolidays } from '@/features/calendar/hooks/useHolidays';
import { customHolidayApi } from '@/services/calendarApi';
import { fadeUp, stagger } from '@/lib/animations';
import type { Holiday, CreateCustomHolidayInputFull, CustomHolidayTypeLabel } from '@/shared/types/customHoliday';
import { CUSTOM_HOLIDAY_TYPE_LABELS, CUSTOM_HOLIDAY_TYPE_VALUES } from '@/shared/types/customHoliday';

function HolidayTile({ date, holidays }: { date: Date; holidays: Holiday[] }) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  const holiday = holidays.find(h =>
    h.date.startsWith(dateStr) && !h.overrideNationalHoliday
  );

  if (!holiday) return null;

  const isCustom = holiday.isCustom || holiday.type === 'Custom';

  return (
    <div
      className={`mt-1 w-full cursor-help truncate px-1 text-xs font-semibold ${
        isCustom
          ? 'text-foreground bg-muted rounded'
          : 'text-accent'
      }`}
      title={`${holiday.nameId}${holiday.descriptionId ? ' - ' + holiday.descriptionId : ''} (${isCustom ? 'Custom' : 'Nasional'})`}
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
  const [togglingDate, setTogglingDate] = useState<string | null>(null);

  const [customDate, setCustomDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customName, setCustomName] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [customTypeLabel, setCustomTypeLabel] = useState<CustomHolidayTypeLabel>('Cuti Bersama');

  const { data: holidaysData, isLoading, error, refetch } = useHolidays(viewYear);
  const holidays = holidaysData?.holidays || [];

  console.log('[Calendar] Holidays loaded:', holidays.length);

  const getHolidayForDate = (date: Date): Holiday | undefined => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    return holidays.find(h =>
      h.date.startsWith(dateStr) && !h.overrideNationalHoliday
    );
  };

  const handleToggleWorkingDay = async (date: string, isHoliday: boolean) => {
    const dateObj = new Date(date);
    const formattedDate = dateObj.toISOString().split('T')[0];

    const nationalHoliday = getHolidayForDate(dateObj);
    const isNationalHoliday = nationalHoliday && !nationalHoliday.isCustom;

    if (isHoliday) {
      if (!confirm('Ubah tanggal ini menjadi hari kerja? Tanggal libur akan dihapus.')) return;
    } else {
      if (!confirm('Ubah tanggal ini menjadi hari libur?')) return;
    }

    setTogglingDate(formattedDate);
    try {
      const payload: any = {
        date: formattedDate,
        type: 'LIBUR_PERUSAHAAN',
      };

      if (isNationalHoliday) {
        payload.name = `Working Day: ${nationalHoliday?.name}`;
        payload.description = `${nationalHoliday?.name} dijadikan hari kerja`;
        payload.isWorkingDayOverride = true;
      } else {
        payload.name = isHoliday ? undefined : 'Libur Perusahaan';
        payload.description = isHoliday ? undefined : 'Libur perusahaan';
      }

      await customHolidayApi.toggleWorkingDay(payload);

      toast.success(isHoliday ? 'Tanggal berhasil diubah menjadi hari kerja' : 'Tanggal berhasil diubah menjadi hari libur');

      await refetch();
    } catch (error: any) {
      console.error('Toggle error:', error);
      toast.error(error.response?.data?.message || error.response?.data || 'Gagal toggle tanggal');
    } finally {
      setTogglingDate(null);
    }
  };

  const isHoliday = (date: Date): boolean => {
    return getHolidayForDate(date) !== undefined;
  };

  const isCustomHoliday = (date: Date): boolean => {
    const holiday = getHolidayForDate(date);
    return holiday?.isCustom || holiday?.type === 'Custom' || false;
  };

  const handleAddCustomHoliday = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customName.trim() || !customDescription.trim()) {
      toast.error('Nama dan alasan hari libur wajib diisi');
      return;
    }

    const holidayData: CreateCustomHolidayInputFull = {
      date: customDate,
      name: customName,
      name_id: customName,
      description: customDescription,
      description_id: customDescription,
      type: CUSTOM_HOLIDAY_TYPE_VALUES[customTypeLabel],
    };

    try {
      await customHolidayApi.create(holidayData);
      toast.success('Hari libur berhasil ditambahkan');
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menambah hari libur');
    }
  };

  const handleDeleteCustomHoliday = async (holiday: Holiday) => {
    if (!holiday.id) return;

    if (!confirm(`Hapus hari libur "${holiday.nameId}"?`)) return;

    try {
      await customHolidayApi.delete(holiday.id);
      toast.success('Hari libur berhasil dihapus');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus hari libur');
    }
  };

  const resetForm = () => {
    setCustomDate(new Date().toISOString().split('T')[0]);
    setCustomName('');
    setCustomDescription('');
    setCustomTypeLabel('Cuti Bersama');
    setShowAddForm(false);
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const holiday = getHolidayForDate(date);
      if (holiday) {
        const isCustom = holiday.isCustom || holiday.type === 'Custom';
        return isCustom ? 'custom-holiday-tile' : 'holiday-tile';
      }
      const day = date.getDay();
      if (day === 0 || day === 6) {
        return 'weekend-tile';
      }
    }
    return undefined;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getHolidaysInMonth = (year: number, month: number) => {
    const monthStr = (month + 1).toString().padStart(2, '0');
    const prefix = `${year}-${monthStr}`;
    return holidays.filter(h =>
      h.date.startsWith(prefix) && !h.overrideNationalHoliday
    );
  };

  const typeBadgeVariant = (type: string) => {
    if (type === 'Custom' || type === 'LIBUR_PERUSAHAAN') return 'default';
    if (type === 'CUTI_BERSAMA') return 'info';
    return 'info';
  };

  return (
    <PageContainer title="Kalender Hari Libur">
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
        {/* Header Info */}
        <motion.div variants={fadeUp}>
        <Card padding="md" className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">
                {formatDate(selectedDate)}
              </h2>
              {isHoliday(selectedDate) && (
                <div className="mt-3 space-y-2">
                  <div
                    className={`flex items-center gap-3 ${
                      isCustomHoliday(selectedDate) ? 'text-foreground' : 'text-accent'
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
                    <p className="text-sm text-muted-foreground italic ml-9">
                      {getHolidayForDate(selectedDate)?.descriptionId}
                    </p>
                  )}
                  {getHolidayForDate(selectedDate)?.type && (
                    <div className="ml-9 flex items-center gap-2">
                      <StatusBadge
                        variant={typeBadgeVariant(getHolidayForDate(selectedDate)!.type!)}
                        label={getHolidayForDate(selectedDate)!.type}
                      />
                      {isCustomHoliday(selectedDate) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomHoliday(getHolidayForDate(selectedDate)!)}
                          className="text-xs font-medium text-red-500 hover:text-red-700"
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
              <p className="text-base font-medium text-muted-foreground">Tahun {viewYear}</p>
              <p className="text-sm text-muted-foreground">{holidays.length} hari libur</p>
            </div>
          </div>

          {/* Add Holiday Button */}
          <div className="border-t border-border pt-4">
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
        </motion.div>

        {/* Add Holiday Form */}
        {showAddForm && (
          <motion.div variants={fadeUp}>
          <Card padding="md">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Tambah hari libur custom</h3>
            <form onSubmit={handleAddCustomHoliday} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Tipe <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={customTypeLabel}
                    onChange={(e) => setCustomTypeLabel(e.target.value as CustomHolidayTypeLabel)}
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%2364748B%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
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
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Nama hari libur <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Contoh: Libur akhir tahun, cuti bersama Lebaran"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Alasan / deskripsi <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Jelaskan alasan hari libur ini"
                  rows={3}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 min-h-[5rem]"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" disabled={false}>
                  Simpan hari libur
                </Button>
              </div>
            </form>
          </Card>
          </motion.div>
        )}

        {/* Quick Toggle Section */}
        <motion.div variants={fadeUp}>
        <Card padding="md">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Toggle Tanggal Kerja ↔ Libur</h3>
          <div className="flex items-center gap-4">
            <input
              type="date"
              id="toggleDate"
              min="2024-01-01"
              max="2030-12-31"
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15 flex-1"
            />
            <Button
              type="button"
              variant="primary"
              onClick={async () => {
                const dateInput = document.getElementById('toggleDate') as HTMLInputElement;
                if (!dateInput?.value) {
                  toast.error('Pilih tanggal terlebih dahulu');
                  return;
                }
                await handleToggleWorkingDay(dateInput.value, false);
              }}
              disabled={togglingDate !== null}
            >
              {togglingDate ? 'Memproses...' : 'Toggle Tanggal'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            <strong>Cara kerja:</strong> Jika tanggal sudah libur → jadi hari kerja. Jika tanggal kerja → jadi libur.
          </p>
        </Card>
        </motion.div>

        {/* Calendar */}
        <motion.div variants={fadeUp}>
        <Card padding="lg" className="p-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-border border-t-accent" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
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
                  <div className="h-6 w-6 rounded text-xs font-semibold text-accent flex items-center justify-center">
                    N
                  </div>
                  <span className="font-medium text-muted-foreground">Hari libur nasional</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded text-xs font-semibold text-foreground bg-muted flex items-center justify-center px-1">
                    C
                  </div>
                  <span className="font-medium text-muted-foreground">Custom (user)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded border-2 border-border bg-muted" />
                  <span className="font-medium text-muted-foreground">Akhir pekan</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded bg-accent" />
                  <span className="font-medium text-muted-foreground">Tanggal dipilih</span>
                </div>
              </div>
            </div>
          )}
        </Card>
        </motion.div>

        {/* Holidays List for Selected Month */}
        <motion.div variants={fadeUp}>
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="px-6 py-4 bg-muted border-b border-border">
            <h3 className="text-base font-bold text-foreground">
              Hari Libur - {selectedDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </h3>
          </div>
          <div className="divide-y divide-border/50">
            {getHolidaysInMonth(
              selectedDate.getFullYear(),
              selectedDate.getMonth()
            ).length === 0 ? (
              <div className="px-6 py-10 text-center text-muted-foreground">
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
                      isCustom
                        ? 'bg-muted hover:bg-border/30'
                        : 'bg-[var(--color-accent)]/[0.03] hover:bg-[var(--color-accent)]/5'
                    }`}
                  >
                    <div
                      className={`mt-1.5 h-3 w-3 flex-shrink-0 rounded-full ${
                        isCustom ? 'bg-muted-foreground' : 'bg-accent'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <p
                          className={`text-base font-semibold ${
                            isCustom ? 'text-foreground' : 'text-foreground'
                          }`}
                        >
                          {holiday.nameId}
                        </p>
                        {holiday.descriptionId && (
                          <span className="text-xs text-muted-foreground italic">
                            ({holiday.descriptionId})
                          </span>
                        )}
                        {isCustom && (
                          <span className="text-xs font-semibold text-muted-foreground">• Custom</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1.5">
                        {new Date(holiday.date).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        variant={isCustom ? 'default' : 'info'}
                        label={holiday.type}
                      />
                      {/* Toggle Button - Show for all holidays */}
                      <button
                        type="button"
                        onClick={() => handleToggleWorkingDay(holiday.date.split('T')[0], true)}
                        disabled={togglingDate === holiday.date.split('T')[0]}
                        className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Ubah menjadi hari kerja"
                      >
                        {togglingDate === holiday.date.split('T')[0] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </button>
                      {/* Delete Button - Only for custom holidays */}
                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomHoliday(holiday)}
                          className="p-1 text-red-500 hover:text-red-700"
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
        </motion.div>

        {/* Year Navigation */}
        <motion.div variants={fadeUp}>
        <div className="flex items-center justify-center gap-6">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setViewYear((prev) => prev - 1)}
          >
            ← Tahun sebelumnya
          </Button>
          <span className="min-w-[120px] text-center text-2xl font-bold text-foreground">{viewYear}</span>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setViewYear((prev) => prev + 1)}
          >
            Tahun berikutnya →
          </Button>
        </div>
        </motion.div>
      </motion.div>

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
          background: rgba(0, 82, 255, 0.06) !important;
          border-radius: 8px !important;
        }

        .react-calendar__tile--active {
          background: var(--color-accent) !important;
          color: white !important;
          border-radius: 8px !important;
        }

        .react-calendar__tile--active .react-calendar__tile__label {
          color: white !important;
        }

        .holiday-tile {
          background-color: rgba(0, 82, 255, 0.06) !important;
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
          background-color: var(--color-accent);
          border-radius: 50%;
        }

        .custom-holiday-tile {
          background-color: var(--color-muted) !important;
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
          background-color: var(--color-muted-foreground);
          border-radius: 50%;
        }

        .weekend-tile {
          background-color: var(--color-muted) !important;
          color: var(--color-muted-foreground) !important;
          border-radius: 8px !important;
        }

        .react-calendar__tile:enabled:hover {
          background-color: var(--color-muted) !important;
          border-radius: 8px !important;
        }

        .react-calendar__tile--active:enabled:hover {
          background-color: color-mix(in srgb, var(--color-accent) 90%, black) !important;
          border-radius: 8px !important;
        }

        .react-calendar__navigation button:enabled:hover {
          background-color: var(--color-muted) !important;
          border-radius: 8px !important;
        }

        .react-calendar__tile--hasActive {
          background: var(--color-accent) !important;
          color: white !important;
        }
      `}</style>
    </PageContainer>
  );
}
