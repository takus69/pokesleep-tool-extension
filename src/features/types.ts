export interface FeatureContext {
  readonly hostElement: HTMLElement;
  readonly mountPoint: ShadowRoot;
}

export interface FeatureModule {
  readonly id: string;
  readonly defaultEnabled: boolean;
  mount(context: FeatureContext): () => void;
}
