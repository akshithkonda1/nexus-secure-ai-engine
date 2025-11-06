/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',

  // avoid collisions with extension/third-party CSS
  important: '.nexus-root',

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
