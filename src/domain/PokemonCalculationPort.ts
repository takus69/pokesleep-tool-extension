import type { IngredientName } from "@upstream/data/pokemons";
import type PokemonIv from "@upstream/util/PokemonIv";
import type { StrengthParameter } from "@upstream/util/StrengthParameter";

/** The calculation values shared by feature modules; upstream owns the formula. */
export interface PokemonCalculationResult {
  ingredients: readonly { name: IngredientName; count: number }[];
  totalStrength?: number;
  berryTotalStrength?: number;
  ingStrength?: number;
  skillCount?: number;
}

export type PokemonCalculationPort = (
  iv: PokemonIv,
  parameter: StrengthParameter,
) => PokemonCalculationResult;
