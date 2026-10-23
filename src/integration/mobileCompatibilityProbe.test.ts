// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  canStartMobileRanking,
  formatMobileCompatibility,
  inspectMobileCompatibility,
} from "./mobileCompatibilityProbe";

describe("mobile compatibility probe", () => {
  beforeEach(() => {
    document.body.innerHTML = `<main id="root">
      <div style="position: sticky"><div><div><div role="tablist">
        <button role="tab">A</button><button role="tab">B</button>
        <button role="tab">C</button>
      </div></div></div></div></main>`;
  });

  function inspect(readStorage: (key: string) => string | null) {
    return inspectMobileCompatibility({
      url: new URL(
        "https://nitoyon.github.io/pokesleep-tool/iv/?private#secret",
      ),
      document,
      readStorage,
    });
  }

  it("never reads storage on another origin or path", () => {
    const readStorage = vi.fn();
    for (const url of [
      "https://example.com/pokesleep-tool/iv/",
      "https://nitoyon.github.io/another-tool/",
      "https://nitoyon.github.io/pokesleep-tool-other/",
    ]) {
      expect(
        canStartMobileRanking(
          inspectMobileCompatibility({
            url: new URL(url),
            document,
            readStorage,
          }),
        ),
      ).toBe(false);
    }
    expect(readStorage).not.toHaveBeenCalled();
  });

  it("reports only known keys and shape, without exposing values or URL secrets", () => {
    const values: Record<string, string> = {
      PstPokeBox: '["sensitive-iv@private-name"]',
      PstStrenghParam: '{"event":"private-event"}',
      PstIvState: '{"iv":"sensitive-iv"}',
      PstPokemonBoxParam: '{"sort":"private-sort"}',
    };
    const before = JSON.stringify(values);
    const report = inspect((key) => values[key] ?? null);
    expect(canStartMobileRanking(report)).toBe(true);
    expect(Object.values(report.storage)).toEqual(
      Array(4).fill("present-json-shape"),
    );
    expect(JSON.stringify(report)).not.toMatch(/private|sensitive|secret/);
    expect(formatMobileCompatibility(report)).not.toMatch(
      /private|sensitive|secret/,
    );
    expect(JSON.stringify(values)).toBe(before);
  });

  it.each([
    "not-json",
    "null",
    "42",
    '"string"',
    "[{}]",
    "{}",
  ])("rejects unknown box shape %s", (box) => {
    const report = inspect((key) => (key === "PstPokeBox" ? box : null));
    expect(report.storage.box).toBe("invalid-json-shape");
    expect(canStartMobileRanking(report)).toBe(false);
  });

  it.each([
    "not-json",
    "null",
    "42",
    '"string"',
    "[]",
  ])("rejects unknown object shape %s", (raw) => {
    const report = inspect((key) => (key === "PstIvState" ? raw : null));
    expect(report.storage.iv).toBe("invalid-json-shape");
    expect(canStartMobileRanking(report)).toBe(false);
  });

  it("reports storage access denial without leaking the exception", () => {
    const report = inspect(() => {
      throw new Error("private-browser-data");
    });
    expect(Object.values(report.storage)).toEqual(Array(4).fill("unavailable"));
    expect(canStartMobileRanking(report)).toBe(false);
    expect(formatMobileCompatibility(report)).not.toContain("private");
  });

  it("allows missing saved values but stops on missing DOM contracts", () => {
    expect(canStartMobileRanking(inspect(() => null))).toBe(true);
    document.querySelector("[role=tablist]")?.remove();
    expect(canStartMobileRanking(inspect(() => null))).toBe(false);
    document.getElementById("root")?.remove();
    expect(inspect(() => null).root).toBe("missing");
  });
});
