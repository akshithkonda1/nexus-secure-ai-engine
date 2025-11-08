import forms from "@tailwindcss/forms";
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        card: "var(--card)",
        border: "var(--border)",
        muted: "var(--muted)",
        foreground: "var(--foreground)",
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        glow: "var(--shadow-glow)",
      },
      backgroundImage: {
        "glass-light":
          "linear-gradient(135deg, color-mix(in srgb, var(--card) 96%, transparent), color-mix(in srgb, var(--card) 80%, transparent))",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "\"Segoe UI\"", "sans-serif"],
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [forms()],
};

export default config;
