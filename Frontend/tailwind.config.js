import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: "rgb(var(--app-bg) / <alpha-value>)",
        "app-surface": "rgb(var(--app-surface) / <alpha-value>)",
        surface: "rgb(var(--surface-bg) / <alpha-value>)",
        panel: "rgb(var(--panel-bg) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        "app-text": "rgb(var(--app-text) / <alpha-value>)",
        trustBlue: "rgb(37 99 235 / <alpha-value>)",
        accent: {
          nexus: "rgb(var(--accent-nexus) / <alpha-value>)",
          business: "rgb(var(--accent-business) / <alpha-value>)",
          student: "rgb(var(--accent-student) / <alpha-value>)",
        },
        nexus: {
          bg: "#0f1116",
          surface: "#181b22",
          accent: "#2563eb",
        },
      },
      borderColor: {
        app: "rgb(var(--border) / <alpha-value>)",
      },
      ringColor: {
        trustBlue: "rgb(37 99 235 / <alpha-value>)",
      },
      ringOffsetColor: {
        "app-bg": "rgb(var(--app-bg) / <alpha-value>)",
        panel: "rgb(var(--panel-bg) / <alpha-value>)",
      },
      borderRadius: {
        card: "var(--radius-card)",
        button: "var(--radius-button)",
        input: "var(--radius-input)",
      },
      boxShadow: {
        ambient: "var(--shadow-ambient)",
        press: "var(--shadow-press)",
      },
      fontFamily: {
        sans: [
          "Inter Variable",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant("mode-student", '[data-mode="student"] &');
      addVariant("mode-business", '[data-mode="business"] &');
      addVariant("mode-nexus", '[data-mode="nexusos"] &');
    }),
  ],
};
