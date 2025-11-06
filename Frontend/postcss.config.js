// PostCSS config (ESM-compatible for Tailwind v4 + Vite)
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default {
  plugins: [tailwindcss(), autoprefixer()],
};
