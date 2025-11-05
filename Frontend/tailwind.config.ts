// tailwind.config.ts
import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config = {
  // -----------------------------------------------------------------------
  // Content – include every file Tailwind should scan
  // -----------------------------------------------------------------------
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],

  // -----------------------------------------------------------------------
  // Dark mode – use class-based (we toggle via <html data-theme>)
  // -----------------------------------------------------------------------
  darkMode: 'class',

  // -----------------------------------------------------------------------
  // Core plugins – keep preflight OFF (you’re using a CSS reset elsewhere)
  // -----------------------------------------------------------------------
  corePlugins: {
    preflight: false,
  },

  // -----------------------------------------------------------------------
  // Theme – all your custom colors, radii, shadows, fonts
  // -----------------------------------------------------------------------
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
    },
    extend: {
      colors: {
        // -----------------------------------------------------------------
        // CSS-variable based palette (works with dark/light toggle)
        // -----------------------------------------------------------------
        'app-bg': 'rgb(var(--app-bg) / <alpha-value>)',
        'app-surface': 'rgb(var(--panel-bg) / <alpha-value>)',
        'app-text': 'rgb(var(--ink) / <alpha-value>)',
        'app-text-muted': 'rgb(var(--muted) / <alpha-value>)',
        'app-border': 'rgb(var(--border) / <alpha-value>)',

        // -----------------------------------------------------------------
        // Direct hex values (fallback for older browsers)
        // -----------------------------------------------------------------
        app: '#0b0f14',
        'app-surface': '#11161c',
        panel: '#121820',
        ink: '#e6e9ef',
        muted: '#9aa3af',
        trustBlue: '#1E40AF',
        silver: '#C0C0C0',

        // -----------------------------------------------------------------
        // Accent colors (used for student / business modes)
        // -----------------------------------------------------------------
        'accent-student': 'var(--accent-student)',
        'accent-business': 'var(--accent-business)',
        'accent-nexus': 'var(--accent-nexus)',
      },

      borderColor: {
        app: 'rgba(255,255,255,0.08)',
      },

      ringColor: {
        trustBlue: '#1E40AF',
      },

      borderRadius: {
        card: 'var(--radius-card)',
        button: 'var(--radius-button)',
        input: 'var(--radius-input)',
      },

      boxShadow: {
        ambient: 'var(--shadow-ambient)',
        press: 'var(--shadow-press)',
      },

      fontFamily: {
        sans: [
          "'Inter Variable'",
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          "'Segoe UI'",
          'sans-serif',
        ],
      },
    },
  },

  // -----------------------------------------------------------------------
  // Plugins – custom mode variants (student / business / nexusos)
  // -----------------------------------------------------------------------
  plugins: [
    plugin(({ addVariant }) => {
      addVariant('mode-student', "&[data-mode='student'] *");
      addVariant('mode-business', "&[data-mode='business'] *");
      addVariant('mode-nexusos', "&[data-mode='nexusos'] *");
    }),
  ],

  // -----------------------------------------------------------------------
  // Future-proof flags
  // -----------------------------------------------------------------------
  future: {
    hoverOnlyWhenSupported: true,
  },
} satisfies Config;

export default config;
