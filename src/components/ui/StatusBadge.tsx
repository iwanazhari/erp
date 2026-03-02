const statusConfig: Record<string, { bg: string; text: string; label?: string }> = {
  Present: { bg: "bg-emerald-50", text: "text-emerald-600" },
  Late: { bg: "bg-amber-50", text: "text-amber-600" },
  Absent: { bg: "bg-red-50", text: "text-red-600" },
};

type Props = {
  status: string;
};

export default function StatusBadge({ status }: Props) {
  const config = statusConfig[status] || { bg: "bg-slate-100", text: "text-slate-600" };

  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
      {config.label || status}
    </span>
  );
}
