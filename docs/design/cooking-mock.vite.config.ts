import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Development-only renderer for the design mock. Not part of the MV3 bundle.
export default defineConfig({
  root: path.resolve("docs/design"),
  publicDir: false,
  plugins: [react()],
  resolve: {
    alias: {
      "@upstream": path.resolve("vendor/pokesleep-tool/src"),
      "react-spring": "@react-spring/web",
    },
    dedupe: [
      "react",
      "react-dom",
      "@emotion/react",
      "@emotion/styled",
      "@mui/material",
      "i18next",
      "react-i18next",
    ],
  },
  server: { host: "127.0.0.1", port: 8765, strictPort: true },
  build: {
    target: "es2022",
    outDir: path.resolve("dist/cooking-mock"),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve("docs/design/cooking-planner-mock.html"),
    },
  },
});
