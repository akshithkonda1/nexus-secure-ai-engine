import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg))",
        surface: "rgb(var(--surface))",
        panel: "rgb(var(--panel))",
        text: "rgb(var(--text))",
        brand: "rgb(var(--brand))",
        brand2: "rgb(var(--brand-2))",
      },
      boxShadow: {
        soft: "var(--elev-1)",
        lift: "var(--elev-2)",
      },
      borderRadius: { '2xl': '1.25rem' },
    },
  },
  plugins: [],
} satisfies Config;
