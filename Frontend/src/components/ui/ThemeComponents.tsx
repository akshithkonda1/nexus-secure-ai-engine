import React from "react";
import { cn, bg, text, border, shadow, patterns, spacing } from "../../utils/theme";
import { LucideIcon } from "lucide-react";

/**
 * Reusable theme-aware UI components
 * All components automatically adapt to light/dark mode using CSS variables
 */

// ============================================================================
// CARD COMPONENTS
// ============================================================================

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Card({ className, interactive = false, children, ...props }: CardProps) {
  return (
    <div className={cn(patterns.card(interactive), className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4 flex flex-col gap-1.5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base font-semibold tracking-tight", text.primary, className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm", text.muted, className)} {...props}>
      {children}
    </p>
  );
}

export function GlassCard({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(patterns.glassCard(), className)} {...props}>
      {children}
    </div>
  );
}

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "accent" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variants = {
    primary: patterns.button("primary"),
    secondary: patterns.button("secondary"),
    ghost: patterns.button("ghost"),
    accent: patterns.button("accent"),
    danger: cn(
      "bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl",
      "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    ),
  };

  return (
    <button
      className={cn(variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

// ============================================================================
// INPUT COMPONENTS
// ============================================================================

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(patterns.input(), className)}
      {...props}
    />
  );
}

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        patterns.input(),
        "min-h-[100px] resize-y",
        className
      )}
      {...props}
    />
  );
}

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        patterns.input(),
        "cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23667085%22%20d%3D%22M6%208.5L2%204.5h8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[center_right_12px] bg-no-repeat pr-10",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, children, ...props }: LabelProps) {
  return (
    <label className={cn("text-sm font-medium", text.primary, className)} {...props}>
      {children}
    </label>
  );
}

// ============================================================================
// ICON COMPONENTS
// ============================================================================

export interface IconCircleProps {
  icon: LucideIcon;
  color?: "blue" | "purple" | "amber" | "green" | "red" | "gray";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function IconCircle({ icon: Icon, color = "blue", size = "md", className }: IconCircleProps) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const colors = {
    blue: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    purple: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
    amber: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
    green: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
    red: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
    gray: "bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400",
  };

  return (
    <div className={cn("flex items-center justify-center rounded-full", sizes[size], colors[color], className)}>
      <Icon className={iconSizes[size]} />
    </div>
  );
}

// ============================================================================
// TOGGLE COMPONENT
// ============================================================================

export interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  description?: string;
}

export function Toggle({ enabled, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className={cn("text-sm font-medium", text.primary)}>{label}</span>}
          {description && <span className={cn("text-xs", text.muted)}>{description}</span>}
        </div>
      )}
      <button
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
          enabled ? "bg-[var(--accent)]" : "bg-[var(--bg-elev)]"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
            enabled ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
}

// ============================================================================
// PROGRESS BAR COMPONENT
// ============================================================================

export interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, max = 100, className, showLabel = false }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-1 flex justify-between text-xs">
          <span className={text.muted}>Progress</span>
          <span className={text.primary}>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn("h-2 w-full overflow-hidden rounded-full", bg.elevated)}>
        <div
          className={cn("h-full transition-all duration-300", bg.accent)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// BADGE COMPONENT
// ============================================================================

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "muted";
}

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span className={cn(patterns.badge(variant), className)} {...props}>
      {children}
    </span>
  );
}

// ============================================================================
// SECTION HEADER COMPONENT
// ============================================================================

export interface SectionHeaderProps {
  icon?: LucideIcon;
  iconColor?: "blue" | "purple" | "amber" | "green" | "red" | "gray";
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  icon,
  iconColor = "blue",
  title,
  description,
  action,
  className
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && <IconCircle icon={icon} color={iconColor} size="md" />}
          <div>
            <h3 className={cn("text-lg font-semibold", text.primary)}>{title}</h3>
            {description && <p className={cn("text-sm", text.muted)}>{description}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <IconCircle icon={Icon} color="gray" size="lg" className="mb-4" />
      <h3 className={cn("mb-2 text-base font-semibold", text.primary)}>{title}</h3>
      {description && <p className={cn("mb-4 text-sm", text.muted)}>{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

// ============================================================================
// SPINNER COMPONENT
// ============================================================================

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-3",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-[var(--accent)] border-t-transparent",
        sizes[size],
        className
      )}
    />
  );
}

// ============================================================================
// SKELETON COMPONENT
// ============================================================================

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circle" | "rectangle";
}

export function Skeleton({ variant = "text", className, ...props }: SkeletonProps) {
  const variants = {
    text: "h-4 w-full rounded",
    circle: "aspect-square rounded-full",
    rectangle: "h-24 w-full rounded-lg",
  };

  return (
    <div
      className={cn(
        "animate-pulse",
        bg.elevated,
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

// ============================================================================
// DIVIDER COMPONENT
// ============================================================================

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  label?: string;
}

export function Divider({ orientation = "horizontal", label, className, ...props }: DividerProps) {
  if (label) {
    return (
      <div className={cn("flex items-center gap-4", className)} {...props}>
        <div className={cn("flex-1", patterns.divider())} />
        <span className={cn("text-xs font-medium", text.muted)}>{label}</span>
        <div className={cn("flex-1", patterns.divider())} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        "bg-[var(--line-subtle)]",
        className
      )}
      {...props}
    />
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  cn,
  bg,
  text,
  border,
  shadow,
  patterns,
  spacing,
};
