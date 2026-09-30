import type { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: React.ReactNode;
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
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {title}
          </h1>
          {subtitle != null && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {actions != null && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
        )}
      </header>

      {wrapContent ? (
        <div className="rounded-xl bg-card border border-border shadow-sm p-5">
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
