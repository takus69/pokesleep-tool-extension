import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

for (const fileName of ["LICENSE", "THIRD_PARTY_NOTICES.md"]) {
  const [source, distributed] = await Promise.all([
    readFile(fileName),
    readFile(`dist/${fileName}`),
  ]);
  assert.deepEqual(distributed, source, `${fileName} differs from its source`);
}

const packageLicenses = await readFile(
  "dist/THIRD_PARTY_PACKAGE_LICENSES.md",
  "utf8",
);
assert.match(packageLicenses, /^# Bundled npm package licenses/m);
assert.match(packageLicenses, /^## react@/m);
assert.doesNotMatch(packageLicenses, /No license text file was present/);

// Upstream's shared hooks import auth helpers, but the extension never uses
// them. Keep Firebase registration and cloud endpoints out of the MV3 bundle.
assert.doesNotMatch(packageLicenses, /^## (?:firebase@|@firebase\/)/m);
const content = await readFile("dist/content.js", "utf8");
assert.doesNotMatch(
  content,
  /pksl-nitoyon|firebaseapp\.com|identitytoolkit\.googleapis\.com/,
);
