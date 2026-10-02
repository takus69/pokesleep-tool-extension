import { createRankingFeature } from "../../features/ranking";
import type { RankingScenarioStorage } from "../../features/ranking/application/RankingScenarioPersistence";
import {
  canStartMobileRanking,
  formatMobileCompatibility,
  inspectMobileCompatibility,
} from "../../integration/mobileCompatibilityProbe";
import { prepareUpstreamDataPack } from "../../integration/upstreamDataPackRefresh";
import { mountSuite } from "../../ui/mountSuite";
import { MobilePocBundledDataRuntime } from "./bundledDataRuntime";

/** Intentionally ephemeral: do not overwrite existing extension settings. */
export class MobilePocScenarioStorage implements RankingScenarioStorage {
  private value: string | null = null;

  read(): string | null {
    return this.value;
  }

  write(value: string): void {
    this.value = value;
  }
}

export async function startMobileRankingPoc(): Promise<void> {
  const startingId = "pokesleep-mobile-poc-starting";
  if (
    document.getElementById("pokesleep-extension-suite") !== null ||
    document.getElementById(startingId) !== null
  ) {
    window.alert("ランキング拡張またはPoCが既に起動しています。");
    return;
  }
  const report = inspectMobileCompatibility({
    url: new URL(window.location.href),
    document,
    readStorage: (key) => window.localStorage.getItem(key),
  });
  if (!canStartMobileRanking(report)) {
    window.alert(formatMobileCompatibility(report));
    return;
  }
  const starting = document.createElement("div");
  starting.id = startingId;
  starting.hidden = true;
  document.body.append(starting);
  try {
    await prepareUpstreamDataPack(new MobilePocBundledDataRuntime());
    mountSuite([createRankingFeature(new MobilePocScenarioStorage())]);
  } catch {
    window.alert(
      "PoCを起動できませんでした。ページを再読み込みして検証結果を記録してください。",
    );
  } finally {
    starting.remove();
  }
}
