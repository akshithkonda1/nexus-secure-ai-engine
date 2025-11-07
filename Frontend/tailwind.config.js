export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "#e5e7eb",
        accent: "#2563eb",
        panel: "#f4f6f8",
      },
      borderColor: {
        DEFAULT: "#e5e7eb",
        border: "#e5e7eb",
      },
      boxShadow: {
        soft: "0 6px 18px rgba(0,0,0,0.06)",
        glow: "0 0 20px rgba(37,99,235,0.3)",
      },
    },
  },
  plugins: [],
};
