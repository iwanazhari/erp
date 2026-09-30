type Props = {
  label: string;
  value: string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
};

export default function KpiCard({ label, value, unit, trend, trendLabel }: Props) {
  return (
    <div
      className="relative rounded-xl bg-card border border-border shadow-sm
        transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md p-5"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
          {label}
        </span>
        {trend && (
          <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.1em] ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
            {trendLabel}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold text-foreground tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
