// Frontend/src/utils/theme.ts
// Dynamic Theme Utilities for Easy Light/Dark Mode Switching

/**
 * Simple class name merger without external dependencies
 * Handles conditional classes and merges them into a single string
 */
export function cn(...inputs: (string | undefined | null | false | 0)[]): string {
  return inputs
    .filter(Boolean)
    .join(" ")
    .split(" ")
    .filter((v, i, a) => Boolean(v) && a.indexOf(v) === i)
    .join(" ");
}

/**
 * Dynamic theme utilities - works with existing CSS variable system
 * These utilities provide consistent theming across light and dark modes
 */

// Background variants
export const bg = {
  app: "bg-[var(--bg-app)]",
  surface: "bg-[var(--bg-surface)]",
  elevated: "bg-[var(--bg-elevated)]",
  hover: "bg-[var(--bg-hover)]",
  active: "bg-[var(--bg-active)]",
  muted: "bg-[var(--layer-muted)]",
  glass: "bg-[var(--glass-bg)] backdrop-blur-xl",
  accent: "bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-2)]",
  accentPrimary: "bg-[var(--accent-primary)]",
  accentSubtle: "bg-[var(--accent-subtle)]",
  // Legacy support
  elev: "bg-[var(--bg-elev)]",
} as const;

// Text variants
export const text = {
  primary: "text-[var(--text-primary)]",
  secondary: "text-[var(--text-secondary)]",
  tertiary: "text-[var(--text-tertiary)]",
  subtle: "text-[var(--text-subtle)]",
  ghost: "text-[var(--text-ghost)]",
  strong: "text-[var(--text-strong)]",
  inverse: "text-[var(--text-inverse)]",
  accent: "text-[var(--accent-primary)]",
  // Legacy support
  muted: "text-[var(--text-muted)]",
} as const;

// Border variants
export const border = {
  subtle: "border-[var(--border-subtle)]",
  default: "border-[var(--border-default)]",
  strong: "border-[var(--border-strong)]",
  glass: "border-[var(--glass-border)]",
  accent: "border-[var(--accent-primary)]",
} as const;

// Shadow variants (5-level system)
export const shadow = {
  xs: "shadow-[var(--shadow-xs)]",
  sm: "shadow-[var(--shadow-sm)]",
  md: "shadow-[var(--shadow-md)]",
  lg: "shadow-[var(--shadow-lg)]",
  xl: "shadow-[var(--shadow-xl)]",
  none: "shadow-none",
  // Legacy support
  soft: "shadow-[var(--shadow-soft)]",
  medium: "shadow-[var(--shadow-med)]",
} as const;

