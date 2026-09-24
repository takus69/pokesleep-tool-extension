import assert from "node:assert/strict";
import { test } from "node:test";
import { packageRootForModule } from "./bundled-package-licenses.mjs";

test("finds bundled package roots, including scoped and virtual modules", () => {
  assert.equal(
    packageRootForModule("C:/app/node_modules/react/jsx-runtime.js"),
    "C:/app/node_modules/react",
  );
  assert.equal(
    packageRootForModule(
      "\0C:/app/node_modules/@mui/material/Button.js?commonjs-proxy",
    ),
    "C:/app/node_modules/@mui/material",
  );
  assert.equal(packageRootForModule("C:/app/src/content.ts"), null);
});
