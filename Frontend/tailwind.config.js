// Frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',

  // Scope all Tailwind utilities to the app root to avoid collisions
  // with any third-party styles or extension CSS.
  important: '.nexus-root',

  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    // sensible defaults for your layout
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.25rem',
        lg: '1.5rem',
        xl: '2rem',
      },
      screens: {
        '2xl': '1280px',
      },
    },

    extend: {
      colors: {
        app: 'var(--bg-app)',
        panel: 'var(--bg-panel)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        ring: 'var(--ring)',
        trustBlue: '#1E40AF',
      },
      boxShadow: {
        card: '0 12px 32px -16px rgb(0 0 0 / 0.35)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
      transitionDuration: {
        160: '160ms', // matches your UI micro-animations
      },
    },
  },

  // Extra safety: ensure these never get purged even if used via @apply/tokens
  safelist: [
    'rounded-2xl',
    'border',
    'shadow-card',
    'bg-app',
    'bg-panel',
    'text-ink',
    'text-muted',
  ],

  plugins: [],
};
