import PokemonStrength from "@upstream/util/PokemonStrength";
import type { PokemonCalculationPort } from "./PokemonCalculationPort";

/** Thin, browser-independent boundary around the pinned official calculator. */
export const calculateUpstreamPokemonStrength: PokemonCalculationPort = (
  iv,
  parameter,
) => {
  const result = new PokemonStrength(iv, parameter).calculate();
  return {
    ingredients: result.ingredients.map(({ name, count }) => ({ name, count })),
    totalStrength: result.totalStrength,
    berryTotalStrength: result.berryTotalStrength,
    ingStrength: result.ingStrength,
    skillCount: result.skillCount,
  };
};
