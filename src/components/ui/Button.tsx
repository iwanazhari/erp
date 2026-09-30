import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  showArrow?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'gradient-bg text-white shadow-[var(--shadow-accent)] ' +
    'hover:-translate-y-0.5 hover:shadow-[var(--shadow-accent-lg)] hover:brightness-110 ' +
    'active:scale-[0.98] ' +
    'focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
  secondary:
    'bg-card text-foreground border border-border shadow-sm ' +
    'hover:-translate-y-0.5 hover:shadow-md hover:border-accent/30 ' +
    'active:scale-[0.98] ' +
    'focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
  ghost:
    'bg-transparent text-muted-foreground ' +
    'hover:text-foreground hover:bg-muted ' +
    'focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
  danger:
    'bg-red-600 text-white shadow-sm ' +
    'hover:-translate-y-0.5 hover:shadow-md hover:bg-red-700 ' +
    'active:scale-[0.98] ' +
    'focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
  outline:
    'bg-transparent text-foreground border border-border ' +
    'hover:-translate-y-0.5 hover:shadow-sm hover:border-accent/30 hover:bg-muted/30 ' +
    'active:scale-[0.98] ' +
    'focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-1.5 text-xs gap-1.5 min-h-[36px] rounded-lg',
  md: 'px-5 py-2.5 text-sm gap-2 min-h-[44px] rounded-xl',
  lg: 'px-7 py-3 text-base gap-2 min-h-[52px] rounded-xl',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    className = '',
    leftIcon,
    rightIcon,
    disabled,
    children,
    fullWidth,
    showArrow,
    type = 'button',
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center font-semibold',
        'transition-all duration-200 ease-out',
        'focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:-translate-y-0 disabled:scale-100',
        fullWidth ? 'w-full' : '',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {leftIcon}
      {children}
      {(rightIcon || showArrow) && (
        <ArrowRight className={`h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 ${rightIcon ? '' : 'ml-0.5'}`} />
      )}
      {rightIcon && !showArrow && rightIcon}
    </button>
  );
});

export default Button;
