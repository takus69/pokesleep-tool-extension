import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const manifest = JSON.parse(
  await readFile(path.join(root, "public/manifest.json"), "utf8"),
);

async function checkPng(relativePath, width, height) {
  const image = await readFile(path.join(root, relativePath));
  assert.equal(
    image.subarray(0, 8).toString("hex"),
    "89504e470d0a1a0a",
    relativePath,
  );
  assert.equal(image.readUInt32BE(16), width, `${relativePath} width`);
  assert.equal(image.readUInt32BE(20), height, `${relativePath} height`);
}

for (const size of [16, 48, 128]) {
  const expected = `icons/icon-${size}.png`;
  assert.equal(manifest.icons?.[size], expected);
  await checkPng(`public/${expected}`, size, size);
}
await checkPng("assets/store/edge-logo-300.png", 300, 300);
await checkPng("assets/store/promo-small-440x280.png", 440, 280);
console.log("Store asset dimensions and manifest paths verified.");
