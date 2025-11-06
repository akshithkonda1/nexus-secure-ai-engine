/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        app: "var(--bg-app)",
        panel: "var(--bg-panel)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        border: "var(--border)",
        ring: "var(--ring)",
        trustBlue: "#1E40AF",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 12px 32px -16px rgb(0 0 0 / 0.35)",
      },
    },
  },
  plugins: [],
};
