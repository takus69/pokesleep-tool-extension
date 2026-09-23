import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type PokemonIv from "@upstream/util/PokemonIv";
import type { StrengthParameter } from "@upstream/util/PokemonStrength";
import React from "react";
import { useTranslation } from "react-i18next";
import { RatingView, RpView, StrengthBerryIngSkillView } from "../upstreamUi";
import {
  createRankingPreviewState,
  rankingPreviewReducer,
} from "./RankingDetailPreviewState";

type DetailTab = 0 | 1 | 2;

export function createRankingDetailPaperSx(theme: Theme) {
  return {
    [theme.breakpoints.down("sm")]: {
      margin: 0,
      width: "100%",
      maxWidth: "100%",
      height: "100%",
      maxHeight: "none",
      borderRadius: 0,
    },
  };
}

export default function RankingPokemonDetailDialog({
  open,
  iv,
  environment,
  summary,
  onClose,
}: {
  open: boolean;
  iv: PokemonIv;
  environment: StrengthParameter;
  summary: React.ReactNode;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [tab, setTab] = React.useState<DetailTab>(1);
  const [state, dispatch] = React.useReducer(
    rankingPreviewReducer,
    undefined,
    () => createRankingPreviewState(iv, environment),
  );
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    if (!open) return;
    setTab(1);
    dispatch({
      type: "resetPreview",
      payload: { iv, environment },
    });
  }, [open, iv, environment]);

  React.useEffect(() => {
    const element = contentRef.current;
    if (!element) return;
    const update = () => setWidth(element.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-label={t("details")}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="md"
      slotProps={{ paper: { sx: createRankingDetailPaperSx(theme) } }}
    >
      <DialogTitle>{t("details")}</DialogTitle>
      <DialogContent ref={contentRef} dividers sx={{ overflowX: "hidden" }}>
        {summary}
        <Tabs
          value={tab}
          onChange={(_event, value: DetailTab) => setTab(value)}
          variant="fullWidth"
          sx={{ mb: 1 }}
        >
          <Tab label={t("rp")} value={0} />
          <Tab label={t("strength2")} value={1} />
          <Tab label={t("rating")} value={2} />
        </Tabs>
        <Box sx={{ position: "relative", minHeight: tab === 1 ? 190 : 400 }}>
          {tab === 0 && <RpView state={state} width={width} />}
          {tab === 1 && (
            <StrengthBerryIngSkillView
              pokemonIv={state.pokemonIv}
              settings={state.parameter}
              energyDialogOpen={state.energyDialogOpen}
              dispatch={dispatch}
            />
          )}
          {tab === 2 && (
            <RatingView pokemonIv={state.pokemonIv} width={width} />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("close")}</Button>
      </DialogActions>
    </Dialog>
  );
}
