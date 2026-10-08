import PokemonIv from "@upstream/util/PokemonIv";
import PokemonStrength from "@upstream/util/PokemonStrength";
import { createStrengthParameter } from "@upstream/util/StrengthParameter";
import { describe, expect, it } from "vitest";
import { calculateUpstreamPokemonStrength } from "./UpstreamPokemonCalculation";

describe("calculateUpstreamPokemonStrength", () => {
  it.each([
    "Pikachu",
    "Bulbasaur",
    "Charizard",
    "Foongus",
    "Amoonguss",
  ])("projects the official calculation for %s without changing its values", (pokemonName) => {
    const iv = new PokemonIv({ pokemonName, level: 30 });
    const parameter = createStrengthParameter({ level: 0 });
    const official = new PokemonStrength(iv, parameter).calculate();

    expect(calculateUpstreamPokemonStrength(iv, parameter)).toEqual({
      ingredients: official.ingredients.map(({ name, count }) => ({
        name,
        count,
      })),
      totalStrength: official.totalStrength,
      berryTotalStrength: official.berryTotalStrength,
      ingStrength: official.ingStrength,
      skillCount: official.skillCount,
    });
  });

  it("applies the psychic berry zone only to psychic Pokémon", () => {
    for (const name of ["Espeon", "Pikachu"]) {
      const iv = new PokemonIv({ pokemonName: name, level: 30 });
      const base = createStrengthParameter({});
      const boosted = createStrengthParameter({});
      boosted.berryZone.psychic = 24;
      const ordinary = calculateUpstreamPokemonStrength(iv, base);
      const result = calculateUpstreamPokemonStrength(iv, boosted);
      expect(result.berryTotalStrength).toBe(
        new PokemonStrength(iv, boosted).calculate().berryTotalStrength,
      );
      if (name === "Espeon")
        expect(result.berryTotalStrength).toBeGreaterThan(
          ordinary.berryTotalStrength ?? 0,
        );
      else expect(result.berryTotalStrength).toBe(ordinary.berryTotalStrength);
    }
  });

  it("applies the cooking event's rounded ingredient multiplier to Bulk Up", () => {
    const iv = new PokemonIv({
      pokemonName: "Heracross",
      level: 30,
      skillLevel: 3,
    });
    const parameter = createStrengthParameter({ event: "custom" });
    const ordinary = new PokemonStrength(iv, parameter).calculate();
    parameter.customEventBonus.effects.skillIngredient = 1.25;
    const boosted = new PokemonStrength(iv, parameter).calculate();
    expect(boosted.skillValuePerTrigger).toBe(
      Math.floor(ordinary.skillValuePerTrigger * 1.25),
    );
    expect(boosted.skillValuePerTrigger2).toBe(ordinary.skillValuePerTrigger2);
    expect(calculateUpstreamPokemonStrength(iv, parameter).totalStrength).toBe(
      boosted.totalStrength,
    );
  });
});
