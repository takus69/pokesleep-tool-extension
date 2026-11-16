import { AlwaysTap, whistlePeriod } from "@upstream/util/Energy";
import PokemonIv from "@upstream/util/PokemonIv";
import { ingredientStrength } from "@upstream/util/PokemonRp";
import PokemonStrength from "@upstream/util/PokemonStrength";
import { createStrengthParameter } from "@upstream/util/StrengthParameter";
import { describe, expect, it } from "vitest";
import { calculateUpstreamPokemonStrength } from "../domain/UpstreamPokemonCalculation";
import { createRankingScenarioConfig } from "../features/ranking/application/RankingScenarioState";
import { calculateRankingScenarioAsync } from "../features/ranking/domain/RankingScenario";
import event from "../vendor/upstream-data/event.json";
import pokemon from "../vendor/upstream-data/pokemon.json";
import {
  applyUpstreamDataPack,
  validateUpstreamDataPack,
} from "./upstreamDataPack";

const banquet = "bountiful banquet week vol1";

describe("November upstream compatibility", () => {
  it("includes helpers whose selected ingredient comes only from the event", async () => {
    const parameter = createStrengthParameter({ event: banquet });
    const result = await calculateRankingScenarioAsync(
      {
        ...createRankingScenarioConfig("ingredient"),
        ingredient: "nuts",
        includeUnevolved: true,
      },
      parameter,
    );
    const entry = result.entries.find(
      (item) => item.iv.pokemonName === "Bulbasaur",
    );
    expect(entry).toBeDefined();
    if (!entry) throw new Error("Event-only nuts helper missing");
    expect(entry.value).toBe(
      new PokemonStrength(entry.iv, parameter)
        .calculate()
        .ingredients.find((item) => item.name === "nuts")?.count,
    );
  });
  it.each([
    "Cottonee",
    "Whimsicott",
  ])("ranks confirmed %s for nuts using the official calculation", async (pokemonName) => {
    const pack = validateUpstreamDataPack(pokemon, event);
    expect(pack.issues).toEqual([]);
    applyUpstreamDataPack(pack, "bundled", 0);
    expect(ingredientStrength.nuts).toBe(112);
    const parameter = createStrengthParameter({ event: banquet, level: 0 });
    const config = {
      ...createRankingScenarioConfig("ingredients"),
      pokemonName,
    };
    const result = await calculateRankingScenarioAsync(config, parameter);
    expect(result.entries.length).toBeGreaterThan(0);
    expect(result.exclusions).toEqual([]);
    for (const entry of result.entries) {
      const official = new PokemonStrength(entry.iv, parameter).calculate();
      expect(entry.value).toBe(official.ingStrength);
      expect(
        official.ingredients.find((item) => item.name === "nuts")?.count,
      ).toBeGreaterThan(0);
    }
  });

  it.each([
    "Cottonee",
    "Whimsicott",
  ])("still excludes an unconfirmed %s", (name) => {
    const pending = pokemon.map((item) =>
      item.name === name
        ? { ...item, specialty: "unknown", skill: "unknown", frequency: 0 }
        : item,
    );
    const pack = validateUpstreamDataPack(pending, event);
    expect(pack.pokemon.some((item) => item.name === name)).toBe(false);
    expect(pack.issues).toContainEqual({
      kind: "pokemon",
      name,
      reason: "unsupported specialty",
    });
  });

  it.each([
    "nuts",
    "",
    "future ingredient",
    "unknown1",
    112,
    null,
  ])("validates extraIng %j without accepting unknown ingredients", (extraIng) => {
    const pack = validateUpstreamDataPack(pokemon, {
      drowsy: event.drowsy,
      bonus: [
        {
          name: "test extra",
          start: "2026-11-16T04:00:00",
          end: "2026-11-23T04:00:00",
          target: {},
          effects: { extraIng },
        },
      ],
    });
    expect(pack.bonus.length).toBe(
      extraIng === "nuts" || extraIng === "" ? 1 : 0,
    );
  });

  it.each([10, 11])("validates carryLimitAdd %s", (carryLimitAdd) => {
    const pack = validateUpstreamDataPack(pokemon, {
      drowsy: event.drowsy,
      bonus: [
        {
          name: "test carry",
          start: "2026-11-16T04:00:00",
          end: "2026-11-23T04:00:00",
          target: {},
          effects: { carryLimitAdd },
        },
      ],
    });
    expect(pack.bonus.length).toBe(carryLimitAdd === 10 ? 1 : 0);
  });

  it.each([
    AlwaysTap,
    60,
  ])("projects the fourth ingredient with tap frequency %s", (tapFrequency) => {
    const iv = new PokemonIv({
      pokemonName: "Bulbasaur",
      level: 60,
      ingredient: "ABC",
    });
    const parameter = createStrengthParameter({
      event: banquet,
      tapFrequencyAwake: tapFrequency,
      tapFrequencyAsleep: tapFrequency,
    });
    const official = new PokemonStrength(iv, parameter).calculate();
    const result = calculateUpstreamPokemonStrength(iv, parameter);
    expect(result.ingredients).toHaveLength(4);
    expect(result.ingredients).toEqual(
      official.ingredients.map(({ name, count }) => ({ name, count })),
    );
    const nuts = result.ingredients.find((item) => item.name === "nuts");
    expect(nuts?.count).toBeGreaterThan(0);
    expect(nuts?.count).toBeLessThanOrEqual(official.ingHelpCount + 1e-9);
    if (tapFrequency === AlwaysTap)
      expect(nuts?.count).toBeCloseTo(official.ingHelpCount);
    expect(result.ingStrength).toBe(official.ingStrength);
  });

  it.each([
    whistlePeriod,
    -10,
  ])("does not add event nuts for period %s", (period) => {
    const iv = new PokemonIv({ pokemonName: "Bulbasaur", level: 30 });
    const result = calculateUpstreamPokemonStrength(
      iv,
      createStrengthParameter({ event: banquet, period }),
    );
    expect(result.ingredients.some((item) => item.name === "nuts")).toBe(false);
  });

  it("does not apply ingredient-specialty bonuses to Raichu", () => {
    const iv = new PokemonIv({ pokemonName: "Raichu", level: 30 });
    const result = calculateUpstreamPokemonStrength(
      iv,
      createStrengthParameter({ event: banquet }),
    );
    expect(result.ingredients.some((item) => item.name === "nuts")).toBe(false);
  });
});
