import type { FeatureModule } from "../types";
import { mountRankingWorkspace } from "./reactUi";

export const rankingFeature: FeatureModule = {
  id: "ranking",
  defaultEnabled: true,
  mount: mountRankingWorkspace,
};
