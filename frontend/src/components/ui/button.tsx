import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'icon';
}

const VARIANT = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  outline: 'border border-border bg-transparent hover:bg-muted',
  ghost: 'bg-transparent hover:bg-muted',
  destructive: 'bg-transparent text-destructive hover:bg-destructive/10',
};
const SIZE = { default: 'h-11 px-4', icon: 'h-11 w-11' };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'default', className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium',
        'transition-transform duration-150 active:scale-[0.97]',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANT[variant], SIZE[size], className
      )}
      {...props}
    />
  )
);
Button.displayName = 'Button';