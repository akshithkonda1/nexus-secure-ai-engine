import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Inter',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        brand: '#0085FF',
        'brand-alt': '#009EFF',
        purple: '#9360FF',
        lilac: '#C5B9DA',
        // semantic surface tokens (used via CSS vars in globals.css)
        surface: 'rgb(var(--surface) / <alpha-value>)',
        panel: 'rgb(var(--panel) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        text: 'rgb(var(--text) / <alpha-value>)',
        subtle: 'rgb(var(--subtle) / <alpha-value>)',
        background: 'var(--bg)',
        card: 'rgb(var(--panel) / <alpha-value>)',
        accent: '#0085FF',
        'accent-foreground': '#F9FAFC',
        foreground: 'rgb(var(--text) / <alpha-value>)',
        muted: 'rgb(var(--subtle) / <alpha-value>)',
      },
      boxShadow: {
        soft: '0 8px 24px rgba(0,0,0,0.18)',
        card: '0 10px 28px rgba(0,0,0,0.22)',
        glow: '0 0 24px rgba(0,133,255,0.35)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
} satisfies Config
