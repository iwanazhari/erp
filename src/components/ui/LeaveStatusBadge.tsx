type Props = {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  kind?: string;
  value?: string;
};

const statusConfig: Record<string, { label: string; variant: string }> = {
  PENDING: { label: 'Pending', variant: 'warning' },
  APPROVED: { label: 'Disetujui', variant: 'success' },
  REJECTED: { label: 'Ditolak', variant: 'danger' },
};

const variantStyles: Record<string, string> = {
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
};

const dotColors: Record<string, string> = {
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
};

export default function LeaveStatusBadge({ status, kind, value }: Props) {
  if (status) {
    const config = statusConfig[status] || { label: status, variant: 'warning' };
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${variantStyles[config.variant] || variantStyles.warning}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${dotColors[config.variant] || dotColors.warning}`} />
        {config.label}
      </span>
    );
  }

  if (kind === 'type') {
    const isSakit = value === 'SAKIT';
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        isSakit ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'
      }`}>
        <span className={`h-1.5 w-1.5 rounded-full ${isSakit ? 'bg-red-500' : 'bg-blue-500'}`} />
        {isSakit ? 'Sakit' : 'Izin'}
      </span>
    );
  }

  if (kind === 'approval') {
    const config = statusConfig[value || ''] || { label: value || '-', variant: 'warning' };
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${variantStyles[config.variant] || variantStyles.warning}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${dotColors[config.variant] || dotColors.warning}`} />
        {config.label}
      </span>
    );
  }

  return null;
}
