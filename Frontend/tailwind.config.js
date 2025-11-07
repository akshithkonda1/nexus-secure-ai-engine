export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "#2b3441",
        card: "#1f2733",
        accent: "#2563eb",
      },
      boxShadow: {
        soft: "0 6px 18px rgba(0,0,0,0.25)",
        glow: "0 0 20px rgba(37,99,235,0.4)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
