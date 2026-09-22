import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
} from "@mui/material";
import type PokemonIv from "@upstream/util/PokemonIv";
import React from "react";
import { useTranslation } from "react-i18next";
import { orderUpstreamBoxItems } from "../../../integration/upstreamBoxOrdering";
import { getUpstreamDataStatus } from "../../../integration/upstreamDataPack";
import { loadUpstreamRankingInputs } from "../../../integration/upstreamRankingInputs";
import type { RankingScenarioStorage } from "../application/RankingScenarioPersistence";
import {
  preserveRankingIndividualSettings,
  rankingWorkspaceViewReducer,
} from "../application/RankingWorkspaceState";
import { createRankingEnvironment } from "../domain/RankingScenario";
import { type IvAction, IvForm, RateNotFixedPanel } from "../upstreamUi";
import RankingScenarioView from "./RankingScenarioView";
import ReadOnlyComparisonBoxPanel from "./ReadOnlyComparisonBoxPanel";

const RankingWorkspace = React.memo(
  ({
    rankingScenarioStorage,
    refreshRevision,
    onEditEnvironment,
  }: {
    rankingScenarioStorage: RankingScenarioStorage;
    refreshRevision: number;
    onEditEnvironment: () => void;
  }) => {
    const initial = React.useMemo(() => loadUpstreamRankingInputs(), []);
    const [state, dispatch] = React.useReducer(
      rankingWorkspaceViewReducer,
      initial.state,
    );
    const [environmentKey, setEnvironmentKey] = React.useState(
      initial.environmentKey,
    );
    const [unsupportedEvent, setUnsupportedEvent] = React.useState(
      initial.unsupportedEvent,
    );
    const [boxSortConfig, setBoxSortConfig] = React.useState(
      initial.boxSortConfig,
    );
    // biome-ignore lint/correctness/useExhaustiveDependencies: the revision explicitly requests a fresh upstream snapshot
    React.useEffect(() => {
      const latest = loadUpstreamRankingInputs();
      dispatch({ type: "syncUpstream", payload: latest.state });
      setEnvironmentKey(latest.environmentKey);
      setUnsupportedEvent(latest.unsupportedEvent);
      setBoxSortConfig(latest.boxSortConfig);
    }, [refreshRevision]);
    const [comparisonIv, setComparisonIv] = React.useState<PokemonIv | null>(
      null,
    );
    const [comparisonEditorOpen, setComparisonEditorOpen] =
      React.useState(false);
    const { t } = useTranslation();
    const orderedBox = React.useMemo(
      () =>
        comparisonEditorOpen && state.lowerTabIndex === 1
          ? orderUpstreamBoxItems(
              state.box.items,
              boxSortConfig,
              state.parameter,
              t,
            )
          : { ok: true as const, items: [], emptyMessage: "" },
      [
        comparisonEditorOpen,
        state.lowerTabIndex,
        state.box.items,
        boxSortConfig,
        state.parameter,
        t,
      ],
    );

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
          storage={rankingScenarioStorage}
          state={state}
          environmentKey={environmentKey}
          unsupportedEvent={unsupportedEvent}
          dataIssueCount={getUpstreamDataStatus().issues.length}
          onEditEnvironment={onEditEnvironment}
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
            {t(comparisonIv ? "ranking.scenario.comparison" : "pokemon")}
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
            <Tabs
              value={state.lowerTabIndex}
              onChange={(_event, index: number) =>
                dispatch({ type: "changeLowerTab", payload: { index } })
              }
              sx={{ minHeight: "clamp(20px, 3vh, 36px)" }}
            >
              <Tab
                label={t("pokemon")}
                sx={{ minHeight: "clamp(20px, 3vh, 36px)", py: 0.75 }}
              />
              <Tab
                label={t("box")}
                sx={{ minHeight: "clamp(20px, 3vh, 36px)", py: 0.75 }}
              />
            </Tabs>
            {state.lowerTabIndex !== 1 ? (
              <>
                <RateNotFixedPanel state={state} />
                <IvForm
                  parameter={createRankingEnvironment(state.parameter)}
                  pokemonIv={state.pokemonIv}
                  dispatch={individualDispatch}
                  onChange={onPokemonIvChange}
                />
              </>
            ) : (
              <ReadOnlyComparisonBoxPanel
                items={orderedBox.ok ? orderedBox.items : []}
                emptyMessage={
                  orderedBox.ok ? orderedBox.emptyMessage : orderedBox.message
                }
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
              disabled={state.lowerTabIndex === 1 && !orderedBox.ok}
              onClick={() => {
                setComparisonIv(state.pokemonIv);
                setComparisonEditorOpen(false);
              }}
            >
              {t("ranking.scenario.set comparison")}
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
