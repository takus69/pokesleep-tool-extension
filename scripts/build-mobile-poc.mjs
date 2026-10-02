import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { build } from "vite";

const outDir = "dist-mobile-poc";
await mkdir(outDir, { recursive: true });
const measurements = {};

for (const [name, entry] of [
  ["probe", "src/runtime/mobile-poc/probe.ts"],
  ["ranking", "src/runtime/mobile-poc/content.ts"],
]) {
  await build({
    configFile: path.resolve("vite.config.ts"),
    publicDir: false,
    build: {
      outDir,
      emptyOutDir: name === "probe",
      target: "es2020",
      rollupOptions: {
        input: path.resolve(entry),
        output: {
          format: "iife",
          entryFileNames: `${name}.js`,
          inlineDynamicImports: true,
        },
      },
    },
  });
  const code = await readFile(path.join(outDir, `${name}.js`), "utf8");
  // Encode the entire URL payload: hashes, percent signs and Unicode must survive
  // saving as a bookmark. void prevents replacing the upstream document.
  const bookmarklet = `javascript:void ${encodeURIComponent(`(function(){${code.trim()}\n})()`)}`;
  await writeFile(path.join(outDir, `${name}.bookmarklet.txt`), bookmarklet);
  measurements[name] = {
    javascriptBytes: Buffer.byteLength(code),
    gzipBytes: gzipSync(code).length,
    bookmarkletCharacters: bookmarklet.length,
    sha256: createHash("sha256").update(code).digest("hex"),
  };
  if (name === "ranking") {
    await writeFile(
      path.join(outDir, "ranking.user.js"),
      [
        "// ==UserScript==",
        "// @name Pokémon Sleep Tool Mobile PoC #58",
        "// @namespace https://github.com/takus69/pokesleep-tool-extension",
        "// @version 0.0.1",
        "// @description Experimental bundled-data-only ranking; not a store release",
        "// @match https://nitoyon.github.io/pokesleep-tool/*",
        "// @grant none",
        "// @run-at document-idle",
        "// ==/UserScript==",
        code,
      ].join("\n"),
    );
  }
}
await writeFile(
  path.join(outDir, "measurements.json"),
  `${JSON.stringify(measurements, null, 2)}\n`,
);
console.log(JSON.stringify(measurements, null, 2));
