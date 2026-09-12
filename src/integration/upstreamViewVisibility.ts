import type { UpstreamRankingSlot } from "./upstreamRankingSlot";

export interface UpstreamViewVisibility {
  hideForRanking(): void;
  restore(): void;
  dispose(): void;
}

/** Hide everything in the upstream workspace except the upper tab list. */
export function createUpstreamViewVisibility(
  slot: UpstreamRankingSlot,
  rankingHost: HTMLElement,
): UpstreamViewVisibility {
  const originalDisplays = new Map<HTMLElement | SVGElement, string>();
  let rankingActive = false;
  let refreshQueued = false;
  const hide = (element: Element): void => {
    if (!(element instanceof HTMLElement) && !(element instanceof SVGElement))
      return;
    if (element === rankingHost) return;
    if (!originalDisplays.has(element)) {
      originalDisplays.set(element, element.style.display);
    }
    element.style.display = "none";
  };
  const restore = (): void => {
    rankingActive = false;
    for (const [element, display] of originalDisplays)
      element.style.display = display;
    originalDisplays.clear();
  };
  const hideForRanking = (): void => {
    for (const [element, display] of originalDisplays)
      element.style.display = display;
    originalDisplays.clear();
    rankingActive = true;
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
      let child = slot.workspaceHeader.nextElementSibling;
      while (child !== null) {
        const next = child.nextElementSibling;
        if (child !== rankingHost) hide(child);
        child = next;
      }
    }
  };
  const observer = new MutationObserver(() => {
    if (!rankingActive || refreshQueued) return;
    refreshQueued = true;
    queueMicrotask(() => {
      refreshQueued = false;
      if (rankingActive) hideForRanking();
    });
  });
  observer.observe(slot.workspaceHeader, { childList: true, subtree: true });
  const workspace = slot.workspaceHeader.parentElement;
  if (workspace !== null) observer.observe(workspace, { childList: true });

  const dispose = (): void => {
    restore();
    observer.disconnect();
  };
  return { hideForRanking, restore, dispose };
}