// Common patterns
export const patterns = {
  /**
   * Card container pattern (world-class quality)
   */
  card: (interactive = false) =>
    cn(
      "rounded-2xl border p-5 transition-all duration-[var(--duration-fast)]",
      bg.surface,
      border.subtle,
      shadow.sm,
      interactive && cn(
        "hover:border-[var(--border-default)] hover:shadow-md cursor-pointer",
        "active:scale-[0.99]"
      )
    ),

  /**
   * Glass card pattern (for modals, overlays only)
   */
  glassCard: () =>
    cn(
      "rounded-2xl border backdrop-blur-xl p-6",
      bg.glass,
      border.glass,
      shadow.lg
    ),

  /**
   * Navigation item pattern
   */
  navItem: (active = false) =>
    cn(
      "group relative flex items-center gap-3 rounded-lg py-2.5 pr-3 pl-1",
      "text-[length:var(--font-size-13)] font-[var(--font-weight-medium)]",
      "transition-all duration-[var(--duration-fast)]",
      active
        ? cn("bg-[var(--bg-elevated)] shadow-inner", text.primary)
        : cn(text.secondary, "hover:bg-[var(--bg-elevated)]", "hover:text-[var(--text-primary)]")
    ),

  /**
   * Button base pattern (5 states: default, hover, active, disabled, focus)
   */
  button: (variant: "primary" | "secondary" | "ghost" | "accent" = "primary") => {
    const variants = {
      primary: cn(
        bg.surface,
        border.subtle,
        text.primary,
        "border",
        "hover:bg-[var(--bg-elevated)]",
        "active:bg-[var(--bg-hover)]",
        shadow.xs,
        "hover:shadow-sm"
      ),
      secondary: cn(
        bg.elevated,
        text.secondary,
        "hover:bg-[var(--bg-hover)]",
        "hover:text-[var(--text-primary)]",
        "active:bg-[var(--bg-active)]"
      ),
      ghost: cn(
        text.secondary,
        "hover:bg-[var(--bg-elevated)]",
        "hover:text-[var(--text-primary)]",
        "active:bg-[var(--bg-hover)]"
      ),
      accent: cn(
        bg.accent,
        text.inverse,
        shadow.md,
        "hover:shadow-lg",
        "active:scale-[0.98]"
      ),
    };

    return cn(
      "inline-flex items-center justify-center gap-2 rounded-lg",
      "text-[length:var(--font-size-13)] font-[var(--font-weight-medium)]",
      "transition-all duration-[var(--duration-fast)]",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
      focus.ring,
      variants[variant]
    );
  },

  /**
   * Input field pattern (with proper focus states)
   */
  input: () =>
    cn(
      "w-full rounded-lg border px-3 py-2",
      "text-[length:var(--font-size-13)]",
      "transition-all duration-[var(--duration-fast)]",
      bg.surface,
      border.subtle,
      text.primary,
      "placeholder:text-[var(--text-subtle)]",
      "hover:border-[var(--border-default)]",
      "focus:outline-none focus:border-[var(--accent-primary)]",
      "focus:ring-2 focus:ring-[var(--accent-subtle)]"
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
 * Spacing utilities (4px grid system)
 */
export const spacing = {
  0: "gap-0",      /* 0px */
  1: "gap-0.5",    /* 2px */
  2: "gap-1",      /* 4px */
  3: "gap-1.5",    /* 6px */
  4: "gap-2",      /* 8px */
  5: "gap-2.5",    /* 10px */
  6: "gap-3",      /* 12px */
  7: "gap-3.5",    /* 14px */
  8: "gap-4",      /* 16px */
  10: "gap-5",     /* 20px */
  12: "gap-6",     /* 24px */
  14: "gap-7",     /* 28px */
  16: "gap-8",     /* 32px */
  20: "gap-10",    /* 40px */
  24: "gap-12",    /* 48px */
  // Legacy names
  xs: "gap-2",     /* 8px */
  sm: "gap-3",     /* 12px */
  md: "gap-4",     /* 16px */
  lg: "gap-6",     /* 24px */
  xl: "gap-8",     /* 32px */
} as const;

/**
 * Animation utilities with proper timing
 */
export const animations = {
  // Hover states (fast with ease-out)
  hoverFast: "transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]",

  // Transforms/slides (normal with ease-in-out)
  slideNormal: "transition-transform duration-[var(--duration-normal)] ease-[var(--ease-in-out)]",

  // Fades (slow with ease-in)
  fadeSlow: "transition-opacity duration-[var(--duration-slow)] ease-[var(--ease-in)]",

  // Playful interactions (normal with bounce)
  bounce: "transition-all duration-[var(--duration-normal)] ease-[var(--ease-bounce)]",

  // Generic transitions
  instant: "transition-all duration-[var(--duration-instant)]",
  fast: "transition-all duration-[var(--duration-fast)]",
  normal: "transition-all duration-[var(--duration-normal)]",
  slow: "transition-all duration-[var(--duration-slow)]",
  slower: "transition-all duration-[var(--duration-slower)]",

  // Legacy support
  fadeIn: "animate-in fade-in duration-[var(--duration-normal)]",
  slideIn: "animate-in slide-in-from-bottom-4 duration-[var(--duration-slow)]",
  scaleIn: "animate-in zoom-in-95 duration-[var(--duration-normal)]",
} as const;

/**
 * Focus ring utilities (accessible focus states)
 */
export const focus = {
  ring: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-app)]",
  ringSubtle: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-subtle)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-app)]",
} as const;
