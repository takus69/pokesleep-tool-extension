import { describe, expect, it } from "vitest";
import {
  ChromiumRankingScenarioStorage,
  rankingScenarioStorageKey,
} from "./rankingScenarioStorage";

describe("ChromiumRankingScenarioStorage", () => {
  it("preserves the existing page-local storage key", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
    };
    const adapter = new ChromiumRankingScenarioStorage(storage);

    adapter.write("saved");

    expect(values.get("PstForkRankingScenarios.v1")).toBe("saved");
    expect(adapter.read()).toBe("saved");
    expect(rankingScenarioStorageKey).toBe("PstForkRankingScenarios.v1");
  });
});
