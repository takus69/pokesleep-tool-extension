import { getInitialIvState } from "../../../pokesleep-tool/src/ui/IvCalc/IvState";
import PokemonBox from "../../../pokesleep-tool/src/util/PokemonBox";
import { loadStrengthParameter } from "../../../pokesleep-tool/src/util/StrengthParameter";

export type UpstreamRankingInputs = ReturnType<typeof getInitialIvState>;

/** Load a fresh, read-only snapshot from the upstream tool's own storage. */
export function loadUpstreamRankingInputs(): UpstreamRankingInputs {
  const state = getInitialIvState();
  const box = new PokemonBox();
  box.load();
  return { ...state, parameter: loadStrengthParameter(), box };
}
