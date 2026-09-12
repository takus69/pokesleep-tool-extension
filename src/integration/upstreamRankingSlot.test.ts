// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { findUpstreamRankingSlot } from "./upstreamRankingSlot";

describe("findUpstreamRankingSlot", () => {
  it("selects the three-item upper tab list inside the sticky workspace", () => {
    document.body.innerHTML = `
      <main id="root">
        <div style="position: sticky; top: 0px">
          <div><div role="tablist">
            <button role="tab">RP</button>
            <button role="tab">Strength</button>
            <button role="tab">Rating</button>
          </div></div>
          <section>current result</section>
          <div><div role="tablist">
            <button role="tab">Pokemon</button>
            <button role="tab">Box</button>
          </div></div>
        </div>
        <section>current editor</section>
      </main>`;

    const slot = findUpstreamRankingSlot(document);

    expect(slot?.tabList.textContent).toContain("RP");
    expect(slot?.workspaceHeader.style.position).toBe("sticky");
  });

  it("fails closed when the expected upper tab contract changes", () => {
    document.body.innerHTML = `<div role="tablist"><button role="tab">Only one</button></div>`;
    expect(findUpstreamRankingSlot(document)).toBeNull();
  });
});
