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
  it("returns icon source as text and keeps JSON available when icons fail", async () => {
    let iconFailure = false;
    const fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.endsWith("PokemonIconData.ts")) {
        if (iconFailure) throw new Error("icon offline");
        return { ok: true, text: async () => "plain icon data" };
      }
      return { ok: true, json: async () => [] };
    });
    const runtime = worker(fetch);
    expect((await runtime.request()).pokemonIconSource).toBe("plain icon data");
    iconFailure = true;
    expect(await runtime.request()).toMatchObject({
      ok: true,
      pokemonIconSource: null,
    });
  });
  it("shares overlapping requests but fetches again after completion", async () => {
    const fetch = vi
      .fn()
      .mockImplementation(async () => ({ ok: true, json: async () => [] }));
    const runtime = worker(fetch);
    const first = runtime.request();
    const second = runtime.request();
    expect(fetch).toHaveBeenCalledTimes(8);
    expect(await first).toEqual(await second);
    await runtime.request();
    expect(fetch).toHaveBeenCalledTimes(16);
    expect(fetch.mock.calls.slice(0, 8).map((call) => call[0])).toEqual([
      "https://raw.githubusercontent.com/nitoyon/pokesleep-tool/main/src/data/pokemon.json",
      "https://raw.githubusercontent.com/nitoyon/pokesleep-tool/main/src/data/event.json",
      ...["en", "ja", "ko", "zh-CN", "zh-TW"].map(
        (language) =>
          `https://raw.githubusercontent.com/nitoyon/pokesleep-tool/main/src/i18n/${language}/pokemons.json`,
      ),
      "https://raw.githubusercontent.com/nitoyon/pokesleep-tool/main/src/ui/IvCalc/PokemonIconData.ts",
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
  it("keeps calculation data available when one translation fails and retries next time", async () => {
    let offline = true;
    const fetch = vi.fn().mockImplementation(async (url: string) => {
      if (offline && url.includes("/ja/")) throw new Error("offline");
      return {
        ok: true,
        json: async () => ({ pokemons: { Foongus: "タマゲタケ" } }),
      };
    });
    const runtime = worker(fetch);
    const first = await runtime.request();
    expect(first.ok).toBe(true);
    expect(first.pokemonNames).toMatchObject({ ja: null });
    offline = false;
    expect((await runtime.request()).pokemonNames).toMatchObject({
      ja: { pokemons: { Foongus: "タマゲタケ" } },
    });
    expect(fetch).toHaveBeenCalledTimes(16);
  });
});
