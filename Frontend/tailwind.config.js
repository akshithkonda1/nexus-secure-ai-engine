/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',                // toggle via <html class="dark">
  important: '.nexus-root',         // scope utilities so nothing leaks

  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.25rem', lg: '1.5rem', xl: '2rem' },
      screens: { '2xl': '1280px' },
    },
    extend: {
      fontFamily: {
        sans: [
          'Inter var','Inter','ui-sans-serif','system-ui','Segoe UI','Roboto',
          'Helvetica Neue','Arial','Noto Sans','Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol'
        ],
      },
      colors: {
        app: 'var(--bg-app)',
        panel: 'var(--bg-panel)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        ring: 'var(--ring)',
        trustBlue: '#1E40AF',
      },
      borderRadius: { xl: '0.75rem', '2xl': '1rem' },
      transitionDuration: { 160: '160ms' },
    },
  },

  plugins: [],
};
