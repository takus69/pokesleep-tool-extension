export interface FeatureContext {
  readonly hostElement: HTMLElement;
  readonly mountPoint: HTMLElement;
}

export interface FeatureModule {
  readonly id: string;
  readonly defaultEnabled: boolean;
  mount(context: FeatureContext): () => void;
}
