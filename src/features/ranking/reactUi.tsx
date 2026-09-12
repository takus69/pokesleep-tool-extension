import { createTheme, ThemeProvider } from "@mui/material";
import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { registerForkTranslations } from "../../../../pokesleep-tool/src/fork/i18n";
import i18n, { loadLanguage } from "../../../../pokesleep-tool/src/i18n";
import {
  AppConfigContext,
  loadConfig,
} from "../../../../pokesleep-tool/src/ui/AppConfig";
import { findUpstreamRankingSlot } from "../../integration/upstreamRankingSlot";
import { createUpstreamViewVisibility } from "../../integration/upstreamViewVisibility";
import type { FeatureContext } from "../types";
import RankingWorkspace from "./workspace/RankingWorkspace";

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
  const initialSlot =
    upstreamRoot === null ? null : findUpstreamRankingSlot(upstreamRoot);
  if (upstreamRoot === null || initialSlot === null) {
    console.warn(
      "[Pokémon Sleep Tool Extension] ランキングタブの挿入位置を確認できないため停止しました。",
    );
    return () => undefined;
  }
  let slot = initialSlot;

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
  let visibility = createUpstreamViewVisibility(slot, hostElement);
  let rankingActive = false;
  let refreshRevision = 0;
  let workspaceReady = false;
  let reactRoot: Root | undefined;
  const renderWorkspace = () => {
    if (!workspaceReady || reactRoot === undefined) return;
    reactRoot.render(
      <React.StrictMode>
        <ThemeProvider theme={theme}>
          <AppConfigContext.Provider value={loadConfig(browserLanguage())}>
            <RankingWorkspace refreshRevision={refreshRevision} />
          </AppConfigContext.Provider>
        </ThemeProvider>
      </React.StrictMode>,
    );
  };

  const deactivate = () => {
    rankingActive = false;
    visibility.restore();
    hostElement.style.display = "none";
    rankingTab.setAttribute("aria-selected", "false");
    rankingTab.setAttribute("tabindex", "-1");
    rankingTab.style.removeProperty("color");
    rankingTab.style.removeProperty("border-bottom");
  };

  const activate = () => {
    rankingActive = true;
    refreshRevision += 1;
    renderWorkspace();
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
    if (rankingTab.isConnected) return;
    const nextSlot = findUpstreamRankingSlot(upstreamRoot);
    if (nextSlot === null) return;
    slot.tabList.removeEventListener("click", onNativeTabClick, true);
    visibility.dispose();
    slot = nextSlot;
    visibility = createUpstreamViewVisibility(slot, hostElement);
    slot.workspaceHeader.parentElement?.insertBefore(
      hostElement,
      slot.workspaceHeader.nextElementSibling,
    );
    slot.tabList.append(rankingTab);
    slot.tabList.addEventListener("click", onNativeTabClick, true);
    if (rankingActive) activate();
  });
  observer.observe(upstreamRoot, { childList: true, subtree: true });

  let disposed = false;
  const language = browserLanguage();
  void loadLanguage(language).then(() => {
    if (disposed) return;
    registerForkTranslations(language);
    void i18n.changeLanguage(language);
    reactRoot = createRoot(hostElement);
    workspaceReady = true;
    renderWorkspace();
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
