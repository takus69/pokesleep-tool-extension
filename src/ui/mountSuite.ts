import type { FeatureModule } from "../features/types";

export function mountSuite(features: readonly FeatureModule[]): () => void {
  const host = document.createElement("div");
  host.id = "pokesleep-extension-suite";
  document.body.append(host);
  const cleanups = features.map((feature) =>
    feature.mount({ hostElement: host, mountPoint: host }),
  );
  return () => {
    for (const cleanup of cleanups) cleanup();
    host.remove();
  };
}
