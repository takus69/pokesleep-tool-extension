import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  test: {
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: { "react-spring": "@react-spring/web" },
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
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: { content: "src/runtime/chromium/content.ts" },
      output: {
        entryFileNames: "content.js",
        assetFileNames: "assets/[name][extname]",
        inlineDynamicImports: true,
      },
    },
  },
});
