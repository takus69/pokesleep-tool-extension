import type { ExtensionSettings, SettingsStore } from "./types";

const storageKey = "settings.v1";

export class ChromeSettingsStore implements SettingsStore {
  async load(): Promise<ExtensionSettings> {
    const stored = await chrome.storage.local.get(storageKey);
    const candidate: unknown = stored[storageKey];
    if (typeof candidate !== "object" || candidate === null) {
      return { enabledFeatures: {} };
    }
    const enabledFeatures = Reflect.get(candidate, "enabledFeatures");
    return typeof enabledFeatures === "object" && enabledFeatures !== null
      ? {
          enabledFeatures: enabledFeatures as Readonly<Record<string, boolean>>,
        }
      : { enabledFeatures: {} };
  }

  async save(settings: ExtensionSettings): Promise<void> {
    await chrome.storage.local.set({ [storageKey]: settings });
  }
}
