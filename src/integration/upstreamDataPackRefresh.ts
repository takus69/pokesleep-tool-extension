import bundledEventJson from "../vendor/upstream-data/event.json";
import bundledManifest from "../vendor/upstream-data/manifest.json";
import bundledPokemonJson from "../vendor/upstream-data/pokemon.json";
import {
  applyUpstreamDataPack,
  type CachedUpstreamDataPack,
  decodeCachedUpstreamDataPack,
  getUpstreamDataStatus,
  type UpstreamDataStatus,
  validateUpstreamDataPack,
} from "./upstreamDataPack";
import {
  acceptUpstreamDataRefresh,
  initializeUpstreamDataRefresh,
  setUpstreamDataRefreshPhase,
} from "./upstreamDataRefreshState";

export interface LatestUpstreamDataPack {
  readonly pokemon: unknown;
  readonly event: unknown;
}

export interface UpstreamDataPackRuntime {
  readCachedValue(): Promise<unknown>;
  writeCachedValue(value: CachedUpstreamDataPack): Promise<void>;
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

/** Load local data without blocking startup on a network request. */
export async function prepareUpstreamDataPack(
  runtime: UpstreamDataPackRuntime,
  logger: UpstreamDataPackLogger = consoleLogger,
): Promise<UpstreamDataStatus> {
  let initialPack = validateUpstreamDataPack(
    bundledPokemonJson,
    bundledEventJson,
  );
  applyUpstreamDataPack(initialPack, "bundled", 0);

  try {
    const cached = decodeCachedUpstreamDataPack(
      await runtime.readCachedValue(),
    );
    if (cached !== null && cached.bundledCommit === bundledManifest.commit) {
      const pack = validateUpstreamDataPack(cached.pokemon, cached.event);
      applyUpstreamDataPack(pack, "cached", cached.checkedAt);
      initialPack = pack;
    }
  } catch (cause) {
    logger.warn(
      "[Pokémon Sleep Tool Extension] Cached data was ignored",
      cause,
    );
  }

  initializeUpstreamDataRefresh(initialPack);
  return getUpstreamDataStatus();
}

/** Each page load requests fresh data; the runtime shares concurrent requests. */
export async function refreshUpstreamDataPack(
  runtime: UpstreamDataPackRuntime,
  now = Date.now(),
  logger: UpstreamDataPackLogger = consoleLogger,
): Promise<void> {
  setUpstreamDataRefreshPhase("checking");

  try {
    const { pokemon, event } = await runtime.fetchLatest();
    const pack = validateUpstreamDataPack(pokemon, event);
    await runtime.writeCachedValue({
      bundledCommit: bundledManifest.commit,
      checkedAt: now,
      pokemon,
      event,
    });
    acceptUpstreamDataRefresh(pack, now);
  } catch (cause) {
    logger.warn(
      "[Pokémon Sleep Tool Extension] Latest upstream data was unavailable; bundled or cached data remains active",
      cause,
    );
    setUpstreamDataRefreshPhase("failed");
  }
}
