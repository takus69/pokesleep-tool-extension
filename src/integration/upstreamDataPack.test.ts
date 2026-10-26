import { readFileSync } from "node:fs";
import {
  getMaxSkillLevel,
  getSkillSubValue,
  getSkillValue,
} from "@upstream/util/MainSkill";
import PokemonIv from "@upstream/util/PokemonIv";
import PokemonStrength, {
  createStrengthParameter,
} from "@upstream/util/PokemonStrength";
import { beforeEach, describe, expect, it } from "vitest";
import { createRankingScenarioConfig } from "../features/ranking/application/RankingScenarioState";
import { calculateRankingScenarioAsync } from "../features/ranking/domain/RankingScenario";
import eventJson from "../vendor/upstream-data/event.json";
import synchronizedPokemonJson from "../vendor/upstream-data/pokemon.json";
import {
  applyUpstreamDataPack,
  validateUpstreamDataPack,
} from "./upstreamDataPack";

// Most cases exercise supported mechanics independently of upstream's pending
// announcements. The complete synchronized snapshot has its own contract below.
const pendingNames = ["Pikachu (Low Key)"];
const pokemonJson = synchronizedPokemonJson.filter(
  (pokemon) => !pendingNames.includes(pokemon.name),
);

describe("upstream data pack", () => {
  let baseline: ReturnType<typeof validateUpstreamDataPack>;

  beforeEach(() => {
    baseline = validateUpstreamDataPack(pokemonJson, eventJson);
    applyUpstreamDataPack(baseline, "bundled", 0);
  });

  it("accepts and applies the synchronized upstream data", () => {
    expect(baseline.issues).toEqual([]);
    expect(baseline.pokemon).toHaveLength(pokemonJson.length);
    expect(baseline.pokemon.some((pokemon) => pokemon.name === "Mewtwo")).toBe(
      true,
    );
    expect(
      baseline.bonus.filter((event) => event.name.startsWith("pursue mewtwo")),
    ).toHaveLength(2);
    expect(
      baseline.bonus.find((event) => event.name === "pursue mewtwo 2nd week")
        ?.effects.bigBerry,
    ).toBe("mewtwo2");
  });

  it("keeps pending announcements out while accepting the rest of the snapshot", () => {
    // Read the pinned source directly: the synced JSON is deliberately allowed
    // to evolve independently, and announcements may become confirmed later.
    const pinnedPokemon = JSON.parse(
      readFileSync("vendor/pokesleep-tool/src/data/pokemon.json", "utf8"),
    );
    const pack = validateUpstreamDataPack(pinnedPokemon, eventJson);
    expect(pack.issues).toEqual([
      {
        kind: "pokemon",
        name: "Pikachu (Low Key)",
        reason: "unsupported main skill",
      },
    ]);
    expect(pack.pokemon).toHaveLength(pinnedPokemon.length - 1);
    expect(
      pack.pokemon.find((pokemon) => pokemon.name === "Mismagius"),
    ).toMatchObject({
      skill: "Cooking Advance S (Mystical Fire)",
      specialty: "Skills",
      frequency: 2400,
      ingRate: 14.2,
      skillRate: 3.6,
      carryLimit: 17,
    });
    expect(
      pack.pokemon.find((pokemon) => pokemon.name === "Misdreavus"),
    ).toMatchObject({
      specialty: "Skills",
      skill: "Cooking Power-Up S",
      frequency: 2800,
      ingRate: 15,
      skillRate: 4.7,
      carryLimit: 13,
      ing1: { name: "potato" },
      ing2: { name: "coffee" },
      ing3: { name: "tomato" },
    });
    expect(
      pack.pokemon.some((pokemon) => pendingNames.includes(pokemon.name)),
    ).toBe(false);
    expect(
      pack.pokemon.find((pokemon) => pokemon.name === "Gengar")?.ingRate,
    ).toBe(16.6);
    expect(pack.bonus.some((event) => event.name === "halloween 2026")).toBe(
      true,
    );
  });

  it.each([
    "Misdreavus",
    "Mismagius",
  ])("ranks confirmed %s with the official ingredient and skill calculations", async (pokemonName) => {
    const config = {
      ...createRankingScenarioConfig("ingredients"),
      pokemonName,
    };
    const parameter = createStrengthParameter({ event: "none", level: 0 });
    const result = await calculateRankingScenarioAsync(config, parameter);
    expect(result.entries).toHaveLength(6);
    expect(result.exclusions).toEqual([]);
    for (const entry of result.entries) {
      const official = new PokemonStrength(entry.iv, parameter).calculate();
      expect(entry.value).toBe(official.ingStrength);
      expect(entry.value).toBeGreaterThan(0);
      expect(official.skillCount).toBeGreaterThan(0);
      expect(official.skillValuePerTrigger).toBe(31);
      if (pokemonName === "Mismagius")
        expect(official.skillValuePerTrigger2).toBe(5);
    }
  });

  it.each([
    [1, 7, 1],
    [2, 10, 2],
    [3, 12, 2],
    [4, 17, 3],
    [5, 22, 3],
    [6, 27, 4],
    [7, 31, 5],
  ])("applies both official Mystical Fire effects at level %s", (level, potSize, chance) => {
    expect(getSkillValue("Cooking Advance S (Mystical Fire)", level)).toBe(
      potSize,
    );
    expect(getSkillSubValue("Cooking Advance S (Mystical Fire)", level)).toBe(
      chance,
    );
    expect(getMaxSkillLevel("Cooking Advance S (Mystical Fire)")).toBe(7);
    const iv = new PokemonIv({
      pokemonName: "Mismagius",
      level: 60,
      skillLevel: level,
    });
    const parameter = createStrengthParameter({
      event: "none",
      level: 0,
      maxSkillLevel: false,
    });
    const official = new PokemonStrength(iv, parameter).calculate();
    expect(official.skillCount).toBeGreaterThan(0);
    expect(official.skillValuePerTrigger).toBe(potSize);
    expect(official.skillValuePerTrigger2).toBe(chance);
    expect(official.skillValue2).toBe(chance * official.skillCount);
  });

  it.each([
    "Cooking Advance S",
    "Cooking Advance S (Mystical Fire)",
  ] as const)("finds Mismagius in %s skill rankings at the corrected maximum level", async (skill) => {
    const parameter = createStrengthParameter({ event: "none", level: 0 });
    const result = await calculateRankingScenarioAsync(
      {
        ...createRankingScenarioConfig("skill"),
        skill,
      },
      parameter,
    );
    const entry = result.entries.find(
      (item) => item.iv.pokemonName === "Mismagius",
    );
    expect(entry).toBeDefined();
    if (!entry) throw new Error("Mismagius is missing from skill rankings");
    expect(entry.iv.skillLevel).toBe(7);
    expect(entry.value).toBeGreaterThan(0);
    expect(entry.value).toBe(
      new PokemonStrength(entry.iv, parameter).calculate().skillCount,
    );
    expect(result.exclusions).toEqual([]);
  });

  it("uses upstream big-berry and skill calculations for the new event", () => {
    const iv = new PokemonIv({ pokemonName: "Mewtwo", level: 60 });
    const ordinary = new PokemonStrength(
      iv,
      createStrengthParameter({ event: "none" }),
    ).calculate();
    const event = new PokemonStrength(
      iv,
      createStrengthParameter({ event: "pursue mewtwo 2nd week" }),
    ).calculate();
    const firstWeek = new PokemonStrength(
      iv,
      createStrengthParameter({ event: "pursue mewtwo 1st week" }),
    ).calculate();

    expect(event.bigBerryStrength).toBeGreaterThan(0);
    expect(event.bigBerryStrength).toBeGreaterThan(firstWeek.bigBerryStrength);
    expect(event.berryTotalStrength).toBe(
      event.berryStrength + event.bigBerryStrength,
    );
    expect(event.totalStrength).toBeGreaterThan(ordinary.totalStrength);
  });

  it("accepts a new Pokémon using only supported mechanics", () => {
    const template = structuredClone(pokemonJson[0]);
    const next = {
      ...template,
      id: 9999,
      name: "Future Test Pokemon",
      ancestor: null,
    };
    const pack = validateUpstreamDataPack([...pokemonJson, next], eventJson);
    applyUpstreamDataPack(pack, "network", 1);

    expect(pack.pokemon.at(-1)?.name).toBe("Future Test Pokemon");
    expect(new PokemonIv({ pokemonName: next.name }).pokemon.name).toBe(
      next.name,
    );
  });

  it("accepts the cooking event's 1.5 multiplier and applies upstream rounding to skill ingredients", () => {
    const cooking = {
      name: "packed portion cooking week 3",
      start: "2026-10-05T04:00:00",
      end: "2026-10-12T04:00:00",
      target: { specialty: "Ingredients" },
      effects: {
        ingredient: 1,
        skillIngredient: 1.5,
        dish: 1.25,
        energyFromDish: 5,
        potSize: 2,
      },
    };
    const reference = {
      ...cooking,
      name: "supported ingredient magnet reference",
      effects: {
        ...cooking.effects,
        skillIngredient: 1,
        ingredientMagnet: 1.5,
      },
    };
    const pack = validateUpstreamDataPack(pokemonJson, {
      ...eventJson,
      bonus: [...eventJson.bonus, cooking, reference],
    });
    expect(pack.issues).toEqual([]);
    applyUpstreamDataPack(pack, "network", 1);
    const iv = new PokemonIv({
      pokemonName: "Venusaur",
      level: 60,
      skillLevel: 3,
    });
    const calculate = (event: string) =>
      new PokemonStrength(iv, createStrengthParameter({ event })).calculate();
    const ordinary = calculate("none");
    const result = calculate(cooking.name);
    const expected = calculate(reference.name);
    expect(result.skillValuePerTrigger).toBe(expected.skillValuePerTrigger);
    expect(result.skillStrength).toBe(expected.skillStrength);
    expect(result.totalStrength).toBe(expected.totalStrength);
    expect(result.skillValuePerTrigger).toBe(
      Math.floor(ordinary.skillValuePerTrigger * 1.5),
    );
    expect(result.skillStrength).toBeGreaterThan(ordinary.skillStrength);
  });

  it("excludes only two pending Pokémon when the 1.5 cooking event is available", () => {
    const pending = ["Foongus", "Amoonguss"].map((name, index) => ({
      ...pokemonJson[0],
      id: 590 + index,
      name,
      specialty: "unknown",
      skill: "unknown",
      frequency: 0,
    }));
    const pack = validateUpstreamDataPack(
      [
        ...pokemonJson.filter(
          (item) => !["Foongus", "Amoonguss"].includes(item.name),
        ),
        ...pending,
      ],
      {
        ...eventJson,
        bonus: [
          ...eventJson.bonus,
          {
            name: "packed portion cooking week 3",
            start: "2026-10-05T04:00:00",
            end: "2026-10-12T04:00:00",
            target: { specialty: "Ingredients" },
            effects: { skillIngredient: 1.5 },
          },
        ],
      },
    );
    expect(pack.issues.map((issue) => [issue.kind, issue.name])).toEqual([
      ["pokemon", "Foongus"],
      ["pokemon", "Amoonguss"],
    ]);
    const unsupported = validateUpstreamDataPack(pokemonJson, {
      ...eventJson,
      bonus: [
        ...eventJson.bonus,
        {
          name: "unsupported multiplier",
          start: "2026-10-05",
          end: "2026-10-12",
          target: {},
          effects: { skillIngredient: 1.75 },
        },
      ],
    });
    expect(unsupported.issues).toContainEqual({
      kind: "event",
      name: "unsupported multiplier",
      reason: "unsupported effect value skillIngredient",
    });
  });

  it("excludes only a Pokémon that requires an unknown mechanic", () => {
    const template = structuredClone(pokemonJson[0]);
    const next = {
      ...template,
      id: 9999,
      name: "Unsupported Test Pokemon",
      skill: "Future Skill",
      ancestor: null,
    };
    const pack = validateUpstreamDataPack([...pokemonJson, next], eventJson);

    expect(pack.pokemon.some((pokemon) => pokemon.name === next.name)).toBe(
      false,
    );
    expect(pack.issues).toContainEqual({
      kind: "pokemon",
      name: next.name,
      reason: "unsupported main skill",
    });
  });

  it("excludes only an event with an unknown big-berry mechanic", () => {
    const future = structuredClone(eventJson.bonus[0]);
    future.name = "Future Big Berry";
    future.effects.bigBerry = "future-event";
    const pack = validateUpstreamDataPack(pokemonJson, {
      ...eventJson,
      bonus: [...eventJson.bonus, future],
    });

    expect(pack.bonus.some((event) => event.name === future.name)).toBe(false);
    expect(pack.issues).toContainEqual({
      kind: "event",
      name: future.name,
      reason: "unsupported big berry event",
    });
    expect(pack.bonus).toHaveLength(eventJson.bonus.length);
  });

  it("rejects a truncated pack instead of replacing known data", () => {
    expect(() => validateUpstreamDataPack([], eventJson)).toThrow(
      "missing or truncated",
    );
  });
});
