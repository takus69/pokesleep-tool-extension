import PokemonIv from "@upstream/util/PokemonIv";
import PokemonStrength, {
  createStrengthParameter,
} from "@upstream/util/PokemonStrength";
import { beforeEach, describe, expect, it } from "vitest";
import eventJson from "../vendor/upstream-data/event.json";
import pokemonJson from "../vendor/upstream-data/pokemon.json";
import {
  applyUpstreamDataPack,
  validateUpstreamDataPack,
} from "./upstreamDataPack";

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
