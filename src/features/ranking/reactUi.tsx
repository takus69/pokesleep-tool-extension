import { createTheme, ThemeProvider } from "@mui/material";
import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { subscribeUpstreamDataRefresh } from "../../integration/upstreamDataRefreshState";
import { readUpstreamLanguage } from "../../integration/upstreamLanguage";
import {
  createUpstreamRankingTabController,
  type UpstreamRankingTabController,
} from "../../integration/upstreamRankingTabController";
import type { FeatureContext } from "../types";
import type { RankingScenarioStorage } from "./application/RankingScenarioPersistence";
import { registerExtensionTranslations } from "./i18n";
import { registerRankingTranslations } from "./ui/rankingI18n";
import { AppConfigContext, i18n, loadConfig, loadLanguage } from "./upstreamUi";
import RankingWorkspace from "./workspace/RankingWorkspace";

const theme = createTheme({
  typography: {
    allVariants: { fontFamily: '"M PLUS 1p", system-ui, sans-serif' },
  },
});

function browserLanguage(): string {
  return readUpstreamLanguage(navigator.language);
}

export function mountRankingWorkspace(
  { hostElement }: FeatureContext,
  rankingScenarioStorage: RankingScenarioStorage,
): () => void {
  const upstreamRoot = document.getElementById("root");
  if (upstreamRoot === null) {
    console.warn(
      "[Pokémon Sleep Tool Extension] ランキングタブの挿入位置を確認できないため停止しました。",
    );
    return () => undefined;
  }
  let refreshRevision = 0;
  let workspaceReady = false;
  let reactRoot: Root | undefined;
  let tabController: UpstreamRankingTabController | null = null;
  const editEnvironment = () => {
    void tabController?.openCalculationSettings().then((opened) => {
      if (!opened)
        console.warn(
          "[Pokémon Sleep Tool Extension] 元ツールの計算設定タブを確認できませんでした。",
        );
    });
  };
  const renderWorkspace = () => {
    if (!workspaceReady || reactRoot === undefined) return;
    reactRoot.render(
      <React.StrictMode>
        <ThemeProvider theme={theme}>
          <AppConfigContext.Provider value={loadConfig(browserLanguage())}>
            <RankingWorkspace
              rankingScenarioStorage={rankingScenarioStorage}
              refreshRevision={refreshRevision}
              onEditEnvironment={editEnvironment}
            />
          </AppConfigContext.Provider>
        </ThemeProvider>
      </React.StrictMode>,
    );
  };
  tabController = createUpstreamRankingTabController({
    root: upstreamRoot,
    rankingHost: hostElement,
    label: "ランキング",
    onActivate: () => {
      refreshRevision += 1;
      renderWorkspace();
    },
  });
  if (tabController === null) {
    console.warn(
      "[Pokémon Sleep Tool Extension] ランキングタブの挿入位置を確認できないため停止しました。",
    );
    return () => undefined;
  }

  let disposed = false;
  // Refresh context too: official memoized icons read their table via context renders.
  const unsubscribeData = subscribeUpstreamDataRefresh(renderWorkspace);
  const language = browserLanguage();
  void loadLanguage(language).then(() => {
    if (disposed) return;
    registerRankingTranslations(language);
    registerExtensionTranslations(language);
    void i18n.changeLanguage(language);
    reactRoot = createRoot(hostElement);
    workspaceReady = true;
    renderWorkspace();
  });

  return () => {
    disposed = true;
    unsubscribeData();
    tabController?.dispose();
    reactRoot?.unmount();
  };
}
