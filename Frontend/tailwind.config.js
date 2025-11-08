/** Tailwind config (ESM) */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "#2b3441",
        accent: "#2563eb"
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem"
      }
    }
  },
  plugins: []
};
