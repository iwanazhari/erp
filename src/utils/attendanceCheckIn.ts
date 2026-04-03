/**
 * Aturan jam masuk — selaras dengan `AttendanceEditModal`:
 * HADIR jika jam masuk ≤ 09:15 (waktu lokal), TERLAMBAT jika lebih dari itu.
 */

export const MAX_CLOCK_IN_CUTOFF_MINUTES = 9 * 60 + 15; // 09:15

/** Untuk teks UI (sama seperti modal edit) */
export const MAX_CLOCK_IN_DISPLAY = '09:15';

export function isClockInLateFromDate(d: Date): boolean {
  if (Number.isNaN(d.getTime())) return false;
  const total = d.getHours() * 60 + d.getMinutes();
  return total > MAX_CLOCK_IN_CUTOFF_MINUTES;
}

/** `clockIn` ISO string dari API */
export function isClockInLateFromIso(clockInIso: string): boolean {
  return isClockInLateFromDate(new Date(clockInIso));
}
