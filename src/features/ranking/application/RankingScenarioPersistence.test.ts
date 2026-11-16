import Nature from "@upstream/util/Nature";
import { describe, expect, it } from "vitest";
import {
  decodeRankingScenarioSettings,
  encodeRankingScenarioSettings,
  loadRankingScenarioSettings,
  type RankingScenarioStorage,
  saveRankingScenarioSettings,
} from "./RankingScenarioPersistence";
import {
  createRankingScenarioSettings,
  normalizeRankingScenarioConfig,
} from "./RankingScenarioState";

describe("ranking scenario persistence", () => {
  it("preserves mint through form normalization and storage while reading old settings", () => {
    const settings = createRankingScenarioSettings();
    settings.configs.ingredient.nature = new Nature("Modest").withMint(true);
    expect(
      normalizeRankingScenarioConfig("ingredient", settings.configs.ingredient)
        .nature.mint,
    ).toBe(true);
    const restored = decodeRankingScenarioSettings(
      encodeRankingScenarioSettings(settings),
    );
    expect(restored.configs.ingredient.nature.name).toBe("Modest");
    expect(restored.configs.ingredient.nature.mint).toBe(true);
    expect(restored.configs.ingredient.nature.ingredientFindingFactor).toBe(1);
    for (const natureMint of [undefined, "true", 1, false]) {
      expect(
        normalizeRankingScenarioConfig("ingredient", {
          nature: "Modest",
          natureMint,
        }).nature.mint,
      ).toBe(false);
    }
  });
  it("round-trips the version 1 schema", () => {
    const settings = createRankingScenarioSettings();
    settings.purpose = "ingredient";
    settings.configs.ingredient.level = 42;

    const restored = decodeRankingScenarioSettings(
      encodeRankingScenarioSettings(settings),
    );

    expect(restored.purpose).toBe("ingredient");
    expect(restored.configs.ingredient.level).toBe(42);
  });

  it.each([
    null,
    "{",
    '{"version":2}',
  ])("uses safe defaults for absent, corrupt, or unknown data: %s", (serialized) => {
    const restored = decodeRankingScenarioSettings(serialized);

    expect(restored.purpose).toBe("traits");
    expect(restored.configs.traits.level).toBe(60);
    expect(Object.keys(restored.configs)).toHaveLength(6);
  });

  it("keeps defaults usable when reading storage fails", () => {
    const storage: RankingScenarioStorage = {
      read: () => {
        throw new Error("unavailable");
      },
      write: () => undefined,
    };

    expect(loadRankingScenarioSettings(storage).purpose).toBe("traits");
  });

  it("does not throw when writing storage fails", () => {
    const storage: RankingScenarioStorage = {
      read: () => null,
      write: () => {
        throw new Error("full");
      },
    };

    expect(() =>
      saveRankingScenarioSettings(storage, createRankingScenarioSettings()),
    ).not.toThrow();
  });
});
