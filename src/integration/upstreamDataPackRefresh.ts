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
import { decodeUpstreamPokemonIconSource } from "./upstreamPokemonIcons";

export interface LatestUpstreamDataPack {
  readonly pokemonIconSource?: unknown;
  readonly pokemon: unknown;
  readonly event: unknown;
  readonly pokemonNames?: unknown;
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
      const pack = validateUpstreamDataPack(
        cached.pokemon,
        cached.event,
        cached.pokemonNames,
        cached.pokemonIcons,
      );
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
    const { pokemon, event, pokemonNames, pokemonIconSource } =
      await runtime.fetchLatest();
    const latest = validateUpstreamDataPack(
      pokemon,
      event,
      pokemonNames,
      decodeUpstreamPokemonIconSource(pokemonIconSource),
    );
    // Keep previously validated names when a language is unavailable or partial.
    const merged = { ...getUpstreamDataStatus().pokemonNames };
    for (const [language, resource] of Object.entries(latest.pokemonNames)) {
      const key = language as keyof typeof merged;
      merged[key] = {
        pokemons: { ...merged[key]?.pokemons, ...resource.pokemons },
      };
    }
    const pack = validateUpstreamDataPack(pokemon, event, merged, {
      ...getUpstreamDataStatus().pokemonIcons,
      ...latest.pokemonIcons,
    });
    await runtime.writeCachedValue({
      bundledCommit: bundledManifest.commit,
      checkedAt: now,
      pokemon,
      event,
      ...(Object.keys(pack.pokemonIcons).length > 0
        ? { pokemonIcons: pack.pokemonIcons }
        : {}),
      ...(Object.keys(pack.pokemonNames).length > 0
        ? { pokemonNames: pack.pokemonNames }
        : {}),
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
