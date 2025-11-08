import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        border: "#2b3441",
        card: "#1f2733",
        accent: "#2563eb",
      },
      boxShadow: {
        glow: "0 0 20px rgba(37,99,235,0.4)",
      },
      borderRadius: {
        xl: "1rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
