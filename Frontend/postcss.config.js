// ✅ Correct PostCSS config for Tailwind v4 + Vite
import tailwind from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";

export default {
  plugins: [tailwind(), autoprefixer()],
};
