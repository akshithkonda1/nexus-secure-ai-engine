// PostCSS config for Tailwind v4 + Vite (ESM safe)
import tailwind from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";

export default {
  plugins: [tailwind(), autoprefixer()],
};
