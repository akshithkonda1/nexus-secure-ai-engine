import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  server: { host: "0.0.0.0", port: 5173 },
  test: {
    environment: "jsdom",
    setupFiles: path.resolve(__dirname, "vitest.setup.ts"),
    environmentOptions: {
      jsdom: {
        url: "http://localhost"
      }
    }
  }
});
