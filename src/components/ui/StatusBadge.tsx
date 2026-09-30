type Props = {
  label?: string;
  value?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  status?: 'Present' | 'Late' | 'Absent';
  pulse?: boolean;
};

const variantStyles = {
  default: 'bg-muted text-muted-foreground border-border',
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
};

const dotVariant = {
  default: 'bg-muted-foreground',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
};

const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger'; dot: string }> = {
  Present: { variant: 'success', dot: 'bg-green-500' },
  Late: { variant: 'warning', dot: 'bg-amber-500' },
  Absent: { variant: 'danger', dot: 'bg-red-500' },
};

export default function StatusBadge({ label, value, variant = 'default', status, pulse }: Props) {
  if (status) {
    const mapped = statusMap[status];
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${variantStyles[mapped.variant]}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${mapped.dot} ${pulse ? 'animate-pulse-dot' : ''}`} />
        <span className="font-semibold">{status}</span>
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${variantStyles[variant]}`}>
      <span className={`block h-1.5 w-1.5 rounded-full ${dotVariant[variant]} ${pulse ? 'animate-pulse-dot' : ''}`} />
      {label && <span>{label}</span>}
      {value && <span className="font-semibold">{value}</span>}
    </div>
  );
}
