import { connectivityFeature } from "../../features/connectivity";
import { readToolSnapshot } from "../../integration/upstreamAdapter";
import { ChromeSettingsStore } from "../../settings/chromeSettingsStore";
import { mountSuite } from "../../ui/mountSuite";

async function start(): Promise<void> {
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
  const features = [connectivityFeature].filter(
    (feature) => settings.enabledFeatures[feature.id] ?? feature.defaultEnabled,
  );
  mountSuite(features);
}

void start();
