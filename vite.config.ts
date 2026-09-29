import { readFileSync } from "node:fs";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, normalizePath } from "vite";
import { bundledPackageLicenses } from "./scripts/bundled-package-licenses.mjs";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "include-license-notices",
      generateBundle(_options, bundle) {
        for (const fileName of ["LICENSE", "THIRD_PARTY_NOTICES.md"]) {
          this.emitFile({
            type: "asset",
            fileName,
            source: readFileSync(path.resolve(fileName)),
          });
        }
        this.emitFile({
          type: "asset",
          fileName: "THIRD_PARTY_PACKAGE_LICENSES.md",
          source: bundledPackageLicenses(bundle).text,
        });
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
