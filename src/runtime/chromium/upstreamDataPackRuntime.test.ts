import { afterEach, describe, expect, it, vi } from "vitest";
import { ChromiumUpstreamDataPackRuntime } from "./upstreamDataPackRuntime";

describe("ChromiumUpstreamDataPackRuntime", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("uses the compatible cache key and refresh message", async () => {
    const get = vi.fn().mockResolvedValue({
      "upstream-data-pack.v1": { checkedAt: 1 },
    });
    const set = vi.fn().mockResolvedValue(undefined);
    const sendMessage = vi.fn().mockResolvedValue({ shouldRefresh: true });
    vi.stubGlobal("chrome", {
      storage: { local: { get, set } },
      runtime: { sendMessage },
    });
    const runtime = new ChromiumUpstreamDataPackRuntime();

    expect(await runtime.readCachedValue()).toEqual({ checkedAt: 1 });
    await runtime.writeCachedValue({
      checkedAt: 2,
      pokemon: ["pokemon"],
      event: { event: true },
    });
    expect(await runtime.claimSessionRefresh()).toBe(true);

    expect(get).toHaveBeenCalledWith("upstream-data-pack.v1");
    expect(set).toHaveBeenCalledWith({
      "upstream-data-pack.v1": {
        checkedAt: 2,
        pokemon: ["pokemon"],
        event: { event: true },
      },
    });
    expect(sendMessage).toHaveBeenCalledWith({
      type: "claim-upstream-data-refresh",
    });
  });

  it("fetches only the two non-executable upstream JSON files", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ["pokemon"] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ event: true }) });
    vi.stubGlobal("fetch", fetch);
    const runtime = new ChromiumUpstreamDataPackRuntime();

    await expect(runtime.fetchLatest()).resolves.toEqual({
      pokemon: ["pokemon"],
      event: { event: true },
    });
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls.map(([url]) => url)).toEqual([
      "https://raw.githubusercontent.com/nitoyon/pokesleep-tool/main/src/data/pokemon.json",
      "https://raw.githubusercontent.com/nitoyon/pokesleep-tool/main/src/data/event.json",
    ]);
  });
});
