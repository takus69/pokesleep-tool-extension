import { createTheme, ThemeProvider } from "@mui/material";
import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { registerForkTranslations } from "../../../../pokesleep-tool/src/fork/i18n";
import RankingWorkspace from "../../../../pokesleep-tool/src/fork/RankingWorkspace";
import i18n, { loadLanguage } from "../../../../pokesleep-tool/src/i18n";
import {
  AppConfigContext,
  loadConfig,
} from "../../../../pokesleep-tool/src/ui/AppConfig";
import { findUpstreamRankingSlot } from "../../integration/upstreamRankingSlot";
import { createUpstreamViewVisibility } from "../../integration/upstreamViewVisibility";
import type { FeatureContext } from "../types";

const theme = createTheme({
  typography: {
    allVariants: { fontFamily: '"M PLUS 1p", system-ui, sans-serif' },
  },
});

function browserLanguage(): string {
  const stored = loadConfig("en").language;
  if (["en", "ja", "ko", "zh-CN", "zh-TW"].includes(stored)) return stored;
  const language = navigator.language;
  if (/ja/i.test(language)) return "ja";
  if (/ko/i.test(language)) return "ko";
  if (/^zh-hant/i.test(language)) return "zh-TW";
  if (/^zh/i.test(language)) return "zh-CN";
  return "en";
}

export function mountRankingWorkspace({
  hostElement,
}: FeatureContext): () => void {
  const upstreamRoot = document.getElementById("root");
  const slot =
    upstreamRoot === null ? null : findUpstreamRankingSlot(upstreamRoot);
  if (slot === null) {
    console.warn(
      "[Pokémon Sleep Tool Extension] ランキングタブの挿入位置を確認できないため停止しました。",
    );
    return () => undefined;
  }

  const firstTab = slot.tabList.querySelector<HTMLElement>(
    ":scope > [role='tab']",
  );
  if (firstTab === null) return () => undefined;
  const rankingTab = firstTab.cloneNode(false) as HTMLButtonElement;
  rankingTab.removeAttribute("id");
  rankingTab.removeAttribute("aria-controls");
  rankingTab.setAttribute("aria-selected", "false");
  rankingTab.setAttribute("tabindex", "-1");
  rankingTab.textContent = "ランキング";
  rankingTab.dataset.pokesleepExtensionRanking = "true";
  slot.tabList.append(rankingTab);

  const originalParent = hostElement.parentElement;
  const originalNextSibling = hostElement.nextSibling;
  const workspace = slot.workspaceHeader.parentElement;
  workspace?.insertBefore(hostElement, slot.workspaceHeader.nextElementSibling);
  hostElement.style.display = "none";
  hostElement.style.width = "100%";
  const visibility = createUpstreamViewVisibility(slot, hostElement);

  const deactivate = () => {
    visibility.restore();
    hostElement.style.display = "none";
    rankingTab.setAttribute("aria-selected", "false");
    rankingTab.setAttribute("tabindex", "-1");
    rankingTab.style.removeProperty("color");
    rankingTab.style.removeProperty("border-bottom");
  };

  const activate = () => {
    visibility.hideForRanking();
    for (const tab of slot.tabList.querySelectorAll<HTMLElement>(
      "[role='tab']",
    )) {
      tab.setAttribute("aria-selected", String(tab === rankingTab));
      tab.setAttribute("tabindex", tab === rankingTab ? "0" : "-1");
    }
    rankingTab.style.color = "#1976d2";
    rankingTab.style.borderBottom = "2px solid #1976d2";
    hostElement.style.display = "block";
  };

  const onNativeTabClick = (event: Event) => {
    if (event.target instanceof Node && !rankingTab.contains(event.target))
      deactivate();
  };
  const onRankingTabClick = (event: MouseEvent) => {
    event.stopPropagation();
    activate();
  };
  rankingTab.addEventListener("click", onRankingTabClick);
  slot.tabList.addEventListener("click", onNativeTabClick, true);

  const observer = new MutationObserver(() => {
    if (!rankingTab.isConnected) slot.tabList.append(rankingTab);
  });
  observer.observe(slot.tabList, { childList: true });

  let reactRoot: Root | undefined;
  let disposed = false;
  const language = browserLanguage();
  void loadLanguage(language).then(() => {
    if (disposed) return;
    registerForkTranslations(language);
    void i18n.changeLanguage(language);
    const config = loadConfig(language);
    reactRoot = createRoot(hostElement);
    reactRoot.render(
      <React.StrictMode>
        <ThemeProvider theme={theme}>
          <AppConfigContext.Provider value={config}>
            <RankingWorkspace />
          </AppConfigContext.Provider>
        </ThemeProvider>
      </React.StrictMode>,
    );
  });

  return () => {
    disposed = true;
    observer.disconnect();
    deactivate();
    visibility.dispose();
    rankingTab.removeEventListener("click", onRankingTabClick);
    slot.tabList.removeEventListener("click", onNativeTabClick, true);
    rankingTab.remove();
    reactRoot?.unmount();
    if (originalParent !== null)
      originalParent.insertBefore(hostElement, originalNextSibling);
  };
}
