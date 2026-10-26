import PokemonBox from "@upstream/util/Box/PokemonBox";
import type PokemonIv from "@upstream/util/PokemonIv";
import type { StrengthParameter } from "@upstream/util/PokemonStrength";
import { createInitialTeams, type IvAction, type IvState } from "../upstreamUi";
import { cloneRankingEnvironment } from "../workspace/useRankingScenario";

type RankingPreviewAction =
  | IvAction
  | {
      type: "resetPreview";
      payload: { iv: PokemonIv; environment: StrengthParameter };
    };

/** Only the state needed to preview upstream detail views; no saved box is loaded. */
export function createRankingPreviewState(
  iv: PokemonIv,
  environment: StrengthParameter,
): IvState {
  return {
    tabIndex: 1,
    lowerTabIndex: 0,
    pokemonIv: iv.clone(),
    parameter: cloneRankingEnvironment(environment),
    box: new PokemonBox(),
    boxStatus: "ready",
    boxReloadCount: 0,
    boxDrawerPosition: { full: false, height: null },
    selectedItemId: -1,
    energyDialogOpen: false,
    boxExportDialogOpen: false,
    boxImportDialogOpen: false,
    boxDeleteAllDialogOpen: false,
    alertMessage: "",
    teams: createInitialTeams(),
    teamIndex: 0,
  };
}

/** Explicitly ignore upstream actions that could mutate or persist a box. */
export function rankingPreviewReducer(
  state: IvState,
  action: RankingPreviewAction,
): IvState {
  switch (action.type) {
    case "resetPreview":
      return createRankingPreviewState(
        action.payload.iv,
        action.payload.environment,
      );
    case "openEnergyDialog":
      return { ...state, energyDialogOpen: true };
    case "closeEnergyDialog":
      return { ...state, energyDialogOpen: false };
    case "changeParameter":
      return {
        ...state,
        parameter: cloneRankingEnvironment(action.payload.parameter),
      };
    case "updateIv":
      return { ...state, pokemonIv: action.payload.iv.clone() };
    default:
      return state;
  }
}
