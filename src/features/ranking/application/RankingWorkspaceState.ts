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
    // IvForm's frequency dialog offers temporary previews. Shared conditions
    // are edited in upstream's own UI, not saved from the ranking workspace.
    return state;
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
