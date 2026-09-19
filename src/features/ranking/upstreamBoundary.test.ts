import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const rankingRoot = path.resolve("src/features/ranking");
const boundaryFile = path.join(rankingRoot, "upstreamUi.ts");

function sourceFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(target);
    return /\.[jt]sx?$/.test(entry.name) ? [target] : [];
  });
}

describe("ranking upstream UI boundary", () => {
  it("confines official-tool UI imports to the boundary module", () => {
    const violations = sourceFiles(rankingRoot)
      .filter((file) => file !== boundaryFile)
      .filter((file) =>
        /["']@upstream\/(?:ui\/|i18n["'])/.test(fs.readFileSync(file, "utf8")),
      )
      .map((file) => path.relative(rankingRoot, file));

    expect(violations).toEqual([]);
  });

  it("keeps upstream DOM inspection out of the ranking feature", () => {
    const upstreamDomKnowledge =
      /\b(?:MutationObserver|querySelector(?:All)?|closest)\b|MuiTabs-indicator|Mui-selected|data-pokesleep-extension-ranking/;
    const violations = sourceFiles(rankingRoot)
      .filter((file) => !/\.test\.[jt]sx?$/.test(file))
      .filter((file) =>
        upstreamDomKnowledge.test(fs.readFileSync(file, "utf8")),
      )
      .map((file) => path.relative(rankingRoot, file));

    expect(violations).toEqual([]);
  });
});
