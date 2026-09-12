export interface UpstreamRankingSlot {
  readonly tabList: HTMLElement;
  readonly workspaceHeader: HTMLElement;
}

/** Locate the first (upper) tab list in the sticky workspace without using labels. */
export function findUpstreamRankingSlot(
  root: ParentNode,
): UpstreamRankingSlot | null {
  const tabLists = [...root.querySelectorAll<HTMLElement>("[role='tablist']")];
  for (const tabList of tabLists) {
    const workspaceHeader = tabList.closest(
      "div[style*='position: sticky']",
    ) as HTMLElement | null;
    if (workspaceHeader === null || workspaceHeader.parentElement === null)
      continue;
    const tabs = tabList.querySelectorAll(":scope > [role='tab']");
    if (tabs.length < 3 || tabs.length > 8) continue;
    if (workspaceHeader.querySelector("[role='tablist']") !== tabList) continue;
    const tabsRoot = tabList.parentElement?.parentElement;
    if (tabsRoot?.parentElement !== workspaceHeader) continue;
    return { tabList, workspaceHeader };
  }
  return null;
}
