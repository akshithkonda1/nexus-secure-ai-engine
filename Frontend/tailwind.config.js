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
        trustBlue: '#1E40AF',
      },
      boxShadow: {
        card: '0 8px 30px -12px rgb(0 0 0 / 0.25)',
      },
    },
  },
  plugins: [],
};
