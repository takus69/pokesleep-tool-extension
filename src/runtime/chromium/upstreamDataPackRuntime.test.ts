import { afterEach, describe, expect, it, vi } from "vitest";
import { ChromiumUpstreamDataPackRuntime } from "./upstreamDataPackRuntime";

describe("ChromiumUpstreamDataPackRuntime", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("uses the compatible cache key and refresh message", async () => {
    const get = vi.fn().mockResolvedValue({
      "upstream-data-pack.v1": { checkedAt: 1 },
    });
    const set = vi.fn().mockResolvedValue(undefined);
    const sendMessage = vi
      .fn()
      .mockResolvedValue({ ok: true, pokemon: [], event: {} });
    vi.stubGlobal("chrome", {
      storage: { local: { get, set } },
      runtime: { sendMessage },
    });
    const runtime = new ChromiumUpstreamDataPackRuntime();

    expect(await runtime.readCachedValue()).toEqual({ checkedAt: 1 });
    await runtime.writeCachedValue({
      bundledCommit: "new-bundled-commit",
      checkedAt: 2,
      pokemon: ["pokemon"],
      event: { event: true },
    });
    expect(await runtime.fetchLatest()).toEqual({ pokemon: [], event: {} });

    expect(get).toHaveBeenCalledWith("upstream-data-pack.v1");
    expect(set).toHaveBeenCalledWith({
      "upstream-data-pack.v1": {
        bundledCommit: "new-bundled-commit",
        checkedAt: 2,
        pokemon: ["pokemon"],
        event: { event: true },
      },
    });
    expect(sendMessage).toHaveBeenCalledWith({
      type: "fetch-latest-upstream-data",
    });
  });

  it("fails closed when the worker cannot fetch data", async () => {
    vi.stubGlobal("chrome", {
      runtime: { sendMessage: vi.fn().mockResolvedValue({ ok: false }) },
    });
    const runtime = new ChromiumUpstreamDataPackRuntime();
    await expect(runtime.fetchLatest()).rejects.toThrow("unavailable");
  });
  it("passes optional name JSON through to the integration validator", async () => {
    const pokemonNames = { ja: { pokemons: { Foongus: "タマゲタケ" } } };
    vi.stubGlobal("chrome", {
      runtime: {
        sendMessage: vi.fn().mockResolvedValue({
          ok: true,
          pokemon: [],
          event: {},
          pokemonNames,
        }),
      },
    });
    expect(await new ChromiumUpstreamDataPackRuntime().fetchLatest()).toEqual({
      pokemon: [],
      event: {},
      pokemonNames,
    });
  });
});
