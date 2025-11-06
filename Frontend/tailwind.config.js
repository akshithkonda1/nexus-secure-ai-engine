/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        app: 'var(--bg-app)',
        panel: 'var(--bg-panel)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        ring: 'var(--ring)',
        trustBlue: '#1E40AF'
      },
      boxShadow: {
        card: '0 12px 32px -16px rgb(0 0 0 / 0.35)'
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem'
      }
    }
  },
  plugins: []
};
