// Frontend/tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // map classes like bg-app, text-ink to CSS variables so dark/light can flip
      colors: {
        app: 'rgb(var(--app) / <alpha-value>)',
        panel: 'rgb(var(--panel) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        trustBlue: '#1E40AF',
        silver: '#C0C0C0',
      },
      borderColor: {
        app: 'rgba(255,255,255,0.08)',
      },
      ringColor: {
        trustBlue: '#1E40AF',
      },
      borderRadius: {
        card: '1rem',
        button: '0.75rem',
        input: '0.75rem',
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
      boxShadow: {
        ambient: '0 10px 30px rgba(0,0,0,.25)',
        press: 'inset 0 2px 6px rgba(255,255,255,.06)',
      },
    },
  },
  plugins: [],
} satisfies Config;
