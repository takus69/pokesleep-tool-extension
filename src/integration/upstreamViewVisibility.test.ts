// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { findUpstreamRankingSlot } from "./upstreamRankingSlot";
import { createUpstreamViewVisibility } from "./upstreamViewVisibility";

describe("createUpstreamViewVisibility", () => {
  it("hides newly rendered upstream content and restores it", async () => {
    document.body.innerHTML = `
      <main><div id="workspace">
        <header id="site-header">個体値計算機 for ポケモンスリープ</header>
        <aside id="site-notice">お知らせ</aside>
        <div id="sticky" style="position: sticky">
          <div><div><div role="tablist"><button role="tab">RP</button><button role="tab">Energy</button><button role="tab">Rating</button><button role="tab">Team</button></div></div></div><div id="selected-sp">SP</div>
          <svg id="sp-chart" style="position: absolute"></svg>
          <div id="energy-chart">chart</div>
        </div>
        <div id="extension-host"></div><div id="editor" style="display: grid">editor</div>
      </div></main>`;
    const slot = findUpstreamRankingSlot(document);
    const host = document.getElementById("extension-host");
    expect(slot).not.toBeNull();
    expect(host).toBeInstanceOf(HTMLElement);
    if (slot === null || !(host instanceof HTMLElement)) return;
    const visibility = createUpstreamViewVisibility(slot, host);

    visibility.hideForRanking();
    expect(document.getElementById("site-header")?.style.display).not.toBe(
      "none",
    );
    expect(document.getElementById("site-notice")?.style.display).not.toBe(
      "none",
    );
    expect(document.getElementById("selected-sp")?.style.display).toBe("none");
    expect(document.getElementById("sp-chart")?.style.display).toBe("none");
    expect(document.getElementById("energy-chart")?.style.display).toBe("none");
    expect(document.getElementById("editor")?.style.display).toBe("none");
    expect(slot.tabList.style.display).not.toBe("none");
    visibility.restore();
    expect(document.getElementById("editor")?.style.display).toBe("grid");

    visibility.hideForRanking();
    document.getElementById("energy-chart")?.remove();
    const replacement = document.createElement("div");
    slot.workspaceHeader.append(replacement);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(replacement.style.display).toBe("none");
    visibility.dispose();
  });
});
