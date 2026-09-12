import type { FeatureModule } from "../types";
import { mountRankingPanel } from "./ui";

export const rankingFeature: FeatureModule = {
  id: "ranking",
  defaultEnabled: true,
  mount: mountRankingPanel,
};
