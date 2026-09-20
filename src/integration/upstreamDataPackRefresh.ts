import bundledEventJson from "../vendor/upstream-data/event.json";
import bundledPokemonJson from "../vendor/upstream-data/pokemon.json";
import {
  applyUpstreamDataPack,
  type CachedUpstreamDataPack,
  decodeCachedUpstreamDataPack,
  getUpstreamDataStatus,
  type UpstreamDataStatus,
  validateUpstreamDataPack,
} from "./upstreamDataPack";

export interface LatestUpstreamDataPack {
  readonly pokemon: unknown;
  readonly event: unknown;
}

export interface UpstreamDataPackRuntime {
  readCachedValue(): Promise<unknown>;
  writeCachedValue(value: CachedUpstreamDataPack): Promise<void>;
  claimSessionRefresh(): Promise<boolean>;
  fetchLatest(): Promise<LatestUpstreamDataPack>;
}

export interface UpstreamDataPackLogger {
  error(message: string, cause: unknown): void;
  warn(message: string, cause: unknown): void;
}

const consoleLogger: UpstreamDataPackLogger = {
  error: (message, cause) => console.error(message, cause),
  warn: (message, cause) => console.warn(message, cause),
};

/** Apply bundled and cached data, then refresh once when the runtime allows it. */
export async function prepareUpstreamDataPack(
  runtime: UpstreamDataPackRuntime,
  now = Date.now(),
  logger: UpstreamDataPackLogger = consoleLogger,
): Promise<UpstreamDataStatus> {
  try {
    applyUpstreamDataPack(
      validateUpstreamDataPack(bundledPokemonJson, bundledEventJson),
      "bundled",
      0,
    );
  } catch (cause) {
    logger.error(
      "[Pokémon Sleep Tool Extension] Bundled upstream data is invalid",
      cause,
    );
  }

  try {
    const cached = decodeCachedUpstreamDataPack(
      await runtime.readCachedValue(),
    );
    if (cached !== null) {
      const pack = validateUpstreamDataPack(cached.pokemon, cached.event);
      applyUpstreamDataPack(pack, "cached", cached.checkedAt);
    }
  } catch (cause) {
    logger.warn(
      "[Pokémon Sleep Tool Extension] Cached data was ignored",
      cause,
    );
  }

  let shouldRefresh = false;
  try {
    shouldRefresh = await runtime.claimSessionRefresh();
  } catch (cause) {
    logger.warn(
      "[Pokémon Sleep Tool Extension] Could not determine browser-session refresh state",
      cause,
    );
  }
  if (!shouldRefresh) return getUpstreamDataStatus();

  try {
    const { pokemon, event } = await runtime.fetchLatest();
    const pack = validateUpstreamDataPack(pokemon, event);
    await runtime.writeCachedValue({ checkedAt: now, pokemon, event });
    return applyUpstreamDataPack(pack, "network", now);
  } catch (cause) {
    logger.warn(
      "[Pokémon Sleep Tool Extension] Latest upstream data was unavailable; bundled or cached data remains active",
      cause,
    );
    return getUpstreamDataStatus();
  }
}
