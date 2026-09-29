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
