import type { Config } from "tailwindcss";

export default {
  darkMode: ["class", "[data-theme='dark']"],
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
        "zora-night": "rgb(var(--zora-night) / <alpha-value>)",
        "zora-deep": "rgb(var(--zora-deep) / <alpha-value>)",
        "zora-space": "rgb(var(--zora-space) / <alpha-value>)",
        "zora-soft": "rgb(var(--zora-soft) / <alpha-value>)",
        "zora-white": "var(--zora-white)",
        "zora-muted": "var(--zora-muted)",
        "zora-border": "var(--zora-border)",
      },
      backgroundImage: {
        "zora-aurora": "var(--zora-gradient)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        lift: "var(--shadow-lift)",
        "zora-glow": "0 0 40px rgba(62, 228, 255, 0.23)",
        "zora-soft": "0 14px 40px rgba(15, 23, 42, 0.75)",
      },
      borderRadius: {
        card: "var(--radius-card)",
        button: "var(--radius-button)",
        input: "var(--radius-input)",
        "zora-lg": "18px",
        "zora-xl": "24px",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
