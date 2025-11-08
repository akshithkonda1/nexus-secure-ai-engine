export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      borderRadius: { xl: "12px", "2xl": "16px" },
      boxShadow: {
        soft: "0 8px 24px rgba(0,0,0,0.14)",
        card: "0 10px 28px rgba(0,0,0,0.18)",
        glow: "0 0 24px rgba(0,133,255,0.30)"
      }
    }
  },
  plugins: []
};
