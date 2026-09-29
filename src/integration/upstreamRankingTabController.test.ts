// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { createUpstreamRankingTabController } from "./upstreamRankingTabController";

function workspace(id: string): string {
  return `<div id="${id}">
    <div class="sticky" style="position: sticky">
      <div><div class="tabs"><div role="tablist">
        <button class="Mui-selected" role="tab" aria-selected="true" tabindex="0">RP</button>
        <button role="tab" aria-selected="false" tabindex="-1">Energy</button>
        <button role="tab" aria-selected="false" tabindex="-1">Rating</button>
        <button role="tab" aria-selected="false" tabindex="-1">Team</button>
      </div><span class="MuiTabs-indicator"></span></div></div>
      <div class="result">result</div>
    </div>
    <div class="editor">editor</div>
  </div>`;
}

describe("createUpstreamRankingTabController", () => {
  it("owns ranking selection and restores the native tab state", () => {
    document.body.innerHTML = `<main id="root">${workspace("workspace")}</main><div id="suite"><div id="host"></div></div>`;
    const root = document.getElementById("root");
    const host = document.getElementById("host");
    const onActivate = vi.fn();
    if (!(root instanceof HTMLElement) || !(host instanceof HTMLElement))
      throw new Error("fixture is invalid");

    const controller = createUpstreamRankingTabController({
      root,
      rankingHost: host,
      label: "ランキング",
      onActivate,
    });
    expect(controller).not.toBeNull();
    const rankingTab = root.querySelector<HTMLElement>(
      "[data-pokesleep-extension-ranking]",
    );
    expect(rankingTab?.textContent).toContain("ランキング");

    rankingTab?.click();
    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(rankingTab?.classList.contains("Mui-selected")).toBe(true);
    expect(host.style.display).toBe("block");
    expect(root.querySelector<HTMLElement>(".editor")?.style.display).toBe(
      "none",
    );
    expect(
      root.querySelector<HTMLElement>(".MuiTabs-indicator")?.style.visibility,
    ).toBe("hidden");

    root.querySelector<HTMLButtonElement>("[role='tab']")?.click();
    expect(rankingTab?.classList.contains("Mui-selected")).toBe(false);
    expect(host.style.display).toBe("none");
    expect(root.querySelector<HTMLElement>(".editor")?.style.display).toBe("");
    expect(
      root
        .querySelector<HTMLElement>("[role='tab']")
        ?.classList.contains("Mui-selected"),
    ).toBe(true);
    controller?.dispose();
  });

  it("reattaches once after an upstream render and keeps ranking active", async () => {
    document.body.innerHTML = `<main id="root">${workspace("first")}</main><div id="suite"><div id="host"></div></div>`;
    const root = document.getElementById("root");
    const host = document.getElementById("host");
    const onActivate = vi.fn();
    if (!(root instanceof HTMLElement) || !(host instanceof HTMLElement))
      throw new Error("fixture is invalid");
    const controller = createUpstreamRankingTabController({
      root,
      rankingHost: host,
      label: "ランキング",
      onActivate,
    });
    root
      .querySelector<HTMLButtonElement>("[data-pokesleep-extension-ranking]")
      ?.click();

    root.innerHTML = workspace("second");
    await new Promise((resolve) => setTimeout(resolve, 0));

    const rankingTabs = root.querySelectorAll(
      "[data-pokesleep-extension-ranking]",
    );
    expect(rankingTabs).toHaveLength(1);
    expect(rankingTabs[0]?.classList.contains("Mui-selected")).toBe(true);
    expect(host.parentElement?.id).toBe("second");
    expect(host.style.display).toBe("block");
    expect(onActivate).toHaveBeenCalledTimes(2);
    controller?.dispose();
  });

  it("fails closed when the upstream tab contract is missing", () => {
    document.body.innerHTML = `<main id="root"></main><div id="host"></div>`;
    const root = document.getElementById("root");
    const host = document.getElementById("host");
    if (!(root instanceof HTMLElement) || !(host instanceof HTMLElement))
      throw new Error("fixture is invalid");
    expect(
      createUpstreamRankingTabController({
        root,
        rankingHost: host,
        label: "ランキング",
        onActivate: vi.fn(),
      }),
    ).toBeNull();
  });
});
