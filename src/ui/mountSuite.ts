import type { FeatureModule } from "../features/types";

export function mountSuite(features: readonly FeatureModule[]): () => void {
  const host = document.createElement("div");
  host.id = "pokesleep-extension-suite";
  const shadow = host.attachShadow({ mode: "closed" });
  document.body.append(host);
  const cleanups = features.map((feature) =>
    feature.mount({ mountPoint: shadow }),
  );
  return () => {
    for (const cleanup of cleanups) cleanup();
    host.remove();
  };
}
