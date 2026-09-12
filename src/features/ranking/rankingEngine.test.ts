import { describe, expect, it } from "vitest";
import {
  calculateRankingScenarioAsync,
  createRankingScenarioConfig,
  createStrengthParameter,
  rankingScenarioPurposes,
  validateRankingScenario,
} from "./upstream";

describe("fork ranking engine integration", () => {
  it("keeps all six externally visible purposes available", () => {
    expect(rankingScenarioPurposes).toEqual([
      "traits",
      "ingredients",
      "berry",
      "ingredient",
      "skill",
      "field",
    ]);
  });

  it("calculates a Pokémon ingredient-pattern ranking", async () => {
    const config = createRankingScenarioConfig("ingredients");
    config.pokemonName = "Pikachu";
    config.level = 30;
    const environment = createStrengthParameter({});

    expect(validateRankingScenario(config, environment)).toBeNull();
    const result = await calculateRankingScenarioAsync(config, environment);

    expect(result.entries.length).toBeGreaterThan(0);
    expect(result.groups.length).toBeGreaterThan(0);
    expect(
      result.entries.every((entry) => entry.iv.pokemonName === "Pikachu"),
    ).toBe(true);
  });
});
