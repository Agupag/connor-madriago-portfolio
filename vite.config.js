import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the build works at any path (GitHub Pages project site, custom domain, file preview).
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: { assetsDir: "app", chunkSizeWarningLimit: 900 },
});
