import { createRankingFeature } from "../../features/ranking";
import { readToolSnapshot } from "../../integration/upstreamAdapter";
import { prepareUpstreamDataPack } from "../../integration/upstreamDataPackRefresh";
import { ChromeSettingsStore } from "../../settings/chromeSettingsStore";
import { mountSuite } from "../../ui/mountSuite";
import { ChromiumRankingScenarioStorage } from "./rankingScenarioStorage";
import { ChromiumUpstreamDataPackRuntime } from "./upstreamDataPackRuntime";

async function start(): Promise<void> {
  await prepareUpstreamDataPack(new ChromiumUpstreamDataPackRuntime());
  const snapshot = readToolSnapshot({
    url: new URL(window.location.href),
    rootExists: document.getElementById("root") !== null,
    readStorage: (key) => window.localStorage.getItem(key),
  });
  if (!snapshot.ok) {
    console.warn(`[Pokémon Sleep Tool Extension] ${snapshot.error.message}`);
    return;
  }

  const settings = await new ChromeSettingsStore().load();
  const rankingFeature = createRankingFeature(
    new ChromiumRankingScenarioStorage(window.localStorage),
  );
  const features = [rankingFeature].filter(
    (feature) => settings.enabledFeatures[feature.id] ?? feature.defaultEnabled,
  );
  mountSuite(features);
}

void start();
