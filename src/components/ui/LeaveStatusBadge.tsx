/**
 * Badge keputusan izin — palet terbatas (netral + 3 status).
 */
const approvalStyles: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200/80',
  APPROVED: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80',
  REJECTED: 'bg-red-50 text-red-800 ring-1 ring-red-200/80',
};

/** Jenis absensi baris (IZIN/SAKIT) — netral + indigo */
const typeStyles: Record<string, string> = {
  IZIN: 'bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200/80',
  SAKIT: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200/80',
};

type Props = {
  kind: 'approval' | 'type';
  value: string;
};

export default function LeaveStatusBadge({ kind, value }: Props) {
  const map = kind === 'approval' ? approvalStyles : typeStyles;
  const cls = map[value] ?? 'bg-slate-100 text-slate-700 ring-1 ring-slate-200/80';

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {value}
    </span>
  );
}
