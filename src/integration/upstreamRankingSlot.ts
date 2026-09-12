export interface UpstreamRankingSlot {
  readonly tabList: HTMLElement;
  readonly workspaceHeader: HTMLElement;
}

/** Locate the upper RP/strength/rating tab contract without depending on labels. */
export function findUpstreamRankingSlot(
  root: ParentNode,
): UpstreamRankingSlot | null {
  const tabLists = [...root.querySelectorAll<HTMLElement>("[role='tablist']")];
  const tabList = tabLists.find((candidate) => {
    const tabs = candidate.querySelectorAll(":scope > [role='tab']");
    return tabs.length === 3;
  });
  if (tabList === undefined) return null;
  const workspaceHeader = tabList.closest(
    "div[style*='position: sticky']",
  ) as HTMLElement | null;
  if (workspaceHeader === null || workspaceHeader.parentElement === null)
    return null;
  return { tabList, workspaceHeader };
}
