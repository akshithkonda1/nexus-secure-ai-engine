import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        foreground: "rgb(var(--text) / <alpha-value>)",
        muted: "rgb(var(--subtle) / <alpha-value>)",
        brand: "rgb(var(--brand) / <alpha-value>)",
        "brand-soft": "rgb(var(--brand-soft) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        nexus: {
          blue: "#009EFF",
          azure: "#0085FF",
          mpurple: "#9360FF",
          alabaster: "#F9FAFC",
          cod: "#090B1E",
          prelude: "#C5B9DA",
        },
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        lift: "var(--shadow-lift)",
        glass:
          "0 1px 0 rgba(255,255,255,0.6) inset, 0 1px 2px rgba(2,6,23,0.06), 0 6px 20px rgba(2,6,23,0.06)",
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        card: "var(--radius-card)",
        button: "var(--radius-button)",
        input: "var(--radius-input)",
        "3xl": "1.5rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
