import type { MonthlyGridOvertimeRow } from '@/shared/types/attendance';

const fmtDate = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

/**
 * Tabel rekap lembur — berdiri sendiri di samping grid absensi,
 * satu baris per pengajuan, durasi format "H:MM".
 */
export function OvertimeRowsTable({
  rows,
  totalRows,
  totalHours,
  monthLabel,
}: {
  rows: MonthlyGridOvertimeRow[];
  totalRows: number;
  totalHours: string;
  monthLabel: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-200">
        <div>
          <h2 className="text-base font-bold text-gray-900">Rekap Lembur</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Durasi lembur ter-APPROVED — {monthLabel}
          </p>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-xs text-gray-500">Jumlah Pengajuan</p>
            <p className="text-xl font-bold text-gray-900">{totalRows}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Total Durasi</p>
            <p className="text-xl font-bold text-amber-600">{totalHours} jam</p>
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-gray-500">
          Tidak ada pengajuan lembur ter-APPROVED pada bulan ini
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Karyawan</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Durasi</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Alasan</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => (
                <tr key={`${row.userId}-${row.date}`} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-900">{row.name}</td>
                  <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">{fmtDate(row.date)}</td>
                  <td className="px-4 py-2.5 text-gray-900 font-semibold whitespace-nowrap">
                    {row.hours} jam
                  </td>
                  <td className="px-4 py-2.5 text-gray-700">{row.reason}</td>
                  <td className="px-4 py-2.5 text-gray-500">{row.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default OvertimeRowsTable;
