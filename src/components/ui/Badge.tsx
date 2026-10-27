import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface BadgeProps {
  children: ReactNode;
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
  className?: string;
}

const styles: Record<NonNullable<BadgeProps['variant']>, string> = {
  neutral: 'bg-gray-100 text-gray-700 ring-gray-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  danger: 'bg-rose-50 text-rose-700 ring-rose-200',
  info: 'bg-blue-50 text-blue-700 ring-blue-200',
  accent: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
};

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function CrowdLevelBadge({ level }: { level: 'Low' | 'Medium' | 'High' }) {
  const variant =
    level === 'High' ? 'danger' : level === 'Medium' ? 'warning' : 'success';
  return <Badge variant={variant}>{level}</Badge>;
}
