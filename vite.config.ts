import { defineConfig } from "vite";

export default defineConfig({
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: { content: "src/runtime/chromium/content.ts" },
      output: {
        entryFileNames: "content.js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
