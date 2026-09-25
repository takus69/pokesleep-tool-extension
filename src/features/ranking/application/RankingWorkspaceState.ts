import {
  normalizeStrengthParameter,
  type StrengthParameter,
  saveStrengthParameter,
} from "@upstream/util/PokemonStrength";
import {
  type IvAction,
  type IvState,
  normalizeState,
} from "../../../integration/upstreamIvState";
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
  if (action.type === "updateIv") {
    // Keep upstream IV normalization, but do not invoke its storage-writing
    // reducer. Its parameter normalization can mutate nested team settings.
    const next = normalizeState({
      ...state,
      parameter: cloneRankingEnvironment(state.parameter),
      pokemonIv: action.payload.iv,
    });
    return { ...next, parameter: state.parameter };
  }
  if (action.type === "changeLowerTab") {
    return { ...state, lowerTabIndex: action.payload.index };
  }
  // The ranking editor is read-only with respect to the upstream box and
  // unsupported upstream actions must not acquire future storage effects.
  return state;
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

export type RankingWorkspaceAction =
  | IvAction
  | { type: "syncUpstream"; payload: IvState }
  | { type: "selectComparison"; payload: { id: number } };

/** Ranking-only selections never dispatch upstream box mutations. */
export function rankingWorkspaceViewReducer(
  state: IvState,
  action: RankingWorkspaceAction,
): IvState {
  if (action.type === "syncUpstream") {
    return {
      ...state,
      pokemonIv: action.payload.pokemonIv,
      parameter: action.payload.parameter,
      box: action.payload.box,
      selectedItemId: -1,
    };
  }
  if (action.type === "selectComparison") {
    const item = state.box.getById(action.payload.id);
    return item === null
      ? state
      : { ...state, pokemonIv: item.iv, selectedItemId: item.id };
  }
  return rankingWorkspaceReducer(state, action);
}
