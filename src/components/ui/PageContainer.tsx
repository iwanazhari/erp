import type { ReactNode } from 'react';
import Card from '@/components/ui/Card';

type Props = {
  title: string;
  subtitle?: ReactNode;
  /** Tombol/link di kanan judul */
  actions?: ReactNode;
  children: React.ReactNode;
  /** Jika true (default), konten dibungkus `Card` seperti sebelumnya */
  wrapContent?: boolean;
};

export default function PageContainer({
  title,
  subtitle,
  actions,
  children,
  wrapContent = true,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {subtitle != null && <div className="app-muted mt-1">{subtitle}</div>}
        </div>
        {actions != null && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
      </header>

      {wrapContent ? <Card>{children}</Card> : children}
    </div>
  );
}
