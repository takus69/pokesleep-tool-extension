import type { UpstreamRankingSlot } from "./upstreamRankingSlot";

function findParameterTab(workspaceHeader: HTMLElement): HTMLElement | null {
  const tabLists = [
    ...workspaceHeader.querySelectorAll<HTMLElement>("[role='tablist']"),
  ];
  for (const tabList of tabLists.slice(1)) {
    const tabs = tabList.querySelectorAll<HTMLElement>(":scope > [role='tab']");
    if (tabs.length >= 3) return tabs[2] ?? null;
  }
  return null;
}

/** Open the upstream Energy > Parameter UI through its own React event handlers. */
export async function openUpstreamCalculationSettings(
  slot: UpstreamRankingSlot,
): Promise<boolean> {
  const upperTabs = slot.tabList.querySelectorAll<HTMLElement>(
    ":scope > [role='tab']:not([data-pokesleep-extension-ranking])",
  );
  const energyTab = upperTabs[1];
  if (energyTab === undefined) return false;
  energyTab.click();

  const current = findParameterTab(slot.workspaceHeader);
  if (current !== null) {
    current.click();
    return true;
  }

  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      const parameterTab = findParameterTab(slot.workspaceHeader);
      if (parameterTab === null) return;
      observer.disconnect();
      clearTimeout(timeout);
      parameterTab.click();
      resolve(true);
    });
    const timeout = window.setTimeout(() => {
      observer.disconnect();
      resolve(false);
    }, 1500);
    observer.observe(slot.workspaceHeader, { childList: true, subtree: true });
  });
}
