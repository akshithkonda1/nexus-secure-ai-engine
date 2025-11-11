// Frontend/tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "SF Pro Display",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Inter",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        bg: "rgb(var(--bg))",
        surface: "rgb(var(--surface))",
        panel: "rgb(var(--panel))",
        text: "rgb(var(--text))",
        border: "rgb(var(--border))",
        brand: "rgb(var(--brand))",
        brand2: "rgb(var(--brand-2))",
        "brand-alt": "#009EFF",
        purple: "#9360FF",
        lilac: "#C5B9DA",
        accent: "#0085FF",
        "accent-foreground": "#F9FAFC",
      },
      boxShadow: {
        soft: "var(--elev-1)",
        lift: "var(--elev-2)",
        card: "0 10px 28px rgba(0,0,0,0.22)",
        glow: "0 0 24px rgba(0,133,255,0.35)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
