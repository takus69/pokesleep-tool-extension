import type { CachedUpstreamDataPack } from "../../integration/upstreamDataPack";
import type {
  LatestUpstreamDataPack,
  UpstreamDataPackRuntime,
} from "../../integration/upstreamDataPackRefresh";

const cacheKey = "upstream-data-pack.v1";

export class ChromiumUpstreamDataPackRuntime
  implements UpstreamDataPackRuntime
{
  async readCachedValue(): Promise<unknown> {
    const stored = await chrome.storage.local.get(cacheKey);
    return stored[cacheKey];
  }

  async writeCachedValue(value: CachedUpstreamDataPack): Promise<void> {
    await chrome.storage.local.set({ [cacheKey]: value });
  }

  async fetchLatest(): Promise<LatestUpstreamDataPack> {
    const response = await chrome.runtime.sendMessage({
      type: "fetch-latest-upstream-data",
    });
    if (response?.ok !== true) throw new Error("Upstream data unavailable");
    return {
      pokemon: response.pokemon,
      event: response.event,
      ...(response.pokemonNames !== undefined
        ? { pokemonNames: response.pokemonNames }
        : {}),
    };
  }
}
