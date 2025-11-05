// tailwind.config.ts
import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],

  // Watch both .dark class and data-theme="dark"
  darkMode: ["class", '[data-theme="dark"]'],

  corePlugins: {
    preflight: false,
  },

  theme: {
    container: { center: true, padding: "1.5rem" },
    extend: {
      // Map the names you actually use in JSX to CSS variables (RGB triples)
      colors: {
        app: "rgb(var(--app-bg) / <alpha-value>)",        // used by bg-app
        panel: "rgb(var(--panel-bg) / <alpha-value>)",    // used by bg-panel
        ink: "rgb(var(--ink) / <alpha-value>)",           // used by text-ink
        muted: "rgb(var(--muted) / <alpha-value>)",
        trustBlue: "rgb(var(--trust-blue) / <alpha-value>)",
      },
      borderColor: {
        app: "rgb(var(--border) / <alpha-value>)",        // used by border-app
      },
      ringColor: {
        trustBlue: "rgb(var(--trust-blue) / <alpha-value>)",
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
          "'Inter Variable'",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "sans-serif",
        ],
      },
    },
  },

  plugins: [
    // Make “mode-*” variants target an ancestor attribute cleanly
    plugin(({ addVariant }) => {
      addVariant("mode-student", '[data-mode="student"] &');
      addVariant("mode-business", '[data-mode="business"] &');
      addVariant("mode-nexus",   '[data-mode="nexusos"] &');
    }),
    // Optional, but you use `prose` in bubbles:
    // require("@tailwindcss/typography"),
  ],

  future: {
    hoverOnlyWhenSupported: true,
  },
} satisfies Config;
