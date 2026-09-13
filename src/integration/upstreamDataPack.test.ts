import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PokemonIv from "../../../pokesleep-tool/src/util/PokemonIv";
import eventJson from "../vendor/upstream-data/event.json";
import pokemonJson from "../vendor/upstream-data/pokemon.json";
import {
  applyUpstreamDataPack,
  prepareUpstreamDataPack,
  validateUpstreamDataPack,
} from "./upstreamDataPack";

describe("upstream data pack", () => {
  let baseline: ReturnType<typeof validateUpstreamDataPack>;

  beforeEach(() => {
    baseline = validateUpstreamDataPack(pokemonJson, eventJson);
    applyUpstreamDataPack(baseline, "bundled", 0);
  });

  afterEach(() => vi.unstubAllGlobals());

  it("accepts and applies the synchronized upstream data", () => {
    expect(baseline.issues).toContainEqual({
      kind: "pokemon",
      name: "Mewtwo",
      reason: "unsupported main skill",
    });
    expect(baseline.issues).toHaveLength(1);
    expect(baseline.pokemon).toHaveLength(pokemonJson.length - 1);
  });

  it("accepts a new Pokémon using only supported mechanics", () => {
    const template = structuredClone(pokemonJson[0]);
    const next = {
      ...template,
      id: 9999,
      name: "Future Test Pokemon",
      ancestor: null,
    };
    const pack = validateUpstreamDataPack([...pokemonJson, next], eventJson);
    applyUpstreamDataPack(pack, "network", 1);

    expect(pack.pokemon.at(-1)?.name).toBe("Future Test Pokemon");
    expect(new PokemonIv({ pokemonName: next.name }).pokemon.name).toBe(
      next.name,
    );
  });

  it("excludes only a Pokémon that requires an unknown mechanic", () => {
    const template = structuredClone(pokemonJson[0]);
    const next = {
      ...template,
      id: 9999,
      name: "Unsupported Test Pokemon",
      skill: "Future Skill",
      ancestor: null,
    };
    const pack = validateUpstreamDataPack([...pokemonJson, next], eventJson);

    expect(pack.pokemon.some((pokemon) => pokemon.name === next.name)).toBe(
      false,
    );
    expect(pack.issues).toContainEqual({
      kind: "pokemon",
      name: next.name,
      reason: "unsupported main skill",
    });
  });

  it("rejects a truncated pack instead of replacing known data", () => {
    expect(() => validateUpstreamDataPack([], eventJson)).toThrow(
      "missing or truncated",
    );
  });

  it("fetches, validates, caches, and applies a network pack atomically", async () => {
    const set = vi.fn();
    vi.stubGlobal("chrome", {
      runtime: {
        sendMessage: vi.fn().mockResolvedValue({ shouldRefresh: true }),
      },
      storage: { local: { get: vi.fn().mockResolvedValue({}), set } },
    });
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => pokemonJson })
        .mockResolvedValueOnce({ ok: true, json: async () => eventJson }),
    );

    const status = await prepareUpstreamDataPack(1234);

    expect(status.source).toBe("network");
    expect(status.pokemonCount).toBe(baseline.pokemon.length);
    expect(set).toHaveBeenCalledOnce();
  });

  it("uses cached data without fetching again in the same browser session", async () => {
    vi.stubGlobal("chrome", {
      runtime: {
        sendMessage: vi.fn().mockResolvedValue({ shouldRefresh: false }),
      },
      storage: {
        local: {
          get: vi.fn().mockResolvedValue({
            "upstream-data-pack.v1": {
              checkedAt: 1234,
              pokemon: pokemonJson,
              event: eventJson,
            },
          }),
          set: vi.fn(),
        },
      },
    });
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);

    const status = await prepareUpstreamDataPack(5678);

    expect(status.source).toBe("cached");
    expect(fetch).not.toHaveBeenCalled();
  });
});
