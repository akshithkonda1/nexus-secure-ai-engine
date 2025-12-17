import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes safely
 * Handles conditional classes and removes conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Dynamic theme utilities - works with existing CSS variable system
 * These utilities provide consistent theming across light and dark modes
 */

// Background variants
export const bg = {
  app: "bg-[var(--bg-app)]",
  surface: "bg-[var(--bg-surface)]",
  elevated: "bg-[var(--bg-elev)]",
  hover: "bg-[var(--color-bg-hover)]",
  muted: "bg-[var(--layer-muted)]",
  glass: "bg-[var(--glass-bg)] backdrop-blur-xl",
  accent: "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]",
  accentSubtle: "bg-[var(--accent)]/10",
} as const;

// Text variants
export const text = {
  primary: "text-[var(--text-primary)]",
  strong: "text-[var(--text-strong)]",
  muted: "text-[var(--text-muted)]",
  inverse: "text-[var(--text-inverse)]",
  accent: "text-[var(--accent)]",
} as const;

// Border variants
export const border = {
  default: "border-[var(--border)]",
  subtle: "border-[var(--line-subtle)]",
  strong: "border-[var(--line-strong)]",
  glass: "border-[var(--glass-border)]",
  accent: "border-[var(--accent)]",
} as const;

// Shadow variants
export const shadow = {
  soft: "shadow-[var(--shadow-soft)]",
  medium: "shadow-[var(--shadow-med)]",
  none: "shadow-none",
} as const;

// Common patterns
export const patterns = {
  /**
   * Card container pattern
   */
  card: (interactive = false) =>
    cn(
      "rounded-xl border p-6 transition-colors",
      bg.surface,
      border.subtle,
      interactive && "hover:border-[var(--line-strong)] cursor-pointer"
    ),

  /**
   * Glass card pattern (for modals, overlays)
   */
  glassCard: () =>
    cn(
      "rounded-xl border backdrop-blur-xl p-6",
      bg.glass,
      border.glass,
      shadow.soft
    ),

  /**
   * Navigation item pattern
   */
  navItem: (active = false) =>
    cn(
      "group relative flex items-center gap-3 rounded-lg py-2.5 pr-3 pl-1 text-sm font-medium transition-colors",
      active
        ? cn("bg-[var(--layer-muted)] shadow-inner", text.primary)
        : cn("text-[var(--muted)] hover:bg-[var(--bg-elev)]", "hover:text-[var(--text)]")
    ),

  /**
   * Button base pattern
   */
  button: (variant: "primary" | "secondary" | "ghost" | "accent" = "primary") => {
    const variants = {
      primary: cn(
        "bg-[var(--bg-surface)] border-[var(--border)] hover:bg-[var(--bg-elev)]",
        text.primary,
        border.default
      ),
      secondary: cn(
        "bg-[var(--layer-muted)] hover:bg-[var(--bg-hover)]",
        text.muted,
        "hover:text-[var(--text)]"
      ),
      ghost: cn(
        "hover:bg-[var(--bg-elev)]",
        text.muted,
        "hover:text-[var(--text)]"
      ),
      accent: cn(
        bg.accent,
        text.inverse,
        "shadow-lg hover:shadow-xl"
      ),
    };

    return cn(
      "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed",
      variants[variant]
    );
  },

  /**
   * Input field pattern
   */
  input: () =>
    cn(
      "w-full rounded-lg border px-3 py-2 text-sm transition-colors",
      "focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]",
      bg.surface,
      border.subtle,
      text.primary,
      "placeholder:text-[var(--text-muted)]"
    ),

  /**
   * Section header pattern
   */
  sectionHeader: () =>
    cn("mb-6 flex items-center gap-3"),

  /**
   * Divider pattern
   */
  divider: () =>
    cn("h-px w-full", "bg-[var(--line-subtle)]"),

  /**
   * Badge pattern
   */
  badge: (variant: "default" | "accent" | "muted" = "default") => {
    const variants = {
      default: cn(bg.elevated, text.primary),
      accent: cn(bg.accentSubtle, text.accent),
      muted: cn(bg.muted, text.muted),
    };

    return cn(
      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
      variants[variant]
    );
  },
};

/**
 * Helper to get background variant class
 */
export function getBgVariant(variant: keyof typeof bg): string {
  return bg[variant];
}

/**
 * Helper to get text variant class
 */
export function getTextVariant(variant: keyof typeof text): string {
  return text[variant];
}

/**
 * Helper to get border variant class
 */
export function getBorderVariant(variant: keyof typeof border): string {
  return border[variant];
}

/**
 * Spacing utilities (consistent with design system)
 */
export const spacing = {
  xs: "gap-2",
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
} as const;

/**
 * Animation utilities
 */
export const animations = {
  fadeIn: "animate-in fade-in duration-200",
  slideIn: "animate-in slide-in-from-bottom-4 duration-300",
  scaleIn: "animate-in zoom-in-95 duration-200",
} as const;
