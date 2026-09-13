import { createTheme, ThemeProvider } from "@mui/material";
import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { registerForkTranslations } from "../../../../pokesleep-tool/src/fork/i18n";
import i18n, { loadLanguage } from "../../../../pokesleep-tool/src/i18n";
import {
  AppConfigContext,
  loadConfig,
} from "../../../../pokesleep-tool/src/ui/AppConfig";
import { openUpstreamCalculationSettings } from "../../integration/upstreamCalculationSettings";
import { findUpstreamRankingSlot } from "../../integration/upstreamRankingSlot";
import { createUpstreamViewVisibility } from "../../integration/upstreamViewVisibility";
import type { FeatureContext } from "../types";
import { registerExtensionTranslations } from "./i18n";
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
  rankingTab.classList.remove("Mui-selected");
  rankingTab.removeAttribute("id");
  rankingTab.removeAttribute("aria-controls");
  rankingTab.setAttribute("aria-selected", "false");
  rankingTab.setAttribute("tabindex", "-1");
  rankingTab.textContent = "ランキング";
  rankingTab.style.position = "relative";
  const rankingIndicator = document.createElement("span");
  rankingIndicator.dataset.pokesleepExtensionRankingIndicator = "true";
  Object.assign(rankingIndicator.style, {
    position: "absolute",
    right: "0",
    bottom: "0",
    left: "0",
    height: "2px",
    backgroundColor: "currentColor",
    transform: "scaleX(0)",
    transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
    pointerEvents: "none",
  });
  rankingTab.append(rankingIndicator);
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
  const nativeTabState = new Map<
    HTMLElement,
    { ariaSelected: string | null; tabIndex: string | null; selected: boolean }
  >();
  let indicator: HTMLElement | null = null;
  let indicatorVisibility = "";
  const editEnvironment = () => {
    void openUpstreamCalculationSettings(slot).then((opened) => {
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
              refreshRevision={refreshRevision}
              onEditEnvironment={editEnvironment}
            />
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
    rankingTab.classList.remove("Mui-selected");
    rankingIndicator.style.transform = "scaleX(0)";
    for (const [tab, state] of nativeTabState) {
      if (state.ariaSelected === null) tab.removeAttribute("aria-selected");
      else tab.setAttribute("aria-selected", state.ariaSelected);
      if (state.tabIndex === null) tab.removeAttribute("tabindex");
      else tab.setAttribute("tabindex", state.tabIndex);
      tab.classList.toggle("Mui-selected", state.selected);
    }
    nativeTabState.clear();
    if (indicator !== null) indicator.style.visibility = indicatorVisibility;
    indicator = null;
  };

  const activate = () => {
    rankingActive = true;
    refreshRevision += 1;
    renderWorkspace();
    visibility.hideForRanking();
    nativeTabState.clear();
    for (const tab of slot.tabList.querySelectorAll<HTMLElement>(
      "[role='tab']",
    )) {
      if (tab !== rankingTab) {
        nativeTabState.set(tab, {
          ariaSelected: tab.getAttribute("aria-selected"),
          tabIndex: tab.getAttribute("tabindex"),
          selected: tab.classList.contains("Mui-selected"),
        });
        tab.classList.remove("Mui-selected");
      }
      tab.setAttribute("aria-selected", String(tab === rankingTab));
      tab.setAttribute("tabindex", tab === rankingTab ? "0" : "-1");
    }
    rankingTab.classList.add("Mui-selected");
    rankingIndicator.style.transform = "scaleX(1)";
    indicator =
      slot.tabList.parentElement?.querySelector<HTMLElement>(
        ".MuiTabs-indicator",
      ) ?? null;
    if (indicator !== null) {
      indicatorVisibility = indicator.style.visibility;
      indicator.style.visibility = "hidden";
    }
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
    registerExtensionTranslations(language);
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
