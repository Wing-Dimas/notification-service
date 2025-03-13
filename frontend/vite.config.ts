import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    minify: false,
    sourcemap: true,
    target: "es2017",
  },
  // ONLY DEVELOMPMENT
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace("/api", ""),
      },
    },
  },
});
