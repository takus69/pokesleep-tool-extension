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
});
