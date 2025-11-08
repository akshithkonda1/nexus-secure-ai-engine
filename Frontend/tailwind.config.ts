/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Inter',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        // Brand
        brand: '#0085FF',
        brandAlt: '#009EFF',
        purple: '#9360FF',
        lilac: '#C5B9DA',

        // Semantic via CSS variables (defined in globals.css)
        background: 'var(--bg)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        panel: 'rgb(var(--panel) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        text: 'rgb(var(--text) / <alpha-value>)',
        subtle: 'rgb(var(--subtle) / <alpha-value>)',

        // Conveniences
        card: 'rgb(var(--panel) / <alpha-value>)',
        accent: '#0085FF',
        accentForeground: '#F9FAFC',
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
};
