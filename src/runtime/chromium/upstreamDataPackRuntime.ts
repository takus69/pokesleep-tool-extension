import type { CachedUpstreamDataPack } from "../../integration/upstreamDataPack";
import type {
  LatestUpstreamDataPack,
  UpstreamDataPackRuntime,
} from "../../integration/upstreamDataPackRefresh";

const sourceBase =
  "https://raw.githubusercontent.com/nitoyon/pokesleep-tool/main/src/data";
const cacheKey = "upstream-data-pack.v1";
const refreshClaimMessage = "claim-upstream-data-refresh";

async function fetchJson(file: string): Promise<unknown> {
  const response = await fetch(`${sourceBase}/${file}`, {
    cache: "no-cache",
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
  return response.json() as Promise<unknown>;
}

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

  async claimSessionRefresh(): Promise<boolean> {
    const response = await chrome.runtime.sendMessage({
      type: refreshClaimMessage,
    });
    return response?.shouldRefresh === true;
  }

  async fetchLatest(): Promise<LatestUpstreamDataPack> {
    const [pokemon, event] = await Promise.all([
      fetchJson("pokemon.json"),
      fetchJson("event.json"),
    ]);
    return { pokemon, event };
  }
}
