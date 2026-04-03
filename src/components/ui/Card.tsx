import type { HTMLAttributes, ReactNode } from 'react';

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /** Padding dalam card */
  padding?: 'none' | 'sm' | 'md' | 'lg';
};

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/**
 * Panel/kartu netral — border halus, shadow ringan (design system ringan).
 */
export default function Card({ children, className = '', padding = 'md', ...rest }: Props) {
  return (
    <div
      className={[
        'rounded-xl border border-slate-200/80 bg-white shadow-sm',
        paddingMap[padding],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}
