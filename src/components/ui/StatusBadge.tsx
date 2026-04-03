const statusConfig: Record<string, { bg: string; text: string; label?: string }> = {
  Present: { bg: "bg-emerald-50", text: "text-emerald-700" },
  Late: { bg: "bg-amber-50", text: "text-amber-800" },
  Absent: { bg: "bg-red-50", text: "text-red-700" },
  /** Variasi label/kasus */
  present: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Hadir" },
  late: { bg: "bg-amber-50", text: "text-amber-800", label: "Terlambat" },
  leave: { bg: "bg-indigo-50", text: "text-indigo-800", label: "Cuti" },
  absent: { bg: "bg-red-50", text: "text-red-700", label: "Tidak Hadir" },
};

type Props = {
  status: string;
};

export default function StatusBadge({ status }: Props) {
  const config = statusConfig[status] || { bg: "bg-slate-100", text: "text-slate-600" };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ring-1 ring-inset ring-black/5 ${config.bg} ${config.text}`}
    >
      {config.label || status}
    </span>
  );
}
