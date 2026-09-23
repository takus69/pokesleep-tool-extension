import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

for (const fileName of ["LICENSE", "THIRD_PARTY_NOTICES.md"]) {
  const [source, distributed] = await Promise.all([
    readFile(fileName),
    readFile(`dist/${fileName}`),
  ]);
  assert.deepEqual(distributed, source, `${fileName} differs from its source`);
}
