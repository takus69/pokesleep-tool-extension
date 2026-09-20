import { beforeEach, describe, expect, it, vi } from "vitest";
import eventJson from "../vendor/upstream-data/event.json";
import pokemonJson from "../vendor/upstream-data/pokemon.json";
import {
  applyUpstreamDataPack,
  validateUpstreamDataPack,
} from "./upstreamDataPack";
import {
  prepareUpstreamDataPack,
  type UpstreamDataPackLogger,
  type UpstreamDataPackRuntime,
} from "./upstreamDataPackRefresh";

function runtime(
  overrides: Partial<UpstreamDataPackRuntime> = {},
): UpstreamDataPackRuntime {
  return {
    readCachedValue: vi.fn().mockResolvedValue(undefined),
    writeCachedValue: vi.fn().mockResolvedValue(undefined),
    claimSessionRefresh: vi.fn().mockResolvedValue(false),
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
      claimSessionRefresh: vi.fn().mockResolvedValue(true),
      writeCachedValue,
    });

    const status = await prepareUpstreamDataPack(adapter, 1234, logger());

    expect(status.source).toBe("network");
    expect(writeCachedValue).toHaveBeenCalledWith({
      checkedAt: 1234,
      pokemon: pokemonJson,
      event: eventJson,
    });
  });

  it("uses cached data without fetching again in the same browser session", async () => {
    const fetchLatest = vi.fn();
    const adapter = runtime({
      readCachedValue: vi.fn().mockResolvedValue({
        checkedAt: 1234,
        pokemon: pokemonJson,
        event: eventJson,
      }),
      fetchLatest,
    });

    const status = await prepareUpstreamDataPack(adapter, 5678, logger());

    expect(status.source).toBe("cached");
    expect(status.checkedAt).toBe(1234);
    expect(fetchLatest).not.toHaveBeenCalled();
  });

  it("keeps the validated cache when a network pack is invalid", async () => {
    const log = logger();
    const adapter = runtime({
      readCachedValue: vi.fn().mockResolvedValue({
        checkedAt: 1234,
        pokemon: pokemonJson,
        event: eventJson,
      }),
      claimSessionRefresh: vi.fn().mockResolvedValue(true),
      fetchLatest: vi.fn().mockResolvedValue({ pokemon: [], event: {} }),
    });

    const status = await prepareUpstreamDataPack(adapter, 5678, log);

    expect(status.source).toBe("cached");
    expect(status.checkedAt).toBe(1234);
    expect(log.warn).toHaveBeenCalledOnce();
  });

  it("does not fetch when the session refresh claim fails", async () => {
    const fetchLatest = vi.fn();
    const log = logger();
    const adapter = runtime({
      claimSessionRefresh: vi.fn().mockRejectedValue(new Error("unavailable")),
      fetchLatest,
    });

    const status = await prepareUpstreamDataPack(adapter, 5678, log);

    expect(status.source).toBe("bundled");
    expect(fetchLatest).not.toHaveBeenCalled();
    expect(log.warn).toHaveBeenCalledOnce();
  });
});
