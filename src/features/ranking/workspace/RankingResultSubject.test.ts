import { describe, expect, it } from "vitest";
import { createRankingScenarioConfig } from "../application/RankingScenarioState";
import { getRankingResultSubjects } from "./RankingResultSubject";

describe("getRankingResultSubjects", () => {
  it("omits a previous ingredient selection from skill-count results", () => {
    const config = createRankingScenarioConfig("traits");
    config.pokemonName = "Mewtwo";
    config.ingredient = "tomato";
    config.target = "skillCount";
    expect(getRankingResultSubjects(config)).toEqual([
      { kind: "pokemon", value: "Mewtwo" },
    ]);
  });

  it("shows the selected ingredient when counting that ingredient", () => {
    const config = createRankingScenarioConfig("traits");
    config.pokemonName = "Mewtwo";
    config.ingredient = "tomato";
    expect(getRankingResultSubjects(config)).toEqual([
      { kind: "pokemon", value: "Mewtwo" },
      { kind: "ingredient", value: "tomato" },
    ]);
  });

  it("shows the ingredient used to filter ingredient specialists", () => {
    const config = createRankingScenarioConfig("ingredient");
    config.ingredient = "tomato";
    config.target = "ingredientStrength";
    expect(getRankingResultSubjects(config)).toEqual([
      { kind: "ingredient", value: "tomato" },
    ]);
  });
});
