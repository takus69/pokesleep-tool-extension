import { beforeEach, describe, expect, it, vi } from "vitest";
import eventJson from "../vendor/upstream-data/event.json";
import bundledManifest from "../vendor/upstream-data/manifest.json";
import pokemonJson from "../vendor/upstream-data/pokemon.json";
import {
  applyUpstreamDataPack,
  getUpstreamDataStatus,
  validateUpstreamDataPack,
} from "./upstreamDataPack";
import {
  prepareUpstreamDataPack,
  refreshUpstreamDataPack,
  type UpstreamDataPackLogger,
  type UpstreamDataPackRuntime,
} from "./upstreamDataPackRefresh";

function runtime(
  overrides: Partial<UpstreamDataPackRuntime> = {},
): UpstreamDataPackRuntime {
  return {
    readCachedValue: vi.fn().mockResolvedValue(undefined),
    writeCachedValue: vi.fn().mockResolvedValue(undefined),
    fetchLatest: vi.fn().mockResolvedValue({
      pokemon: pokemonJson,
      event: eventJson,
    }),
    ...overrides,
  };
}

function logger(): UpstreamDataPackLogger {
  return { error: vi.fn(), warn: vi.fn() };
}

describe("prepareUpstreamDataPack", () => {
  beforeEach(() => {
    const baseline = validateUpstreamDataPack(pokemonJson, eventJson);
    applyUpstreamDataPack(baseline, "bundled", 0);
  });

  it("fetches, validates, caches, and applies a network pack atomically", async () => {
    const writeCachedValue = vi.fn().mockResolvedValue(undefined);
    const adapter = runtime({
      writeCachedValue,
    });

    await prepareUpstreamDataPack(adapter, logger());
    await refreshUpstreamDataPack(adapter, 1234, logger());
    const status = getUpstreamDataStatus();

    expect(status.source).toBe("bundled");
    expect(writeCachedValue).toHaveBeenCalledWith({
      bundledCommit: bundledManifest.commit,
      checkedAt: 1234,
      pokemon: pokemonJson,
      event: eventJson,
    });
  });

  it("loads cached data without waiting for network during startup", async () => {
    const fetchLatest = vi.fn();
    const adapter = runtime({
      readCachedValue: vi.fn().mockResolvedValue({
        bundledCommit: bundledManifest.commit,
        checkedAt: 1234,
        pokemon: pokemonJson,
        event: eventJson,
      }),
      fetchLatest,
    });

    const status = await prepareUpstreamDataPack(adapter, logger());

    expect(status.source).toBe("cached");
    expect(status.checkedAt).toBe(1234);
    expect(fetchLatest).not.toHaveBeenCalled();
  });

  it("checks on every page startup and recovers from a failed request", async () => {
    const changed = structuredClone(pokemonJson);
    changed[0].frequency += 1;
    const fetchLatest = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue({ pokemon: changed, event: eventJson });
    const adapter = runtime({ fetchLatest });
    await prepareUpstreamDataPack(adapter, logger());
    await refreshUpstreamDataPack(adapter, 1, logger());
    expect(getUpstreamDataStatus().source).toBe("bundled");
    await prepareUpstreamDataPack(adapter, logger());
    await refreshUpstreamDataPack(adapter, 2, logger());
    expect(fetchLatest).toHaveBeenCalledTimes(2);
    expect(getUpstreamDataStatus().source).toBe("network");
  });

  it("keeps the validated cache when a network pack is invalid", async () => {
    const log = logger();
    const adapter = runtime({
      readCachedValue: vi.fn().mockResolvedValue({
        bundledCommit: bundledManifest.commit,
        checkedAt: 1234,
        pokemon: pokemonJson,
        event: eventJson,
      }),
      fetchLatest: vi.fn().mockResolvedValue({ pokemon: [], event: {} }),
    });

    await prepareUpstreamDataPack(adapter, log);
    await refreshUpstreamDataPack(adapter, 5678, log);
    const status = getUpstreamDataStatus();

    expect(status.source).toBe("cached");
    expect(status.checkedAt).toBe(1234);
    expect(log.warn).toHaveBeenCalledOnce();
  });

  it.each([
    undefined,
    "aec938d72d52fe875029aae13f58ae850db2fe98",
  ])("does not let an older extension cache replace newer bundled data: %s", async (bundledCommit) => {
    const oldPokemon = structuredClone(pokemonJson);
    const mewtwo = oldPokemon.find((pokemon) => pokemon.name === "Mewtwo");
    if (!mewtwo) throw new Error("Mewtwo fixture is missing");
    mewtwo.frequency = 0;
    const adapter = runtime({
      readCachedValue: vi.fn().mockResolvedValue({
        bundledCommit,
        checkedAt: 1234,
        pokemon: oldPokemon,
        event: eventJson,
      }),
    });

    const status = await prepareUpstreamDataPack(adapter, logger());

    expect(status.source).toBe("bundled");
    expect(status.pokemonCount).toBe(pokemonJson.length);
  });

  it("caches new names, restores them offline, and preserves them after translation failure", async () => {
    const changed = [
      ...pokemonJson,
      ...["Foongus", "Amoonguss"].map((name, index) => ({
        ...pokemonJson[0],
        id: 590 + index,
        name,
      })),
    ];
    const pokemonNames = {
      ja: { pokemons: { Foongus: "タマゲタケ", Amoonguss: "モロバレル" } },
    };
    const writeCachedValue = vi.fn().mockResolvedValue(undefined);
    const adapter = runtime({
      writeCachedValue,
      fetchLatest: vi.fn().mockResolvedValue({
        pokemon: changed,
        event: eventJson,
        pokemonNames,
      }),
    });
    await prepareUpstreamDataPack(adapter, logger());
    await refreshUpstreamDataPack(adapter, 10, logger());
    expect(getUpstreamDataStatus().pokemonNames).toEqual(pokemonNames);
    const cached = writeCachedValue.mock.calls[0][0];
    expect(cached.pokemonNames).toEqual(pokemonNames);

    const offline = runtime({
      readCachedValue: vi.fn().mockResolvedValue(cached),
      fetchLatest: vi.fn().mockRejectedValue(new Error("offline")),
    });
    await prepareUpstreamDataPack(offline, logger());
    await refreshUpstreamDataPack(offline, 11, logger());
    expect(getUpstreamDataStatus().source).toBe("cached");
    expect(getUpstreamDataStatus().pokemonNames).toEqual(pokemonNames);

    const partial = runtime({
      fetchLatest: vi.fn().mockResolvedValue({
        pokemon: changed,
        event: eventJson,
        pokemonNames: { ja: { pokemons: { Foongus: "{{invalid}}" } } },
      }),
    });
    await refreshUpstreamDataPack(partial, 12, logger());
    expect(getUpstreamDataStatus().pokemonNames).toEqual(pokemonNames);
    expect(partial.writeCachedValue).toHaveBeenCalledWith(
      expect.objectContaining({ pokemonNames }),
    );
  });

  it("applies a later translation even when calculation data is unchanged", async () => {
    const pokemonNames = { ja: { pokemons: { Bulbasaur: "フシギダネ" } } };
    const adapter = runtime({
      fetchLatest: vi.fn().mockResolvedValue({
        pokemon: pokemonJson,
        event: eventJson,
        pokemonNames,
      }),
    });
    await prepareUpstreamDataPack(adapter, logger());
    await refreshUpstreamDataPack(adapter, 13, logger());
    expect(getUpstreamDataStatus().pokemonNames).toEqual(pokemonNames);
    expect(getUpstreamDataStatus().source).toBe("network");
  });
});
