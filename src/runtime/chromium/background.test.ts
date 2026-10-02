import fs from "node:fs";
import vm from "node:vm";
import { describe, expect, it, vi } from "vitest";

function worker(fetch: ReturnType<typeof vi.fn>) {
  let listener: (
    message: unknown,
    sender: unknown,
    reply: (value: unknown) => void,
  ) => unknown;
  const context = {
    fetch,
    URL,
    AbortSignal,
    chrome: {
      runtime: {
        id: "extension",
        onMessage: {
          addListener(fn: typeof listener) {
            listener = fn;
          },
        },
      },
    },
  };
  vm.runInNewContext(fs.readFileSync("public/background.js", "utf8"), context);
  const sender = {
    id: "extension",
    url: "https://nitoyon.github.io/pokesleep-tool/iv/index.ja.html",
  };
  return {
    request: () =>
      new Promise<Record<string, unknown>>((resolve) =>
        listener({ type: "fetch-latest-upstream-data" }, sender, (value) =>
          resolve(value as Record<string, unknown>),
        ),
      ),
    untrusted: () =>
      listener(
        { type: "fetch-latest-upstream-data", url: "https://example.com" },
        { id: "other", url: "https://example.com" },
        vi.fn(),
      ),
  };
}
describe("upstream data worker", () => {
  it("shares overlapping requests but fetches again after completion", async () => {
    const fetch = vi
      .fn()
      .mockImplementation(async () => ({ ok: true, json: async () => [] }));
    const runtime = worker(fetch);
    const first = runtime.request();
    const second = runtime.request();
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(await first).toEqual(await second);
    await runtime.request();
    expect(fetch).toHaveBeenCalledTimes(4);
    expect(fetch.mock.calls.slice(0, 2).map((call) => call[0])).toEqual([
      "https://raw.githubusercontent.com/nitoyon/pokesleep-tool/main/src/data/pokemon.json",
      "https://raw.githubusercontent.com/nitoyon/pokesleep-tool/main/src/data/event.json",
    ]);
  });
  it("allows a retry after failure", async () => {
    const fetch = vi.fn().mockRejectedValue(new Error("offline"));
    const runtime = worker(fetch);
    expect(await runtime.request()).toEqual({ ok: false });
    fetch.mockResolvedValue({ ok: true, json: async () => [] });
    expect((await runtime.request()).ok).toBe(true);
  });
  it("rejects requests from unrelated origins or extension ids", () => {
    const fetch = vi.fn();
    expect(worker(fetch).untrusted()).toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });
});
