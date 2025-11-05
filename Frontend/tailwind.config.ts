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



export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // App surface + typography system you’ve been using in classes
        app: "#0b0f14",
        "app-surface": "#11161c",
        panel: "#121820",
        ink: "#e6e9ef",
        muted: "#9aa3af",
        trustBlue: "#1E40AF", // Spurs “trust-blue” accent

        // Optional light theme counterparts (only if you toggle them)
        // "app-light": "#ffffff",
      },
      borderColor: {
        app: "rgba(255,255,255,0.08)",
      },
      ringColor: {
        trustBlue: "#1E40AF",
      },
    },
  },
  plugins: [],
} satisfies Config;

