export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "#1f2937",
        primary: "#3B82F6",
        surface: "#111827",
        elevated: "#1F2937",
        muted: "#9CA3AF",
        accent: "#10B981",
      },
      borderColor: {
        DEFAULT: "#1f2937",
        border: "#1f2937",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
      },
      boxShadow: {
        card: "0 8px 24px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
