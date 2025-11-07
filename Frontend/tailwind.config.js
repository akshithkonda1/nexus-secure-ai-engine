/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        // brand
        accent: "#2563eb",

        // dark
        surface: "#0e1117",
        elevated: "#161b22",
        panel: "#1c222b",
        card: "#1f2733",
        border: "#2b3441",
        text: "#e6edf3",

        // light
        lbg: "#f9fafb",
        lsurface: "#ffffff",
        lpanel: "#f4f6f8",
        lborder: "#e5e7eb",
        ltext: "#111827",
      },
      boxShadow: {
        soft: "0 6px 18px rgba(0,0,0,.25)",
        deep: "0 8px 24px rgba(0,0,0,.35)",
        glow: "0 0 20px rgba(37,99,235,.4)",
      },
      borderRadius: {
        xl: "1rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
