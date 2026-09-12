// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { findUpstreamRankingSlot } from "./upstreamRankingSlot";
import { createUpstreamViewVisibility } from "./upstreamViewVisibility";

describe("createUpstreamViewVisibility", () => {
  it("hides newly rendered upstream content and restores it", () => {
    document.body.innerHTML = `
      <main><div id="workspace">
        <div id="sticky" style="position: sticky">
          <div><div role="tablist"><button role="tab">RP</button><button role="tab">Energy</button><button role="tab">Rating</button></div><div id="selected-sp">SP</div></div>
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
    expect(document.getElementById("selected-sp")?.style.display).toBe("none");
    expect(document.getElementById("energy-chart")?.style.display).toBe("none");
    expect(document.getElementById("editor")?.style.display).toBe("none");
    expect(slot.tabList.style.display).not.toBe("none");
    visibility.restore();
    expect(document.getElementById("editor")?.style.display).toBe("grid");

    document.getElementById("energy-chart")?.remove();
    const replacement = document.createElement("div");
    slot.workspaceHeader.append(replacement);
    visibility.hideForRanking();
    expect(replacement.style.display).toBe("none");
  });
});
