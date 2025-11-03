import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ["class", "[data-theme='dark']"],
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
        "app-bg": "var(--bg)",
        "app-surface": "var(--surface)",
        "app-text": "var(--text)",
        "app-text-muted": "var(--text-muted)",
        "app-border": "var(--border)",
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
    plugin(({ addUtilities }) => {
      addUtilities({
        ".bg-app": { backgroundColor: "var(--bg)" },
        ".bg-surface": { backgroundColor: "var(--surface)" },
        ".text-app": { color: "var(--text)" },
        ".text-muted": { color: "var(--text-muted)" },
        ".border-app": { borderColor: "var(--border)" }
      });
    })
  ],
  future: {
    hoverOnlyWhenSupported: true
  }
};

export default config;
