import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("upstream data pack runtime boundary", () => {
  it("keeps browser APIs and network locations out of integration", () => {
    const sources = ["upstreamDataPack.ts", "upstreamDataPackRefresh.ts"].map(
      (file) => fs.readFileSync(path.resolve("src/integration", file), "utf8"),
    );

    for (const source of sources) {
      expect(source).not.toMatch(/\bchrome\./);
      expect(source).not.toMatch(/\bfetch\s*\(/);
      expect(source).not.toContain("raw.githubusercontent.com");
    }
  });
});
