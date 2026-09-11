import { describe, expect, it } from "vitest";
import { readToolSnapshot, type UpstreamEnvironment } from "./upstreamAdapter";

const environment = (
  overrides: Partial<UpstreamEnvironment> = {},
): UpstreamEnvironment => ({
  url: new URL("https://nitoyon.github.io/pokesleep-tool/iv/"),
  rootExists: true,
  readStorage: () => null,
  ...overrides,
});

describe("readToolSnapshot", () => {
  it("accepts the upstream IV page", () => {
    expect(readToolSnapshot(environment())).toEqual({
      ok: true,
      value: { page: "iv", hasIvState: false },
    });
  });

  it("fails closed on another origin", () => {
    expect(
      readToolSnapshot(environment({ url: new URL("https://example.com/") })),
    ).toMatchObject({
      ok: false,
      error: { code: "unsupported-origin" },
    });
  });

  it("fails closed when the root contract is missing", () => {
    expect(readToolSnapshot(environment({ rootExists: false }))).toMatchObject({
      ok: false,
      error: { code: "missing-root" },
    });
  });

  it("fails closed on malformed upstream storage", () => {
    expect(
      readToolSnapshot(environment({ readStorage: () => "not-json" })),
    ).toMatchObject({
      ok: false,
      error: { code: "invalid-storage" },
    });
  });
});
