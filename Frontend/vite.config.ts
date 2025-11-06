// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// ✅ Final unified Vite configuration for Nexus.ai Frontend
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // allows "@/components/..." etc.
    },
  },
  server: {
    port: 5173,  // dev server port
    open: true,  // auto-open browser
  },
});
