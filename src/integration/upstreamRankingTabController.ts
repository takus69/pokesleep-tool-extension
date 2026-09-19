import { openUpstreamCalculationSettings } from "./upstreamCalculationSettings";
import {
  findUpstreamRankingSlot,
  type UpstreamRankingSlot,
} from "./upstreamRankingSlot";
import {
  createUpstreamViewVisibility,
  type UpstreamViewVisibility,
} from "./upstreamViewVisibility";

interface NativeTabState {
  readonly ariaSelected: string | null;
  readonly tabIndex: string | null;
  readonly selected: boolean;
}

export interface UpstreamRankingTabController {
  activate(): void;
  deactivate(): void;
  openCalculationSettings(): Promise<boolean>;
  dispose(): void;
}

export interface UpstreamRankingTabOptions {
  readonly root: HTMLElement;
  readonly rankingHost: HTMLElement;
  readonly label: string;
  readonly onActivate: () => void;
}

function createRankingTab(
  slot: UpstreamRankingSlot,
  label: string,
): { tab: HTMLButtonElement; indicator: HTMLElement } | null {
  const firstTab = slot.tabList.querySelector<HTMLElement>(
    ":scope > [role='tab']",
  );
  if (firstTab === null) return null;
  const tab = firstTab.cloneNode(false) as HTMLButtonElement;
  tab.classList.remove("Mui-selected");
  tab.removeAttribute("id");
  tab.removeAttribute("aria-controls");
  tab.setAttribute("aria-selected", "false");
  tab.setAttribute("tabindex", "-1");
  tab.textContent = label;
  tab.style.position = "relative";
  tab.dataset.pokesleepExtensionRanking = "true";

  const indicator = document.createElement("span");
  indicator.dataset.pokesleepExtensionRankingIndicator = "true";
  Object.assign(indicator.style, {
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
  tab.append(indicator);
  return { tab, indicator };
}

/** Own all DOM and event coupling required to add the ranking upper tab. */
export function createUpstreamRankingTabController({
  root,
  rankingHost,
  label,
  onActivate,
}: UpstreamRankingTabOptions): UpstreamRankingTabController | null {
  const initialSlot = findUpstreamRankingSlot(root);
  if (initialSlot === null) return null;
  const created = createRankingTab(initialSlot, label);
  if (created === null) return null;

  let slot = initialSlot;
  const { tab: rankingTab, indicator: rankingIndicator } = created;
  const originalParent = rankingHost.parentElement;
  const originalNextSibling = rankingHost.nextSibling;
  const nativeTabState = new Map<HTMLElement, NativeTabState>();
  let visibility: UpstreamViewVisibility;
  let rankingActive = false;
  let nativeIndicator: HTMLElement | null = null;
  let nativeIndicatorVisibility = "";

  const placeHost = (): void => {
    slot.workspaceHeader.parentElement?.insertBefore(
      rankingHost,
      slot.workspaceHeader.nextElementSibling,
    );
    rankingHost.style.display = "none";
    rankingHost.style.width = "100%";
  };

  const restoreNativeTabs = (): void => {
    for (const [tab, state] of nativeTabState) {
      if (state.ariaSelected === null) tab.removeAttribute("aria-selected");
      else tab.setAttribute("aria-selected", state.ariaSelected);
      if (state.tabIndex === null) tab.removeAttribute("tabindex");
      else tab.setAttribute("tabindex", state.tabIndex);
      tab.classList.toggle("Mui-selected", state.selected);
    }
    nativeTabState.clear();
    if (nativeIndicator !== null)
      nativeIndicator.style.visibility = nativeIndicatorVisibility;
    nativeIndicator = null;
  };

  const applyActiveTabState = (): void => {
    for (const tab of slot.tabList.querySelectorAll<HTMLElement>(
      ":scope > [role='tab']",
    )) {
      if (tab !== rankingTab && !nativeTabState.has(tab)) {
        nativeTabState.set(tab, {
          ariaSelected: tab.getAttribute("aria-selected"),
          tabIndex: tab.getAttribute("tabindex"),
          selected: tab.classList.contains("Mui-selected"),
        });
      }
      if (tab !== rankingTab) tab.classList.remove("Mui-selected");
      tab.setAttribute("aria-selected", String(tab === rankingTab));
      tab.setAttribute("tabindex", tab === rankingTab ? "0" : "-1");
    }
    rankingTab.classList.add("Mui-selected");
    rankingIndicator.style.transform = "scaleX(1)";
    if (nativeIndicator === null) {
      nativeIndicator =
        slot.tabList.parentElement?.querySelector<HTMLElement>(
          ".MuiTabs-indicator",
        ) ?? null;
      if (nativeIndicator !== null) {
        nativeIndicatorVisibility = nativeIndicator.style.visibility;
        nativeIndicator.style.visibility = "hidden";
      }
    }
    rankingHost.style.display = "block";
  };

  const deactivate = (): void => {
    rankingActive = false;
    visibility.restore();
    rankingHost.style.display = "none";
    rankingTab.setAttribute("aria-selected", "false");
    rankingTab.setAttribute("tabindex", "-1");
    rankingTab.classList.remove("Mui-selected");
    rankingIndicator.style.transform = "scaleX(0)";
    restoreNativeTabs();
  };

  const activate = (): void => {
    if (!rankingActive) {
      rankingActive = true;
      nativeTabState.clear();
      onActivate();
    }
    visibility.hideForRanking();
    applyActiveTabState();
  };

  const onNativeTabClick = (event: Event): void => {
    if (event.target instanceof Node && !rankingTab.contains(event.target))
      deactivate();
  };
  const onRankingTabClick = (event: MouseEvent): void => {
    event.stopPropagation();
    activate();
  };

  const attach = (): void => {
    placeHost();
    slot.tabList.append(rankingTab);
    slot.tabList.addEventListener("click", onNativeTabClick, true);
  };

  visibility = createUpstreamViewVisibility(slot, rankingHost);
  attach();
  rankingTab.addEventListener("click", onRankingTabClick);

  const observer = new MutationObserver(() => {
    if (rankingTab.isConnected) {
      if (rankingActive) applyActiveTabState();
      return;
    }
    const nextSlot = findUpstreamRankingSlot(root);
    if (nextSlot === null) return;
    slot.tabList.removeEventListener("click", onNativeTabClick, true);
    visibility.dispose();
    restoreNativeTabs();
    slot = nextSlot;
    visibility = createUpstreamViewVisibility(slot, rankingHost);
    attach();
    if (rankingActive) {
      onActivate();
      visibility.hideForRanking();
      applyActiveTabState();
    }
  });
  observer.observe(root, { childList: true, subtree: true });

  return {
    activate,
    deactivate,
    openCalculationSettings: () => openUpstreamCalculationSettings(slot),
    dispose: () => {
      observer.disconnect();
      deactivate();
      visibility.dispose();
      rankingTab.removeEventListener("click", onRankingTabClick);
      slot.tabList.removeEventListener("click", onNativeTabClick, true);
      rankingTab.remove();
      if (originalParent !== null) {
        const sibling =
          originalNextSibling?.parentNode === originalParent
            ? originalNextSibling
            : null;
        originalParent.insertBefore(rankingHost, sibling);
      }
    },
  };
}
