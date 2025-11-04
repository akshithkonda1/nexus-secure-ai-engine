import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ["class"],
  corePlugins: {
    preflight: false
  },
  theme: {
    container: {
      center: true,
      padding: "1.5rem"
    },
    extend: {
      colors: {
        "app-bg": "rgb(var(--app-bg) / <alpha-value>)",
        "app-surface": "rgb(var(--panel-bg) / <alpha-value>)",
        "app-text": "rgb(var(--ink) / <alpha-value>)",
        "app-text-muted": "rgb(var(--muted) / <alpha-value>)",
        "app-border": "rgb(var(--border) / <alpha-value>)",
        "accent-student": "var(--accent-student)",
        "accent-business": "var(--accent-business)",
        "accent-nexus": "var(--accent-nexus)",
        silver: "#C0C0C0",
        trustBlue: "#1E40AF"
      },
      borderRadius: {
        card: "var(--radius-card)",
        button: "var(--radius-button)",
        input: "var(--radius-input)"
      },
      boxShadow: {
        ambient: "var(--shadow-ambient)",
        press: "var(--shadow-press)"
      },
      fontFamily: {
        sans: ["'Inter Variable'", "system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "sans-serif"]
      }
    }
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant("mode-student", "&[data-mode='student'] *");
      addVariant("mode-business", "&[data-mode='business'] *");
      addVariant("mode-nexusos", "&[data-mode='nexusos'] *");
    }),
  ],
  future: {
    hoverOnlyWhenSupported: true
  }
};

export default config;
