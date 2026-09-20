import type { RankingScenarioStorage } from "../../features/ranking/application/RankingScenarioPersistence";

export const rankingScenarioStorageKey = "PstForkRankingScenarios.v1";

export class ChromiumRankingScenarioStorage implements RankingScenarioStorage {
  constructor(private readonly storage: Pick<Storage, "getItem" | "setItem">) {}

  read(): string | null {
    return this.storage.getItem(rankingScenarioStorageKey);
  }

  write(value: string): void {
    this.storage.setItem(rankingScenarioStorageKey, value);
  }
}
