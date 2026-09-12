import type { UpstreamRankingSlot } from "./upstreamRankingSlot";

export interface UpstreamViewVisibility {
  hideForRanking(): void;
  restore(): void;
}

/** Hide everything in the upstream workspace except the upper tab list. */
export function createUpstreamViewVisibility(
  slot: UpstreamRankingSlot,
  rankingHost: HTMLElement,
): UpstreamViewVisibility {
  const originalDisplays = new Map<HTMLElement, string>();
  const hide = (element: Element): void => {
    if (!(element instanceof HTMLElement) || element === rankingHost) return;
    if (!originalDisplays.has(element)) {
      originalDisplays.set(element, element.style.display);
    }
    element.style.display = "none";
  };
  const restore = (): void => {
    for (const [element, display] of originalDisplays)
      element.style.display = display;
    originalDisplays.clear();
  };
  const hideForRanking = (): void => {
    restore();
    let visibleBranch: Element = slot.tabList;
    while (visibleBranch.parentElement !== slot.workspaceHeader) {
      const parent = visibleBranch.parentElement;
      if (parent === null) break;
      for (const sibling of parent.children)
        if (sibling !== visibleBranch) hide(sibling);
      visibleBranch = parent;
    }
    for (const child of slot.workspaceHeader.children) {
      if (child !== visibleBranch) hide(child);
    }
    const workspace = slot.workspaceHeader.parentElement;
    if (workspace !== null) {
      for (const child of workspace.children) {
        if (child !== slot.workspaceHeader && child !== rankingHost)
          hide(child);
      }
    }
  };
  return { hideForRanking, restore };
}
