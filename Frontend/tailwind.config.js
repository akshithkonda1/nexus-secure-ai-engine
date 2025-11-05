/** @type {import('tailwindcss').Config} */
module.exports = {
  // We toggle the `dark` class on <html>. This powers Tailwind's `dark:` variants.
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Token classes you already use
        app: 'var(--bg-app)',
        panel: 'var(--bg-panel)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        trustBlue: '#1E40AF', // Spurs "trust-blue" accent
      },
      // Optional: consistent shadows if you want them
      boxShadow: {
        card: '0 6px 24px -10px rgb(0 0 0 / 0.25)',
      },
    },
  },
  plugins: [],
};
