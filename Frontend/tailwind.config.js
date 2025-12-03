/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        textPrimary: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
        textMuted: "var(--text-muted)",

        glass: "var(--glass-bg)",
        glassHeavy: "var(--glass-bg-heavy)",
        glassBorder: "var(--glass-border)",
        glassBorderStrong: "var(--glass-border-strong)",

        background: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        panel: 'rgb(var(--panel) / <alpha-value>)',
        foreground: 'rgb(var(--text) / <alpha-value>)',
        muted: 'rgb(var(--subtle) / <alpha-value>)',

        brand: 'rgb(var(--brand) / <alpha-value>)',
        'brand-soft': 'rgb(var(--brand-soft) / <alpha-value>)',

        accent: {
          emerald: 'rgb(var(--accent-emerald) / <alpha-value>)',
          amber: 'rgb(var(--accent-amber) / <alpha-value>)',
          rose: 'rgb(var(--accent-rose) / <alpha-value>)',
          sky: 'rgb(var(--accent-sky) / <alpha-value>)',
          lilac: 'rgb(var(--accent-lilac) / <alpha-value>)',
        },

        border: 'rgb(var(--border) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',

        // Compatibility aliases
        app: 'rgb(var(--bg) / <alpha-value>)',
        ink: 'rgb(var(--text) / <alpha-value>)',
        'app-bg': 'rgb(var(--bg) / <alpha-value>)',
        'app-surface': 'rgb(var(--surface) / <alpha-value>)',
        'app-text': 'rgb(var(--text) / <alpha-value>)',
        'muted-foreground': 'rgb(var(--subtle) / <alpha-value>)',
        card: 'rgb(var(--panel) / <alpha-value>)',
        'app-border': 'rgb(var(--border) / <alpha-value>)',
        trustBlue: 'rgb(var(--brand) / <alpha-value>)',
        'zora-night': 'var(--zora-night)',
        'zora-deep': 'var(--zora-deep)',
        'zora-space': 'var(--zora-space)',
        'zora-soft': 'var(--zora-soft)',
        'zora-white': 'var(--zora-white)',
        'zora-muted': 'var(--zora-muted)',
        'zora-border': 'var(--zora-border)',
      },
      backgroundImage: {
        'zora-aurora': 'var(--zora-gradient)',
      },
      borderRadius: {
        card: 'var(--radius-card)',
        button: 'var(--radius-button)',
        input: 'var(--radius-input)',
        'zora-lg': '18px',
        'zora-xl': '24px',
      },
      boxShadow: {
        glass: "var(--glass-shadow)",
        glassStrong: "var(--glass-shadow-strong)",

        ambient: 'var(--shadow-soft)',
        soft: 'var(--shadow-soft)',
        lift: 'var(--shadow-lift)',
        press: 'inset 0 1px 0 rgba(255,255,255,.1)',
        'zora-glow': '0 0 40px rgba(62, 228, 255, 0.23)',
        'zora-soft': '0 14px 40px rgba(15, 23, 42, 0.75)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
      fontFamily: {
        sans: ['Inter','system-ui','-apple-system','BlinkMacSystemFont','Segoe UI','sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        'skeleton-shimmer': 'skeleton-shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%,100%': { boxShadow: '0 0 20px rgba(var(--brand), .3), 0 0 40px rgba(var(--brand-soft), .2)' },
          '50%': { boxShadow: '0 0 30px rgba(var(--brand), .5), 0 0 60px rgba(var(--brand-soft), .3)' },
        },
        'skeleton-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
  future: { hoverOnlyWhenSupported: true },
};
