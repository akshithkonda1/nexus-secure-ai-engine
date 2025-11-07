import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@theme": path.resolve(__dirname, "./src/theme"),
    },
  },
  css: {
    postcss: "./postcss.config.js", // ensure Vite uses this config
  },
  server: {
    hmr: { overlay: false },
    port: 5173,
    open: true,
  },
});
