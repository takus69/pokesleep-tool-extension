import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { preserveRankingIndividualSettings } from "../../../../../pokesleep-tool/src/fork/RankingEnvironmentForm";
import { rankingWorkspaceReducer } from "../../../../../pokesleep-tool/src/fork/RankingWorkspaceState";
import IvForm from "../../../../../pokesleep-tool/src/ui/IvCalc/IvForm/IvForm";
import type IvState from "../../../../../pokesleep-tool/src/ui/IvCalc/IvState";
import type { IvAction } from "../../../../../pokesleep-tool/src/ui/IvCalc/IvState";
import LowerTabHeader from "../../../../../pokesleep-tool/src/ui/IvCalc/LowerTabHeader";
import RateNotFixedPanel from "../../../../../pokesleep-tool/src/ui/IvCalc/RateNotFixedPanel";
import type PokemonIv from "../../../../../pokesleep-tool/src/util/PokemonIv";
import { createRankingEnvironment } from "../../../../../pokesleep-tool/src/util/RankingScenario";
import { loadUpstreamRankingInputs } from "../../../integration/upstreamRankingInputs";
import RankingScenarioView from "./RankingScenarioView";
import ReadOnlyComparisonBoxPanel from "./ReadOnlyComparisonBoxPanel";

type WorkspaceAction =
  | IvAction
  | { type: "syncUpstream"; payload: IvState }
  | { type: "selectComparison"; payload: { id: number } };

function extensionReducer(state: IvState, action: WorkspaceAction): IvState {
  if (action.type === "syncUpstream") {
    return {
      ...state,
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

const RankingWorkspace = React.memo(
  ({ refreshRevision }: { refreshRevision: number }) => {
    const initial = React.useMemo(() => loadUpstreamRankingInputs(), []);
    const [state, dispatch] = React.useReducer(extensionReducer, initial);
    // biome-ignore lint/correctness/useExhaustiveDependencies: the revision explicitly requests a fresh upstream snapshot
    React.useEffect(() => {
      dispatch({ type: "syncUpstream", payload: loadUpstreamRankingInputs() });
    }, [refreshRevision]);
    const [comparisonIv, setComparisonIv] = React.useState<PokemonIv | null>(
      null,
    );
    const [comparisonEditorOpen, setComparisonEditorOpen] =
      React.useState(false);
    const { t } = useTranslation();

    const onPokemonIvChange = React.useCallback((value: PokemonIv) => {
      dispatch({ type: "updateIv", payload: { iv: value } });
    }, []);
    const individualDispatch = React.useCallback(
      (action: IvAction) => {
        dispatch(preserveRankingIndividualSettings(action, state.parameter));
      },
      [state.parameter],
    );

    return (
      <>
        <RankingScenarioView
          state={state}
          comparisonIv={comparisonIv}
          onAddComparison={() => {
            dispatch({ type: "changeLowerTab", payload: { index: 0 } });
            setComparisonEditorOpen(true);
          }}
          onEditComparison={() => {
            if (comparisonIv)
              dispatch({ type: "updateIv", payload: { iv: comparisonIv } });
            setComparisonEditorOpen(true);
          }}
          onRemoveComparison={() => setComparisonIv(null)}
        />
        <Dialog
          open={comparisonEditorOpen}
          onClose={() => setComparisonEditorOpen(false)}
          fullWidth
          maxWidth="sm"
          slotProps={{
            paper: {
              sx: (theme) => ({
                height: "min(800px, calc(100% - 64px))",
                overflow: "hidden",
                [theme.breakpoints.down("sm")]: {
                  borderRadius: 0,
                  height: "100%",
                  margin: 0,
                  maxHeight: "none",
                  maxWidth: "none",
                  width: "100%",
                },
              }),
            },
          }}
        >
          <DialogTitle>
            {t(comparisonIv ? "fork.scenario.comparison" : "pokemon")}
          </DialogTitle>
          <DialogContent
            sx={
              state.lowerTabIndex === 1
                ? {
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    padding: 0,
                  }
                : undefined
            }
          >
            <LowerTabHeader
              state={{ ...state, tabIndex: 0 }}
              isBoxEmpty={state.box.items.length === 0}
              dispatch={individualDispatch}
            />
            {state.lowerTabIndex !== 1 ? (
              <>
                <RateNotFixedPanel state={state} dispatch={dispatch} />
                <IvForm
                  parameter={createRankingEnvironment(state.parameter)}
                  pokemonIv={state.pokemonIv}
                  dispatch={individualDispatch}
                  onChange={onPokemonIvChange}
                />
              </>
            ) : (
              <ReadOnlyComparisonBoxPanel
                items={state.box.items}
                selectedId={state.selectedItemId}
                onSelect={(id) =>
                  dispatch({ type: "selectComparison", payload: { id } })
                }
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              onClick={() => {
                setComparisonIv(state.pokemonIv);
                setComparisonEditorOpen(false);
              }}
            >
              {t("fork.scenario.set comparison")}
            </Button>
            <Button onClick={() => setComparisonEditorOpen(false)}>
              {t("close")}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  },
);

export default RankingWorkspace;
