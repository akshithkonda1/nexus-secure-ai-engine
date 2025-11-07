import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // ← important
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nexus: {
          bg: "#0f1116",
          surface: "#181b22",
          accent: "#2563eb",
        },
      },
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant("mode-student", '[data-mode="student"] &');
      addVariant("mode-business", '[data-mode="business"] &');
      addVariant("mode-nexus", '[data-mode="nexusos"] &');
    }),
  ],
};
