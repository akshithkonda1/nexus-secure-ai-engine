/**
 * EmptyState Component
 * Ultra-minimalist empty state for sidebar menus
 * Design: Centered, subtle, with optional action
 */

import { LucideIcon } from 'lucide-react';
import { cn, text } from '../../utils/theme';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center px-8 py-12 text-center">
      {/* Icon - 48px, subtle opacity */}
      <Icon
        className={cn('h-12 w-12 opacity-20', text.secondary)}
        strokeWidth={1.5}
      />

      {/* Title - 14px, medium weight */}
      <h3 className={cn('mt-3 text-sm font-medium', text.secondary)}>
        {title}
      </h3>

      {/* Description - 12px, tertiary color */}
      {description && (
        <p className={cn('mt-1 text-xs', text.tertiary)}>
          {description}
        </p>
      )}

      {/* Optional action button */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={cn(
            'mt-4 rounded-lg px-4 py-2 text-xs font-medium transition-all',
            'bg-[var(--accent-primary)] text-white',
            'hover:bg-[var(--accent-hover)]',
            'active:scale-95'
          )}
          style={{
            transitionDuration: '150ms',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
