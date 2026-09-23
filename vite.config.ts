import { readFileSync } from "node:fs";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, normalizePath } from "vite";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "include-license-notices",
      generateBundle() {
        for (const fileName of ["LICENSE", "THIRD_PARTY_NOTICES.md"]) {
          this.emitFile({
            type: "asset",
            fileName,
            source: readFileSync(path.resolve(fileName)),
          });
        }
      },
    },
  ],
  test: {
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: [
      { find: "react-spring", replacement: "@react-spring/web" },
      {
        find: "@upstream",
        replacement: normalizePath(path.resolve("vendor/pokesleep-tool/src")),
      },
      ...["pokemon.json", "event.json", "field.json"].map((file) => ({
        find: normalizePath(
          path.resolve("vendor/pokesleep-tool/src/data", file),
        ),
        replacement: normalizePath(
          path.resolve("src/vendor/upstream-data", file),
        ),
      })),
    ],
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
