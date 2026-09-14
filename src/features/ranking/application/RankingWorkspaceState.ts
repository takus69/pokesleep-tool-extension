import {
  normalizeStrengthParameter,
  type StrengthParameter,
  saveStrengthParameter,
} from "@upstream/util/PokemonStrength";
import { type IvAction, type IvState, ivStateReducer } from "../upstreamUi";
import { cloneRankingEnvironment } from "../workspace/useRankingScenario";

/** Keep the shared environment independent of the currently edited individual. */
export function rankingWorkspaceReducer(
  state: IvState,
  action: IvAction,
): IvState {
  if (action.type === "changeParameter") {
    // Upstream normalizes Cresselia's team using the selected IV. In this
    // workspace the same environment evaluates many species, so only shared
    // field/event normalization applies to an explicit environment edit.
    const parameter = normalizeStrengthParameter(
      cloneRankingEnvironment(action.payload.parameter),
    );
    saveStrengthParameter(parameter);
    return { ...state, parameter };
  }
  // Upstream normalizeState can mutate berryBurstTeam in place. Isolate its
  // scratch parameter, retain its IV/box/cache behavior, then restore the
  // shared environment (and its identity) for all individual-only actions.
  const next = ivStateReducer(
    { ...state, parameter: cloneRankingEnvironment(state.parameter) },
    action,
  );
  return { ...next, parameter: state.parameter };
}

/** Preserve the shared ranking environment while editing one comparison IV. */
export function preserveRankingIndividualSettings(
  action: IvAction,
  parameter: StrengthParameter,
): IvAction {
  if (action.type !== "changeParameter") return action;
  return {
    ...action,
    payload: {
      parameter: {
        ...action.payload.parameter,
        level: parameter.level,
        evolved: parameter.evolved,
        maxSkillLevel: parameter.maxSkillLevel,
      },
    },
  };
}
