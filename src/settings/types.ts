export interface ExtensionSettings {
  readonly enabledFeatures: Readonly<Record<string, boolean>>;
}

export interface SettingsStore {
  load(): Promise<ExtensionSettings>;
  save(settings: ExtensionSettings): Promise<void>;
}
