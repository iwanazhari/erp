import type { HTMLAttributes, ReactNode } from 'react';

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'featured';
};

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-8',
};

const variantMap = {
  default:
    'bg-card border border-border shadow-sm',
  elevated:
    'bg-card border border-border shadow-md hover:shadow-lg hover:-translate-y-0.5',
  featured:
    'bg-card border-2 border-transparent shadow-md bg-clip-padding',
};

export default function Card({
  children,
  className = '',
  padding = 'md',
  variant = 'default',
  ...rest
}: Props) {
  return (
    <div
      className={[
        'rounded-xl transition-all duration-200',
        variantMap[variant],
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
