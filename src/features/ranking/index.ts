import type { FeatureModule } from "../types";
import type { RankingScenarioStorage } from "./application/RankingScenarioPersistence";
import { mountRankingWorkspace } from "./reactUi";

export function createRankingFeature(
  storage: RankingScenarioStorage,
): FeatureModule {
  return {
    id: "ranking",
    defaultEnabled: true,
    mount: (context) => mountRankingWorkspace(context, storage),
  };
}
