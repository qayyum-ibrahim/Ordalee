import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: 'sm' | 'md' | 'lg';
}

const ELEVATION = {
  sm: 'shadow-[var(--shadow-sm)]',
  md: 'shadow-[var(--shadow-md)]',
  lg: 'shadow-[var(--shadow-lg)]',
};

export function Card({ elevation = 'sm', className, ...props }: CardProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card', ELEVATION[elevation], className)} {...props} />
  );
}