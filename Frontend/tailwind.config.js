/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // we'll toggle `html.classList.toggle('dark')`
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        app: 'var(--bg-app)',
        panel: 'var(--bg-panel)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        trustBlue: '#1E40AF', // your blue accent
      },
    },
  },
  plugins: [],
};
